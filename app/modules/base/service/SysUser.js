import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import { Repository, cache, logger } from "chanjs";
import { insertGetId } from "../../../common/db-utils.js";

// 用户状态缓存 TTL：auth 中间件鉴权时查询，停用/删除时由 controller 主动清除，保证变更即时生效
const USER_STATUS_TTL = 60 * 1000;

class SysUserService extends Repository {
  constructor() {
    super("sys_user");
  }

  /**
   * @description 校验用户是否处于启用状态（鉴权用）
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} true=启用可用；false=停用/不存在
   * 缓存 60s；账号停用/删除时 controller 调用 #clearUserStatusCache 立即失效，
   * 避免"停用后旧 token 仍可访问"的窗口
   */
  async isActive(userId) {
    if (!userId) return false;
    const cacheKey = `user-status:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached != null) return cached === true;
    try {
      const row = await this.db(this.tableName)
        .where("id", userId)
        .select("status")
        .first();
      const active = !!row && String(row.status) === "1";
      cache.set(cacheKey, active, USER_STATUS_TTL);
      return active;
    } catch (err) {
      // DB 故障 fail-closed：查不到状态就视为停用，拒绝访问，避免刚停用的用户趁 DB 抖动继续用
      logger.error("[SysUserService.isActive] 查询失败，拒绝访问:", err.message);
      return false;
    }
  }

  /**
   * @description 清除指定用户的启用状态缓存（停用/删除/恢复时调用）
   * @param {number} userId - 用户ID
   */
  clearUserStatusCache(userId) {
    if (userId) {
      cache.del(`user-status:${userId}`);
    }
  }

  async find(username) {
    const res = await this.findOne({
      query: { username },
      fields: ["id", "username", "password", "status"],
    });
    return res;
  }

  /**
   * @description 检查用户是否拥有指定角色
   * @param {number} userId - 用户ID
   * @param {string} roleKey - 角色key
   * @returns {Promise<boolean>}
   */
  async hasRole(userId, roleKey) {
    const role = await this.db("sys_user_role as ur")
      .join("sys_role as r", "ur.role_id", "r.id")
      .where("ur.user_id", userId)
      .where("r.key", roleKey)
      .first();
    return !!role;
  }

  /**
   * @description 判断一组角色ID中是否包含 super 角色
   * @param {number[]} roleIds - 角色ID数组
   * @returns {Promise<boolean>}
   */
  async roleIdsContainSuper(roleIds) {
    const ids = Array.isArray(roleIds) ? roleIds : [roleIds].filter(Boolean);
    if (!ids.length) return false;
    const row = await this.db("sys_role")
      .whereIn("id", ids)
      .where("key", "super")
      .first();
    return !!row;
  }

  /**
   * @description 获取用户角色key列表
   * @param {number} userId - 用户ID
   * @returns {Promise<string[]>} 角色key数组
   */
  async getRoleKeys(userId) {
    const roles = await this.db("sys_user_role as ur")
      .join("sys_role as r", "ur.role_id", "r.id")
      .select("r.key")
      .where("ur.user_id", userId);
    return roles.map((r) => r.key);
  }

  /**
   * @description 根据用户ID查找用户信息
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>} 返回找到的用户对象或null
   */
  async detail(id) {
    const res = await this.findById(id, {
      fields: ["id", "username", "avatar", "status"],
    });

    if (!res.success || !res.data) {
      return res;
    }

    const user = res.data;

    const roles = await this.db("sys_user_role as ur")
      .join("sys_role as r", "ur.role_id", "r.id")
      .select("r.id", "r.name", "r.key")
      .where("ur.user_id", id);

    user.roles = roles || [];
    user.roleIds = roles.map((r) => r.id);
    user.roleKeys = roles.map((r) => r.key);

    return { success: true, code: 0, msg: '查询成功', data: user };
  }

  /**
   * @description 删除用户（级联删除角色关联）
   * @param {number} id - 要删除的用户ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      await this.db.transaction(async (trx) => {
        await trx("sys_user_role").where("user_id", id).del();
        await trx(this.tableName).where("id", id).del();
      });
      return { success: true, code: 0, msg: '删除成功', data: { affectedRows: 1 } };
    } catch (err) {
      logger.error("[SysUserService.delete] 失败:", err.message);
      throw err;
    }
  }

  /**
   * @description 获取分页用户列表
   * @param {Object} options - 分页查询参数 { cur, pageSize }
   * @param {boolean} isSuperAdmin - 当前用户是否为超级管理员
   * @param {number} uid - 当前登录用户ID（非超管时只返回自己）
   * @returns {Promise<Object>} 包含用户列表、总数等信息的对象
   */
  async list({ cur = 1, pageSize = 10 }, isSuperAdmin = false, uid = null) {
    // 分页参数健壮化：缺省/非法时取默认值并钳制（旧版 NaN offset 会导致翻页失效）
    const page = parsePage(cur);
    const size = parsePageSize(pageSize);
    const offset = (page - 1) * size;

    // 行级权限：超管可见全部；非超管仅可见自己（SQL 层过滤，count/pageSize 一致）
    const applyScope = (q) => {
      if (!isSuperAdmin && uid) {
        q.where("u.id", uid);
      }
      return q;
    };

    // count 与 list 并行执行（applyScope 为函数引用，每次调用独立应用条件，安全并行）
    const [totalRes, list] = await Promise.all([
      applyScope(this.db("sys_user as u")).count("u.id", { as: "count" }).first(),
      applyScope(this.db("sys_user as u"))
        .select("u.id", "u.username", "u.status")
        .limit(size)
        .offset(offset)
        .orderBy("u.id", "asc"),
    ]);
    const total = parseInt(totalRes?.count || 0, 10);

    // 批量查询角色，避免N+1
    const userIds = list.map((item) => item.id);
    const roleMap = {};
    if (userIds.length > 0) {
      const roles = await this.db("sys_user_role as ur")
        .join("sys_role as r", "ur.role_id", "r.id")
        .select("ur.user_id", "r.id as role_id", "r.name as role_name", "r.key as role_value")
        .whereIn("ur.user_id", userIds);

      roles.forEach((role) => {
        if (!roleMap[role.user_id]) {
          roleMap[role.user_id] = [];
        }
        roleMap[role.user_id].push({
          id: role.role_id,
          name: role.role_name,
          key: role.role_value,
        });
      });
    }

    list.forEach((user) => {
      user.roles = roleMap[user.id] || [];
    });

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total,
        current: page,
        pageSize: size,
        list,
      }
    };
  }

  /**
   * @description 创建用户（支持多角色）
   * @param {Object} params - 用户数据
   * @param {number[]} params.role_ids - 角色ID数组
   */
  async create({ role_ids = [], ...params }) {
    let userId;

    try {
      await this.db.transaction(async (trx) => {
        // MySQL 不支持 .returning("id")（仅 PostgreSQL/SQLite 支持），用 insert 返回数组取首元素
        const newUserId = await insertGetId(trx(this.tableName), params);
        userId = newUserId;

        const ids = Array.isArray(role_ids) ? role_ids : [role_ids].filter(Boolean);
        if (ids.length > 0) {
          const userRoleData = ids.map((roleId) => ({
            user_id: userId,
            role_id: roleId,
          }));
          await trx("sys_user_role").insert(userRoleData);
        }
      });
      return { success: true, code: 0, msg: '创建成功', data: { id: userId } };
    } catch (err) {
      logger.error("[SysUserService.create] 失败:", err.message);
      throw err;
    }
  }

  /**
   * @description 更新用户（支持多角色）
   * @param {Object} params - 用户数据
   * @param {number} params.userId - 用户ID
   * @param {number[]} [params.role_ids] - 角色ID数组；不传（undefined）则不修改角色关联（如仅改密码）
   */
  async update({ userId, role_ids, ...params }) {
    delete params.role_id; // 旧单角色字段不写入用户表
    try {
      await this.db.transaction(async (trx) => {
        if (Object.keys(params).length > 0) {
          await trx(this.tableName).where("id", userId).update(params);
        }

        // role_ids 未传（undefined）→ 不碰角色关联（防止仅改密码时误清角色）
        if (role_ids !== undefined) {
          const ids = Array.isArray(role_ids) ? role_ids : [role_ids].filter(Boolean);

          // 先删除旧关联，再插入新关联
          await trx("sys_user_role").where("user_id", userId).del();

          if (ids.length > 0) {
            const insertData = ids.map((roleId) => ({
              user_id: userId,
              role_id: roleId,
            }));
            await trx("sys_user_role").insert(insertData);
          }
        }
      });
      return { success: true, code: 0, msg: '更新成功', data: { affectedRows: 1 } };
    } catch (err) {
      logger.error("[SysUserService.update] 失败:", err.message);
      throw err;
    }
  }
}

export default new SysUserService();

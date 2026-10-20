import { Repository, logger } from "chanjs";
import { insertGetId } from "../../../common/db-utils.js";
import { permMatches } from "../../../common/permission-utils.js";

class SysRoleService extends Repository {
  constructor() {
    super("sys_role");
  }

  /**
   * @description 根据角色ID查找角色信息
   * @param {number} id - 角色ID
   * @returns {Promise<Object|null>} 返回找到的角色对象或null
   */
  async detail(id) {
    const res = await this.findById(id);
    if (!res || !res.data) return res;
    // 附带该角色已授权的规范权限码，供前端权限树回显（挂在 res.data 上随 success 透传）
    const perms = await this.db("sys_role_permission")
      .join("sys_permission", "sys_permission.id", "sys_role_permission.perm_id")
      .where("sys_role_permission.role_id", id)
      .select("sys_permission.perm_key");
    res.data.permCodes = (perms || []).map((p) => p.perm_key);
    return res;
  }

  /**
   * @description 删除角色（级联删除角色菜单、用户角色关联）
   * @param {number} id - 要删除的角色ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    // 系统内置角色禁止删除（前端按钮已置灰，此处兜底防接口直调）
    const BUILTIN_ROLE_KEYS = ["super", "admin", "visitor", "editor"];
    const target = await this.db(this.tableName).where("id", id).select("key").first();
    if (target && BUILTIN_ROLE_KEYS.includes(target.key)) {
      return { success: false, code: 1008, msg: "系统内置角色不可删除" };
    }
    try {
      await this.db.transaction(async (trx) => {
        await trx("sys_role_menu").where("role_id", id).del();
        await trx("sys_user_role").where("role_id", id).del();
        await trx("sys_role_permission").where("role_id", id).del();
        await trx(this.tableName).where("id", id).del();
      });
      return { success: true, code: 0, msg: '删除成功', data: { affectedRows: 1 } };
    } catch (err) {
      logger.error("[SysRoleService.delete] 失败:", err.message);
      throw err;
    }
  }

  /**
   * @description 获取分页角色列表
   * @param {Object} options - 分页查询参数
   * @returns {Promise<Object>} 包含角色列表、总数等信息的对象
   */
  async list(query) {
    let res = await this.query({
      current: 1,
      pageSize: this.limit,
      query,
      fields: ["id", "name", "key", "sort", "status", "created_at"],
    });
    return res;
  }

  /**
   * 根据规范权限码写入角色权限关联（替代旧的“菜单反推接口”）
   * - 先清空该角色原有关联
   * - 对每个 permCode：在 sys_permission 中查/建，再写入 sys_role_permission
   * @param {Object} trx - 事务对象
   * @param {number} roleId - 角色ID
   * @param {Array<string>} permCodes - 规范权限码数组（如 ['cms:article:list']）
   */
  async syncRolePermissions(trx, roleId, permCodes) {
    const codes = (permCodes || [])
      .map((c) => String(c).trim())
      .filter((c) => c.length > 0);

    await trx("sys_role_permission").where("role_id", roleId).del();

    if (codes.length === 0) return;

    // 查或建规范权限记录（保证 sys_permission 始终覆盖所用到的码）
    // 一次性查出已有权限，避免循环逐码 SELECT（N+1）
    const existing = await trx("sys_permission").whereIn("perm_key", codes)
      .select("id", "perm_key");
    const permMap = new Map(existing.map((e) => [e.perm_key, e.id]));

    const missing = codes.filter((c) => !permMap.has(c));
    if (missing.length) {
      await trx("sys_permission").insert(
        missing.map((c) => ({
          perm_key: c,
          perm_type: c.charAt(0),
          name: c,
          menu_id: 0,
        }))
      );
      // 回查刚插入的 id（按 perm_key 精确匹配）
      const inserted = await trx("sys_permission").whereIn("perm_key", missing)
        .select("id", "perm_key");
      for (const r of inserted) permMap.set(r.perm_key, r.id);
    }

    const rolePermData = codes.map((c) => ({ role_id: roleId, perm_id: permMap.get(c) }))
      .filter((d) => d.perm_id);
    if (rolePermData.length > 0) {
      await trx("sys_role_permission").insert(rolePermData);
    }
  }

  /**
   * 校验待赋权的 permCodes 是否 ⊆ 调用者自身权限（防提权）
   * 用 permMatches 做动词分组归一比较（find/detail→list，save→create+update）
   * @param {Array<string>} permCodes 待分配的规范权限码
   * @param {Array<string>} callerPerms 调用者自身权限标识列表（含 *:*:* 视为超管）
   * @returns {{ok:boolean, keys?:string[]}}
   */
  async _checkPermSubset(permCodes, callerPerms) {
    if (!Array.isArray(callerPerms) || callerPerms.includes('*:*:*')) return { ok: true };
    const codes = (permCodes || []).map((c) => String(c).trim()).filter(Boolean);
    if (!codes.length) return { ok: true };
    const forbidden = codes.filter((c) => !callerPerms.some((p) => permMatches(c, p)));
    return forbidden.length ? { ok: false, keys: forbidden } : { ok: true };
  }

  // 增
  async create({ roleData, menuIds = [], permCodes = [], callerPerms }) {
    // 安全：禁止创建 key='super' 的角色（防止普通管理员权限提升）
    if (roleData && roleData.key === 'super') {
      return { success: false, code: 1008, msg: '禁止创建超级管理员角色' };
    }
    // 安全：禁止赋予超出自身权限范围的权限（防提权）
    const subset = await this._checkPermSubset(permCodes, callerPerms);
    if (!subset.ok) {
      return { success: false, code: 1008, msg: `无权分配超出自身权限的权限: ${subset.keys.join(',')}` };
    }
    // sys_role.sort 为 NOT NULL 且无默认值（strict 模式拒绝），缺省时取当前最大 sort+1，兜底 0
    // 剥离 detail 回显可能带回来的非表字段（permCodes 单独走 permCodes 参数）
    const { permCodes: _nestedPerms, ...roleDataFinal } = roleData || {};
    if (roleDataFinal.sort === undefined || roleDataFinal.sort === null) {
      const maxRow = await this.db(this.tableName).max("sort as maxSort").first();
      roleDataFinal.sort = (maxRow && maxRow.maxSort ? maxRow.maxSort : 0) + 1;
    }
    let roleId;
    try {
      await this.db.transaction(async (trx) => {
        // PG 需 RETURNING 才能拿到 id；MySQL/SQLite insert 返回 [id]
        const newRoleId = await insertGetId(trx(this.tableName), roleDataFinal);
        roleId = newRoleId;

        const roleMenuData = menuIds.map((menuId) => ({
          role_id: roleId,
          menu_id: menuId,
        }));

        if (roleMenuData.length > 0) {
          await trx("sys_role_menu").insert(roleMenuData);
        }

        // 按规范权限码直接写入角色权限关联（不再反推）
        await this.syncRolePermissions(trx, roleId, permCodes);
      });
      return { success: true, code: 0, msg: '创建成功', data: { id: roleId } };
    } catch (err) {
      logger.error("[SysRoleService.create] 失败:", err.message);
      throw err;
    }
  }

  //改
  async update({ roleId, roleData, menuIds = [], permCodes = [], callerPerms } = {}) {

    // 安全：禁止将「非 super 角色」改造成 super（防止权限提升）
    // 判据不能只看 roleData.key === 'super'：编辑超管自己时前端会原样回传 key='super'，
    //    那样连超管都保存不了。正确判据 = 新 key 是 super 且**目标角色原本不是 super**
    //    （含目标不存在，保守拦截）。
    if (roleData && roleData.key === 'super') {
      const target = await this.db(this.tableName).where("id", roleId).select("key").first();
      if (!target || target.key !== "super") {
        return { success: false, code: 1008, msg: "禁止修改为超级管理员角色" };
      }
    }

    // 安全（P0）：目标角色是 super 时仅超管可编辑，防止持有 role:update 的普通管理员
    //    清空/篡改超管角色的权限与名称（口径同 SysUser controller「非super不能改super用户」）
    if (!Array.isArray(callerPerms) || !callerPerms.includes('*:*:*')) {
      const targetIsSuper = await this.db(this.tableName).where("id", roleId).where("key", "super").first("id");
      if (targetIsSuper) {
        return { success: false, code: 1008, msg: "无权修改超级管理员角色" };
      }
    }

    // 安全：禁止赋予超出自身权限范围的权限（防提权）
    const subset = await this._checkPermSubset(permCodes, callerPerms);
    if (!subset.ok) {
      return { success: false, code: 1008, msg: `无权分配超出自身权限的权限: ${subset.keys.join(',')}` };
    }

    try {
      await this.db.transaction(async (trx) => {
        // 剥离系统列与非表字段（前端可能把 detail 回显的 permCodes 一并放回 roleData）
        // update_by 必须一并剥离：前端整包回传的 update_by 是空串，写库会把更新者清空
        const { id, created_at, create_by, updated_at, update_by, permCodes: _nestedPerms, ...cleanRoleData } = roleData;

        if (Object.keys(cleanRoleData).length > 0) {
          await trx("sys_role").where("id", roleId).update(cleanRoleData);
        }

        const existingMenuIdsResult = await trx("sys_role_menu")
          .select("menu_id")
          .where("role_id", roleId);
        const existingMenuIds = existingMenuIdsResult.map(
          (item) => item.menu_id
        );

        const idsToDelete = existingMenuIds.filter(
          (id) => !menuIds.includes(id)
        );

        if (idsToDelete.length > 0) {
          await trx("sys_role_menu")
            .whereIn("menu_id", idsToDelete)
            .andWhere("role_id", roleId)
            .del();
        }

        const insertData = menuIds
          .filter((menuId) => !existingMenuIds.includes(menuId))
          .map((menuId) => ({
            role_id: roleId,
            menu_id: menuId,
          }));

        if (insertData.length > 0) {
          await trx("sys_role_menu").insert(insertData);
        }

        // 按规范权限码直接写入角色权限关联（不再反推）
        await this.syncRolePermissions(trx, roleId, permCodes);
      });
      return { success: true, code: 0, msg: '更新成功', data: { affectedRows: 1 } };
    } catch (err) {
      logger.error("[SysRoleService.update] 失败:", err.message);
      throw err;
    }
  }
}

export default new SysRoleService();

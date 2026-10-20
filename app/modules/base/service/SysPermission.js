/**
 * 权限码（sys_permission 表）服务
 * ---------------------------------------------------------------
 * 职责：权限码的 CRUD、用户权限查询（allPermission）、角色权限树（tree）、
 *       手动同步接口归属（sync，实际同步逻辑在 SysPermRoute）。
 * 注：接口归属（sys_perm_route）→ SysPermRoute；权限树资源（sys_perm_resource）→ SysPermResource。
 */
import { Repository, logger } from "chanjs";
import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import SysPermRoute from "./SysPermRoute.js";
import { insertGetId } from "../../../common/db-utils.js";

class SysPermissionService extends Repository {
  constructor() {
    super("sys_permission");
  }

  // 查询用户的所有权限标识
  async allPermission(userId) {
    try {
      const roles = await this.db("sys_user_role")
        .select("role_id")
        .where("user_id", userId);

      if (!roles || roles.length === 0) {
        return { success: true, code: 0, msg: "查询成功", data: [] };
      }

      const roleIds = roles.map((r) => r.role_id);

      // 超管兜底：绑定 key='super' 的角色 = 拥有全部权限。sys_role_permission 可能没有
      //    *:*:* 这一行，缺此兜底超管会被当普通角色、连「权限管理」页都 403。
      //    与 SysMenu / SysUserRole 的同款判定保持一致，super 语义收敛到唯一入口。
      const superRole = await this.db("sys_role")
        .whereIn("id", roleIds)
        .where("key", "super")
        .first();
      if (superRole) {
        return { success: true, code: 0, msg: "查询成功", data: ["*:*:*"] };
      }

      const perms = await this.db("sys_role_permission")
        .join("sys_permission", "sys_permission.id", "sys_role_permission.perm_id")
        .whereIn("sys_role_permission.role_id", roleIds)
        .select("sys_permission.perm_key")
        .distinct();

      const permKeys = (perms || [])
        .map((item) => item.perm_key)
        .filter((key) => typeof key === "string" && key.trim().length > 0);

      return { success: true, code: 0, msg: "查询成功", data: permKeys };
    } catch (error) {
      logger.error(`[SysPermission.allPermission] 查询用户 ${userId} 权限出错:`, error.message);
      return { success: false, code: 5001, msg: "查询失败", data: [] };
    }
  }

  // 返回权限树（驱动前端角色权限配置 UI）
  // 标准形态：按菜单树组织 —— 每菜单节点挂其权限资源动作（叶子=权限码），未挂菜单的资源归"其他权限"
  async tree() {
    try {
      const [menus, resources] = await Promise.all([
        // 按 order_num 排序（与左侧导航一致），id 兜底稳定排序
        this.db("sys_menu").select("id", "pid", "title", "path", "perms").orderBy("order_num").orderBy("id"),
        this.db("sys_perm_resource").select("module", "resource_key", "name", "actions", "menu_id").orderBy("sort"),
      ]);
      const permByMenu = {};
      const uncategorized = [];
      for (const r of resources) {
        const item = { key: r.resource_key, module: r.module, name: r.name, actions: r.actions || [] };
        if (r.menu_id > 0) (permByMenu[r.menu_id] = permByMenu[r.menu_id] || []).push(item);
        else uncategorized.push(item);
      }
      const withPerm = new Set(Object.keys(permByMenu).map(Number));
      const build = (pid) =>
        menus
          .filter((m) => m.pid === pid)
          .map((m) => {
            const children = build(m.id);
            if (!withPerm.has(m.id) && children.length === 0) return null;
            const node = { id: m.id, pid: m.pid, title: m.title, path: m.path };
            if (children.length) node.children = children;
            return node;
          })
          .filter(Boolean);
      const data = { menus: build(0), permByMenu, uncategorized };
      return { success: true, code: 0, msg: "查询成功", data };
    } catch (error) {
      logger.error("[SysPermission.tree] 查询出错:", error.message);
      return { success: true, code: 0, msg: "查询成功", data: { menus: [], permByMenu: {}, uncategorized: [] } };
    }
  }

  // 手动同步路由权限：解析各模块 router.js，未配置归属的接口自动归类写入 sys_perm_route（后台按钮触发）
  async sync() {
    const added = await SysPermRoute.syncRoutePermissions();
    return {
      success: true,
      code: 0,
      msg: added.length ? `同步完成，新增 ${added.length} 个接口归属` : "接口权限已是最新，无需同步",
      data: { added: added.length },
    };
  }

  // 权限列表（带分页和搜索）
  async list(query = {}) {
    try {
      const { keywords, perm_type, current = 1, pageSize = 20 } = query;
      const page = parsePage(current);
      const size = parsePageSize(pageSize, 20);

      // 抽取公共查询条件构建器，保证 count/list 条件一致
      // 通过 perm_key 拆分 module+resource_key 关联 sys_perm_resource.menu_id → sys_menu，
      // 还原「权限码所属菜单」展示（sys_permission.menu_id 已统一置 0，不能直接 join）
      // 多库兼容拆分 perm_key（形如 module:resource:action，取前两段）：
      //   MySQL SUBSTRING_INDEX / PG split_part / SQLite 无 split 函数 → instr+substr 手工切。
      //   注意标识符不加引号：反引号 PG 不认，双引号 MySQL 默认不认，裸名三库通吃（均非保留字）。
      const dbType = (process.env.DB_TYPE || "mysql").toLowerCase();
      const permKey = "sys_permission.perm_key";
      const restExpr = dbType === "sqlite" ? `substr(${permKey}, instr(${permKey}, ':') + 1)` : null;
      const moduleExpr =
        dbType === "pg"
          ? `split_part(${permKey}, ':', 1)`
          : dbType === "sqlite"
          ? `CASE WHEN instr(${permKey}, ':') > 0 THEN substr(${permKey}, 1, instr(${permKey}, ':') - 1) ELSE ${permKey} END`
          : `SUBSTRING_INDEX(${permKey}, ':', 1)`;
      const resourceExpr =
        dbType === "pg"
          ? `split_part(${permKey}, ':', 2)`
          : dbType === "sqlite"
          ? `CASE WHEN instr(${restExpr}, ':') > 0 THEN substr(${restExpr}, 1, instr(${restExpr}, ':') - 1) ELSE ${restExpr} END`
          : `SUBSTRING_INDEX(SUBSTRING_INDEX(${permKey}, ':', 2), ':', -1)`;
      const buildQuery = () => {
        const db = this.db;
        let q = db("sys_permission")
          .leftJoin("sys_perm_resource as pr", function () {
            this.on("pr.module", db.raw(moduleExpr))
              .andOn("pr.resource_key", db.raw(resourceExpr));
          })
          .leftJoin("sys_menu", "sys_menu.id", "pr.menu_id");
        if (keywords) {
          q = q.where(function () {
            this.where("sys_permission.name", "like", `%${keywords}%`)
              .orWhere("sys_permission.perm_key", "like", `%${keywords}%`);
          });
        }
        if (perm_type) {
          q = q.andWhere("sys_permission.perm_type", perm_type);
        }
        return q;
      };

      const totalRes = await buildQuery().count("* as count").first();
      const list = await buildQuery()
        .select([
          "sys_permission.id",
          "sys_permission.menu_id",
          "sys_permission.perm_key",
          "sys_permission.perm_type",
          "sys_permission.name",
          "sys_permission.created_at",
          "sys_menu.title as menu_title",
        ])
        .orderBy("sys_permission.id", "desc")
        .limit(size)
        .offset((page - 1) * size);

      return { success: true, code: 0, msg: "查询成功", data: { list, total: totalRes.count || 0 } };
    } catch (error) {
      logger.error("[SysPermission.list] 查询出错:", error.message);
      return { success: false, code: 5001, msg: "查询失败", data: { list: [], total: 0 } };
    }
  }

  // 权限详情
  async detail(id) {
    try {
      const info = await this.db("sys_permission").where("id", id).first();
      return { success: true, code: 0, msg: "查询成功", data: info || null };
    } catch (error) {
      logger.error("[SysPermission.detail] 查询出错:", error.message);
      return { success: false, code: 5001, msg: "查询失败", data: null };
    }
  }

  // 新增权限
  async create(data) {
    try {
      const { menu_id, perm_key, perm_type, name } = data;
      if (!perm_key || !perm_type) {
        return { success: false, code: 1007, msg: "权限标识和类型不能为空" };
      }

      // knex insert 在 MySQL 下返回数组 [id]，需解构取首元素
      const id = await insertGetId(this.db("sys_permission"), {
        menu_id: menu_id || 0,
        perm_key,
        perm_type,
        name: name || "",
      });

      return { success: true, code: 0, msg: "创建成功", data: { id } };
    } catch (error) {
      logger.error("[SysPermission.create] 出错:", error.message);
      return { success: false, code: 5001, msg: "创建失败" };
    }
  }

  // 修改权限
  async update(data) {
    try {
      const { id, menu_id, perm_key, perm_type, name } = data;
      if (!id) {
        return { success: false, code: 1007, msg: "ID不能为空" };
      }

      const updateData = {};
      if (menu_id !== undefined) updateData.menu_id = menu_id;
      if (perm_key !== undefined) updateData.perm_key = perm_key;
      if (perm_type !== undefined) updateData.perm_type = perm_type;
      if (name !== undefined) updateData.name = name;

      await this.db("sys_permission").where("id", id).update(updateData);
      return { success: true, code: 0, msg: "更新成功" };
    } catch (error) {
      logger.error("[SysPermission.update] 出错:", error.message);
      return { success: false, code: 5001, msg: "更新失败" };
    }
  }

  // 删除权限（事务内同时删除角色关联，防孤儿数据）
  async delete(id) {
    try {
      if (!id) {
        return { success: false, code: 1007, msg: "ID不能为空" };
      }

      await this.db.transaction(async (trx) => {
        await trx("sys_role_permission").where("perm_id", id).del();
        await trx("sys_permission").where("id", id).del();
      });
      return { success: true, code: 0, msg: "删除成功" };
    } catch (error) {
      logger.error("[SysPermission.delete] 出错:", error.message);
      return { success: false, code: 5001, msg: "删除失败" };
    }
  }
}

export default new SysPermissionService();

/**
 * 权限树资源（sys_perm_resource 表）服务
 * ---------------------------------------------------------------
 * 职责：模块 → 资源 → 动作（角色权限树的来源）的 CRUD 与选择数据源。
 * - resourceList / resourceSave / resourceDelete：后台「权限资源」页维护
 * - permResources：模块→资源→动作 数据源（接口归属弹窗的级联选择器用）
 */
import { Repository, logger } from "chanjs";

class SysPermResourceService extends Repository {
  constructor() {
    super("sys_perm_resource");
  }

  // 归属选择数据源：模块 → 资源 → 动作（与角色权限树同源）
  async permResources() {
    const resources = await this.db("sys_perm_resource").select("module", "resource_key", "name", "actions").orderBy("sort");
    const byModule = {};
    for (const r of resources) {
      (byModule[r.module] = byModule[r.module] || []).push({ key: r.resource_key, name: r.name, actions: r.actions || [] });
    }
    const data = Object.keys(byModule).map((mod) => ({ module: mod, resources: byModule[mod] }));
    return { success: true, code: 0, msg: "查询成功", data };
  }

  // 资源列表（分页 + 关键词 + 模块筛选）
  async resourceList(query = {}) {
    try {
      const current = parseInt(query.current) || 1;
      const pageSize = parseInt(query.pageSize) || 20;
      const { keywords = "", module = "" } = query;
      // count 独立查询（不带 select/join，避免 ONLY_FULL_GROUP_BY 报错）
      const countBuilder = this.db("sys_perm_resource");
      if (keywords) {
        countBuilder.where((w) => {
          w.where("name", "like", `%${keywords}%`).orWhere("resource_key", "like", `%${keywords}%`);
        });
      }
      if (module) countBuilder.andWhere("module", module);
      const [{ total }] = await countBuilder.count({ total: "*" });

      let q = this.db("sys_perm_resource")
        .leftJoin("sys_perm_module", "sys_perm_module.module", "sys_perm_resource.module")
        .leftJoin("sys_menu", "sys_menu.id", "sys_perm_resource.menu_id")
        .select("sys_perm_resource.*", "sys_perm_module.name as module_name", "sys_menu.title as menu_title");
      if (keywords) {
        q = q.where((w) => {
          w.where("sys_perm_resource.name", "like", `%${keywords}%`).orWhere("sys_perm_resource.resource_key", "like", `%${keywords}%`);
        });
      }
      if (module) q = q.andWhere("sys_perm_resource.module", module);
      const list = await q
        .orderBy("sys_perm_resource.module")
        .orderBy("sys_perm_resource.sort")
        .offset((current - 1) * pageSize)
        .limit(pageSize);
      return { success: true, code: 0, msg: "查询成功", data: { total: Number(total), list } };
    } catch (error) {
      logger.error("[SysPermResource.resourceList] 查询出错:", error.message);
      return { success: false, code: 5001, msg: "查询失败", data: { total: 0, list: [] } };
    }
  }

  // 新增/编辑权限资源（module+resource_key 唯一；编辑时锁定 module+resource_key，只改 name/actions/menu_id/sort）
  async resourceSave(data = {}) {
    const { id, module, resource_key, name, actions, menu_id, sort } = data;
    if (!module || !resource_key || !name) {
      return { success: false, code: 1007, msg: "模块、资源key、资源名不能为空" };
    }
    const actionArr = Array.isArray(actions) && actions.length
      ? [...new Set(actions.map((a) => String(a).toLowerCase()))].filter((a) => ["list", "create", "update", "delete"].includes(a))
      : ["list"];
    const payload = {
      module,
      resource_key,
      name,
      actions: JSON.stringify(actionArr),
      menu_id: Number(menu_id) || 0,
      sort: Number(sort) || 0,
    };
    if (id) {
      await this.db("sys_perm_resource").where("id", id).update(payload);
      return { success: true, code: 0, msg: "更新成功" };
    }
    // 新增：模块分组不存在时自动创建
    const modRow = await this.db("sys_perm_module").where("module", module).first();
    if (!modRow) {
      await this.db("sys_perm_module").insert({ module, name: module, sort: 99 });
    }
    const dup = await this.db("sys_perm_resource").where({ module, resource_key }).first();
    if (dup) return { success: false, code: 1007, msg: "该模块下已存在同名资源" };
    await this.db("sys_perm_resource").insert(payload);
    return { success: true, code: 0, msg: "创建成功" };
  }

  // 删除权限资源（角色权限树将不再出现该资源的权限项）
  async resourceDelete(id) {
    if (!id) return { success: false, code: 1007, msg: "ID不能为空" };
    await this.db("sys_perm_resource").where("id", id).del();
    return { success: true, code: 0, msg: "删除成功" };
  }
}

export default new SysPermResourceService();

import { Repository, logger } from "chanjs";
import { pickFields } from "../../../common/model-utils.js";

class SysMenuService extends Repository {
  constructor() {
    super("sys_menu");
  }

  /**
   * 解析角色可用的菜单 ID
   *
   * @returns {{ allIds: number[], directIds: number[] }}
   *   - directIds：sys_role_menu 里**直接授权**的菜单 —— 唯一真相源，决定"这个角色有什么权限"
   *   - allIds   ：directIds ∪ 其全部祖先 —— **只为让树形完整**，祖先本身不构成授权
   *
   * 两者**必须分开返回**：补父级的唯一目的是 buildTree 挂得上子节点，祖先**不是授权**。
   *   若合并成一个 id 列表，可见菜单型祖先会混进前端 allowedNames → 侧边栏凭空出现未授权菜单（越权泄露）。
   *
   * 优化：一次性查询 sys_menu 全表，内存构建 id→pid 映射，避免 while 循环 N 次查询
   */
  async resolveMenuIdsWithParents(roleIds) {
    try {
      if (!roleIds || roleIds.length === 0) {
        return { allIds: [], directIds: [] };
      }

      // 步骤1: 获取角色直接关联的菜单ID
      const directMenus = await this.db("sys_role_menu")
        .select("menu_id")
        .whereIn("role_id", roleIds);

      if (!directMenus || directMenus.length === 0) {
        return { allIds: [], directIds: [] };
      }

      // 步骤2: 一次性查询所有菜单的 id → pid 映射（1 次查询替代原 N 次循环）
      const allMenus = await this.db("sys_menu").select("id", "pid");
      const menuMap = new Map(); // id → pid
      for (const m of allMenus) {
        menuMap.set(m.id, m.pid);
      }

      // 步骤3: 内存中向上递归收集所有父级 ID
      const directIds = [...new Set(directMenus.map((m) => m.menu_id))];
      const allMenuIds = new Set(directIds);
      const queue = [...directIds];

      while (queue.length > 0) {
        const currentId = queue.shift();
        const pid = menuMap.get(currentId);
        if (pid && pid !== 0 && !allMenuIds.has(pid)) {
          allMenuIds.add(pid);
          queue.push(pid);
        }
      }

      return { allIds: [...allMenuIds], directIds };
    } catch (error) {
      logger.error('[SysMenu.resolveMenuIdsWithParents] 查询菜单ID时出错:', error.message);
      return { allIds: [], directIds: [] };
    }
  }

  // 构建标准树结构
  buildTree(arr, pid = 0) {
    const result = [];
    arr.forEach((item) => {
      if (item.pid === pid) {
        const node = { ...item };
        const children = this.buildTree(arr, item.id);
        if (children.length > 0) {
          node.children = children;
        }
        result.push(node);
      }
    });
    return result;
  }

  async allRouter(userId) {
    try {
      const roles = await this.db("sys_user_role")
        .select("role_id")
        .where("user_id", userId);

      if (!roles || roles.length === 0) {
        return { success: true, code: 0, msg: '查询成功', data: { perms: [], routers: [] } };
      }

      const roleIds = roles.map((role) => role.role_id);

      // 超管兜底：super 角色直接返回全菜单树（与 allPermission 的 *:*:* 兜底对齐），
      // 避免种子漏挂全菜单时侧边栏空白。普通角色走下方常规按角色挂菜单逻辑。
      const superRows = await this.db("sys_user_role")
        .join("sys_role", "sys_role.id", "sys_user_role.role_id")
        .where("sys_user_role.user_id", userId)
        .select("sys_role.key");
      if (superRows.some((r) => r.key === "super")) {
        const allMenus = await this.db("sys_menu")
          .whereIn("type", ["M", "C"])
          .select([
            "id", "pid", "title", "name", "path", "perms", "type", "is_show", "is_cache", "icon",
          ])
          .orderBy("order_num", "asc");
        return { success: true, code: 0, msg: '查询成功', data: { perms: ["*:*:*"], routers: this.buildTree(allMenus) } };
      }

      const { allIds: allMenuIds, directIds } = await this.resolveMenuIdsWithParents(roleIds);
      const directSet = new Set(directIds);

      if (!allMenuIds || allMenuIds.length === 0) {
        return { success: true, code: 0, msg: '查询成功', data: { perms: [], routers: [] } };
      }

      // 查询所有授权菜单（包括按钮权限 F），用于返回完整权限列表
      // 移除 query，前端本地维护组件路径
      // 增加 is_cache，前端用于控制 keep-alive
      // 增加 icon，前端用于渲染菜单图标（含插件菜单动态注册的图标）
      const allMenuDetails = await this.db("sys_menu")
        .whereIn("id", allMenuIds)
        .select([
          "id",
          "pid",
          "title",
          "name",
          "path",
          "perms",
          "type",
          "is_show",
          "is_cache",
          "icon",
        ])
        .orderBy("order_num", "asc");

      // 权限列表：只认**直接授权**的菜单。
      // 继承来的祖先（只为挂树而存在）不得贡献任何权限码。
      const perms = (allMenuDetails || [])
        .filter((menu) => menu.perms && directSet.has(menu.id))
        .map((menu) => menu.perms);

      // 路由树只保留目录和菜单类型，按钮/接口不显示在侧边栏
      // 继承来的祖先只作「容器」，必须中立化，否则会越权露出（见 resolveMenuIdsWithParents 注释）：
      //   · name 置空   → 不进前端 allowedNames → 前端不注册该路由，不能靠 URL 直达
      //   · is_show='2' → SideBarItem 不渲染它，也不会把它算成"有可见子菜单"的分组
      //   目录（type='M'）例外：它 name 本就为空，且需要保留 is_show 充当可见子菜单的分组壳。
      const routerNodes = (allMenuDetails || [])
        .filter((menu) => menu.type !== 'F')
        .map((menu) => {
          if (directSet.has(menu.id) || menu.type === 'M') return { ...menu };
          return { ...menu, name: '', is_show: '2' };
        });

      // 后端构建标准树结构
      const routers = this.buildTree(routerNodes);

      return { success: true, code: 0, msg: '查询成功', data: { perms, routers } };
    } catch (error) {
      logger.error(`[SysMenu.allRouter] 查询用户 ${userId} 的菜单时出错:`, error.message);
      return { success: false, code: 5001, msg: '查询失败', data: { perms: [], routers: [] } };
    }
  }

  /**
   * @description 根据菜单ID查找菜单信息
   * @param {number} id - 菜单ID
   * @returns {Promise<Object>} 返回标准格式的查询结果
   */
  async detail(id) {
    const res = await this.findById(id);
    return res;
  }

  /**
   * @description 删除菜单（检查子菜单和角色关联）
   * @param {number} id - 要删除的菜单ID
   * @returns {Promise<Object>} 返回标准格式的删除结果
   */
  async delete(id) {
    // 检查是否有子菜单
    const children = await this.db(this.tableName).where("pid", id).count("id as count").first();
    if (children && children.count > 0) {
      return { success: false, code: 1008, msg: '该菜单下存在子菜单，无法删除' };
    }

    // 检查是否被角色关联
    const roleMenus = await this.db("sys_role_menu").where("menu_id", id).count("role_id as count").first();
    if (roleMenus && roleMenus.count > 0) {
      return { success: false, code: 1008, msg: '该菜单已被角色使用，无法删除' };
    }

    const res = await this.delById(id);
    return res;
  }

  /**
   * @description 获取分页菜单列表
   * @param {Object} options - 分页查询参数
   * @returns {Promise<Object>} 返回标准格式的查询结果
   */
  async list(query) {
    const res = await this.query({
      current: 1,
      pageSize: this.limit,
      query,
      fields: [
        "id",
        "name",
        "pid",
        "order_num",
        "path",
        "title",
        "is_frame",
        "is_show",
        "perms",
        "type",
      ],
      sort: { order_num: "asc" },
    });
    return res;
  }

  // 可写字段白名单（对齐 sys_menu 表结构，排除 id/时间/操作人等系统列，防批量赋值）
  static WRITE_FIELDS = [
    'pid', 'title', 'name', 'order_num', 'path', 'component', 'icon',
    'query', 'perms', 'type', 'is_frame', 'is_cache', 'is_show', 'status', 'remark',
  ];

  // 增
  async create(body) {
    return await this.insert(pickFields(body, SysMenuService.WRITE_FIELDS));
  }

  //改
  async update(body) {
    const { id, ...rest } = body;
    return await this.updateById(id, pickFields(rest, SysMenuService.WRITE_FIELDS));
  }
}

export default new SysMenuService();

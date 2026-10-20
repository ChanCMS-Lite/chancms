/**
 * 根据后端返回的 name 列表，过滤本地路由表
 * @param {Array} routes 本地完整路由表 asyncRoutes
 * @param {Array} allowedNames 后端返回的有权限的路由 name 列表
 * @returns {Array} 过滤后的路由表
 */
export function filterAsyncRoutes(routes, allowedNames) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(allowedNames, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, allowedNames)
      }
      res.push(tmp)
    }
  })
  return res
}

/**
 * 判断路由是否有权限
 * - 目录类路由（有 children，无 name 或 name 为空）：直接放行，靠子路由过滤
 * - 入口类路由（xxx-add / xxx-edit）：对应的 xxx-index 有权限即放行
 *   🔴 2026-09-12 二次定稿：游客必须能打开新增/编辑页面（看得到界面与数据），
 *   只不能提交。「入口放开 + 提交按钮置灰 + 后端 403」三段式；
 *   （中间曾短暂改为「edit 严格按 sys_menu」，会让游客连编辑页都打不开，已回退）
 * - 叶子路由（有 name）：必须在 allowedNames 中才放行
 * - 无 name 的路由：放行（如 Layout 容器）
 */
function hasPermission(allowedNames, route) {
  // 目录类路由：有 children 且无 name（或 name 为空）→ 放行，靠子节点过滤
  if (route.children && route.children.length > 0 && !route.name) {
    return true
  }
  // 无 name 的路由放行（如 Layout 容器）
  if (!route.name) {
    return true
  }

  // 直接命中权限
  if (allowedNames.includes(route.name)) {
    return true
  }

  // 入口类路由（xxx-add / xxx-edit）：只要对应的 index 路由有权限就放行
  // 🔴 2026-09-12 二次定稿：游客需要「看得到」新增/编辑页面（能打开表单、看到数据），
  //    只是不能提交。门禁改由「提交类按钮 v-permission 置灰 + 后端 403」承担，
  //    不再用路由 404 挡入口（那样游客连界面都看不到，与需求相反）。
  const match = route.name.match(/^(.+)-(add|edit)$/)
  if (match) {
    const indexName = `${match[1]}-index`
    if (allowedNames.includes(indexName)) {
      return true
    }
  }

  // 🔴 2026-09-17：这里**没有任何白名单例外**。
  //   历史上曾有一整块 standaloneRoutes 兜底（dashboard/siteinfo 无条件放行；
  //   oss/template 按 resource 目录粗判；menu/config/operlog/configtype 四者
  //   「任一命中即全放行」），后果是：角色只要配了 configtype，没配过的
  //   「菜单管理」「操作日志」也会显示出来。已全部删除 ——
  //   菜单可见性**只认 sys_role_menu**（后端 allRouter 返回的 name 列表），
  //   接口可调用性由 sys_perm_route + sys_role_permission 独立负责，两者不得互相推导。
  //
  //   注：「个人中心」原为唯一硬编码放行的页面（name=profile），现已收编为
  //   `/user/detail/:id`（name=user-detail），同样走 sys_role_menu 授权，
  //   不再需要任何特例。（旧 `/profile` 链接由 constantRoutes 的 redirect 兜底。）

  return false
}

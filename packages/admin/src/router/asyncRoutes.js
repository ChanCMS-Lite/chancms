/**
 * 本地完整路由表
 * - 所有路由平铺，都作为 Layout 的直接子路由
 * - 目录（M类）用 path 前缀分组，通过 meta 控制侧边栏层级显示
 * - name：与 sys_menu.name 一致，用于权限匹配
 * - meta.noCache：true 时不缓存（编辑页默认 true）
 * - meta.activeMenu：侧边栏高亮的菜单路径（编辑页指向列表页）
 * - meta.isDir：true 表示目录，不渲染 component，只作为分组
 *
 * 后端只返回 name 列表，前端用 name 匹配此表过滤出有权限的路由
 * 所有路由平铺，不嵌套 Layout，避免重复渲染侧边栏
 *
 * 🔴 本表**不再携带权限码**（原 meta.perms 已全部移除，2026-09-17）：
 *    权限只有两个真实口径，别在这里造第三份：
 *      1) 路由级：后端 /base/menu/allRouter 返回的 name 列表 →
 *         utils/permission.js#filterAsyncRoutes 按 name 过滤本表；
 *      2) 按钮级：后端 sys_permission → stores/user.js#perms →
 *         v-permission 指令（directives/permission.js）。
 *    历史上这里曾有 33 处 meta.perms，全仓零读取（纯死配置），
 *    且有漂移（如 'base:config-type:list'，后端真实码是 'base:configType:list'），
 *    一旦有人以为它生效并据此做拦截，会整片误判 —— 故整体删除。
 */
export const asyncRoutes = [
{
    path: '/site',
    name: 'site',
    meta: { title: '站点管理', icon: 'Monitor', isDir: true }
  },
{
    path: '/content',
    name: 'content',
    meta: { title: '内容管理', icon: 'Grid', isDir: true }
  },
{
    path: '/extend',
    name: 'extend',
    meta: { title: '功能管理', icon: 'Operation', isDir: true }
  },
{
    path: '/sys',
    name: 'sys',
    meta: { title: '系统管理', icon: 'Setting', isDir: true }
  },
{
    path: '/member',
    name: 'member',
    meta: { title: '会员管理', icon: 'User', isDir: true }
  },
{
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/base/dashboard/index.vue'),
    meta: { title: '网站信息', icon: 'DataLine', affix: true }
  },
{
    path: '/siteinfo',
    name: 'siteinfo',
    component: () => import('@/views/cms/site/index.vue'),
    meta: { title: '站点设置' }
  },
{
    path: '/category',
    name: 'category-index',
    component: () => import('@/views/cms/category/index.vue'),
    meta: { title: '栏目管理' }
  },
{
    path: '/category/add',
    name: 'category-add',
    component: () => import('@/views/cms/category/edit.vue'),
    meta: { title: '新增栏目', noCache: true, activeMenu: '/category' }
  },
{
    path: '/category/edit/:id',
    name: 'category-edit',
    component: () => import('@/views/cms/category/edit.vue'),
    meta: { title: '修改栏目', noCache: true, activeMenu: '/category' }
  },
{
    path: '/article',
    name: 'article-index',
    component: () => import('@/views/cms/article/index.vue'),
    meta: { title: '文章管理' }
  },
{
    path: '/article/add',
    name: 'article-add',
    component: () => import('@/views/cms/article/edit.vue'),
    meta: { title: '新增文章', noCache: true, activeMenu: '/article' }
  },
{
    path: '/article/edit/:id',
    name: 'article-edit',
    component: () => import('@/views/cms/article/edit.vue'),
    meta: { title: '修改文章', noCache: true, activeMenu: '/article' }
  },
{
    path: '/page',
    name: 'page-index',
    component: () => import('@/views/cms/page/index.vue'),
    meta: { title: '单页管理' }
  },
{
    path: '/page/add',
    name: 'page-add',
    component: () => import('@/views/cms/page/edit.vue'),
    meta: { title: '新增单页', noCache: true, activeMenu: '/page' }
  },
{
    path: '/page/edit/:id',
    name: 'page-edit',
    component: () => import('@/views/cms/page/edit.vue'),
    meta: { title: '修改单页', noCache: true, activeMenu: '/page' }
  },
{
    path: '/slide',
    name: 'slide-index',
    component: () => import('@/views/cms/slide/index.vue'),
    meta: { title: '轮播管理' }
  },
{
    path: '/slide/add',
    name: 'slide-add',
    component: () => import('@/views/cms/slide/edit.vue'),
    meta: { title: '新增轮播', noCache: true, activeMenu: '/slide' }
  },
{
    path: '/slide/edit/:id',
    name: 'slide-edit',
    component: () => import('@/views/cms/slide/edit.vue'),
    meta: { title: '修改轮播', noCache: true, activeMenu: '/slide' }
  },
{
    path: '/tag',
    name: 'tag-index',
    component: () => import('@/views/cms/tag/index.vue'),
    meta: { title: '标签管理' }
  },
{
    path: '/tag/add',
    name: 'tag-add',
    component: () => import('@/views/cms/tag/edit.vue'),
    meta: { title: '新增标签', noCache: true, activeMenu: '/tag' }
  },
{
    path: '/tag/edit/:id',
    name: 'tag-edit',
    component: () => import('@/views/cms/tag/edit.vue'),
    meta: { title: '修改标签', noCache: true, activeMenu: '/tag' }
  },
{
    path: '/frag',
    name: 'frag-index',
    component: () => import('@/views/cms/frag/index.vue'),
    meta: { title: '碎片管理' }
  },
{
    path: '/frag/add',
    name: 'frag-add',
    component: () => import('@/views/cms/frag/edit.vue'),
    meta: { title: '新增碎片', noCache: true, activeMenu: '/frag' }
  },
{
    path: '/frag/edit/:id',
    name: 'frag-edit',
    component: () => import('@/views/cms/frag/edit.vue'),
    meta: { title: '修改碎片', noCache: true, activeMenu: '/frag' }
  },
{
    path: '/friendlink',
    name: 'friendlink-index',
    component: () => import('@/views/cms/friendlink/index.vue'),
    meta: { title: '友情链接' }
  },
{
    path: '/friendlink/add',
    name: 'friendlink-add',
    component: () => import('@/views/cms/friendlink/edit.vue'),
    meta: { title: '新增友链', noCache: true, activeMenu: '/friendlink' }
  },
{
    path: '/friendlink/edit/:id',
    name: 'friendlink-edit',
    component: () => import('@/views/cms/friendlink/edit.vue'),
    meta: { title: '修改友链', noCache: true, activeMenu: '/friendlink' }
  },
{
    path: '/message',
    name: 'message-index',
    component: () => import('@/views/cms/message/index.vue'),
    meta: { title: '消息管理' }
  },
{
    path: '/message/add',
    name: 'message-add',
    component: () => import('@/views/cms/message/edit.vue'),
    meta: { title: '新增消息', noCache: true, activeMenu: '/message' }
  },
{
    path: '/message/edit/:id',
    name: 'message-edit',
    component: () => import('@/views/cms/message/edit.vue'),
    meta: { title: '修改消息', noCache: true, activeMenu: '/message' }
  },
{
    path: '/model',
    name: 'model-index',
    component: () => import('@/views/cms/model/index.vue'),
    meta: { title: '模型管理' }
  },
{
    path: '/model/add',
    name: 'model-add',
    component: () => import('@/views/cms/model/edit.vue'),
    meta: { title: '新增模型', noCache: true, activeMenu: '/model' }
  },
{
    path: '/model/edit/:id',
    name: 'model-edit',
    component: () => import('@/views/cms/model/edit.vue'),
    meta: { title: '修改模型', noCache: true, activeMenu: '/model' }
  },
{
    path: '/model/field',
    name: 'field-index',
    component: () => import('@/views/cms/field/index.vue'),
    meta: { title: '字段管理', noCache: true, activeMenu: '/model' }
  },
{
    path: '/model/field/edit',
    name: 'field-edit',
    component: () => import('@/views/cms/field/edit.vue'),
    meta: { title: '字段修改', noCache: true, activeMenu: '/model' }
  },
{
    path: '/user',
    name: 'user-index',
    component: () => import('@/views/base/user/index.vue'),
    meta: { title: '用户管理' }
  },
{
    path: '/user/add',
    name: 'user-add',
    component: () => import('@/views/base/user/index.vue'),
    meta: { title: '新增用户', noCache: true, activeMenu: '/user' }
  },
{
    path: '/user/edit/:id',
    name: 'user-edit',
    component: () => import('@/views/base/user/index.vue'),
    meta: { title: '修改用户', noCache: true, activeMenu: '/user' }
  },
{
    path: '/user/detail/:id',
    name: 'user-detail',
    component: () => import('@/views/base/user/detail.vue'),
    meta: { title: '用户详情', noCache: true, activeMenu: '/user' }
  },
{
    path: '/role',
    name: 'role-index',
    component: () => import('@/views/base/role/index.vue'),
    meta: { title: '角色管理' }
  },
{
    path: '/role/add',
    name: 'role-add',
    component: () => import('@/views/base/role/index.vue'),
    meta: { title: '新增角色', noCache: true, activeMenu: '/role' }
  },
{
    path: '/role/edit/:id',
    name: 'role-edit',
    component: () => import('@/views/base/role/index.vue'),
    meta: { title: '编辑角色', noCache: true, activeMenu: '/role' }
  },
{
    path: '/menu',
    name: 'menu',
    component: () => import('@/views/base/menu/index.vue'),
    meta: { title: '菜单管理' }
  },
{
    path: '/configtype',
    name: 'configtype',
    component: () => import('@/views/base/config-type/index.vue'),
    meta: { title: '配置字典' }
  },
{
    path: '/configtype/:id',
    name: 'config',
    component: () => import('@/views/base/config/index.vue'),
    meta: { title: '配置列表', noCache: true, activeMenu: '/configtype' }
  },
{
    path: '/operlog',
    name: 'operlog',
    component: () => import('@/views/base/operLog/index.vue'),
    meta: { title: '操作日志' }
  },
{
    path: '/permission/route',
    name: 'permission-route',
    component: () => import('@/views/base/permission/route.vue'),
    meta: { title: '接口权限' }
  },
{
    path: '/permission/resource',
    name: 'permission-resource',
    component: () => import('@/views/base/permission/resource.vue'),
    meta: { title: '权限资源' }
  },
{
    path: '/user-list',
    name: 'user-list',
    component: () => import('@/views/cms/user-list/index.vue'),
    meta: { title: '会员列表' }
  },
{
    path: '/comment',
    name: 'comment-page',
    component: () => import('@/views/vip/comment/index.vue'),
    meta: { title: '评论列表' }
  },
{
    path: '/favorite',
    name: 'favorite-page',
    component: () => import('@/views/vip/favorite/index.vue'),
    meta: { title: '收藏列表' }
  },
  ]

// 注册路由时过滤掉目录虚拟路由
const routerRoutes = asyncRoutes.filter(route => !route.meta?.isDir)
export default routerRoutes

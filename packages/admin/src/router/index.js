import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import NProgress from 'nprogress' // 引入nprogress插件
import 'nprogress/nprogress.css' // 这个nprogress样式必须引入
// 你可以根据需要自定义 NProgress 的样式和行为
NProgress.configure({ showSpinner: false }); // 关闭右上角的旋转效果
export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/base/login/index.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/redirect',
    name: 'RedirectPage',
    component: () => import('@/views/base/redirect/index.vue'),
    meta: {
      title: '重定向',
      hidden: true,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/dashboard',
    children: [],
  },
  // 旧「个人中心」入口兼容：/profile 已收编为 /user/detail/:id（用户详情页）。
  // 🔴 放在 constantRoutes（恒定注册，不受 sys_role_menu 过滤）而不是 asyncRoutes，
  //    这样旧书签/外部链接不会 404 —— 它本身不渲染任何页面，只是把人送到新地址。
  {
    path: '/profile',
    name: 'ProfileRedirect',
    redirect: () => {
      const uid = userStore().userInfo?.id
      return uid ? `/user/detail/${uid}` : '/login'
    },
    meta: { title: '个人中心' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/base/404.vue'),
    meta: {
      title: '404',
    },
  },
]

//导出最终路由
export const routes = constantRoutes

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
  routes,
})


/**
 * 路由拦截
 * 1.登录态以服务端会话为准（见下方 verifySession）
 * 2.通过路由和 name 过滤出对应权限的路由，然后动态添加到路由上面
 * router.beforeEach(async (to, from, next)
 */
const whiteList = ['/login', '/404', '/redirect'] // 白名单
import { userStore } from "@/stores/user";

/**
 * 动态路由是否已注册到 router 实例
 *
 * 🔴 必须是「可复位」的状态：模块级布尔值在 SPA 内登出 / 切换账号后不会自动归位，
 *    下一个账号进站时守卫会直接放行 → 沿用上一个账号已注册的动态路由，
 *    守卫也拦不住（页面已在路由表里），属于前端可见的越权。
 *    因此登出时必须调用 resetDynamicRoutes() 回收。
 */
let _routesAdded = false

/**
 * 从「按 sys_role_menu 过滤后的路由表」里挑第一个可落地的页面
 * - 依次避开：
 *   ① 参数化路径（/user/detail/:id、/xxx/edit/:id —— 缺上下文参数，落上去是个空页面）
 *   ② 新增/编辑入口（xxx-add / xxx-edit）
 *   ③ 目录伪路由（meta.isDir —— 本表所有路由平铺，目录类只用来配侧边栏图标，
 *      **没有 component**，落上去是个空壳，绝不能当首页）
 * - 供登录落点兜底使用：角色未授权 dashboard 时，改跳这里而不是落到 404
 */
function firstAllowedPath(menuList) {
  const isEntry = (r) => /-(add|edit)$/.test(r.name || '')
  const isDir = (r) => r.meta?.isDir === true
  const cand = (menuList || []).filter(
    (r) => r.path && r.path !== '/' && !r.path.includes(':') && !isEntry(r) && !isDir(r)
  )
  return cand.length ? cand[0].path : ''
}

/**
 * 判断路径是否真的注册进了路由表（catch-all 的 NotFound 不算）
 * 🔴 2026-09-17：菜单可见性收紧到「只认 sys_role_menu」后，默认首页 /dashboard 也可能
 *    因未授权而没被注册。用 router.resolve 检查时，未注册路径会匹配到
 *    `/:pathMatch(.*)*`（name=NotFound），必须把它排除，否则永远"可达"。
 */
function isReachable(path) {
  const r = router.resolve(path)
  return r.matched.some((m) => m.name && m.name !== 'NotFound')
}

/** router.addRoute 的返回值（移除函数），登出 / 换账号时逐个执行 */
let _routeRemovers = []

/** 把过滤后的路由挂到 Layout 下，并记下移除函数以便后续回收 */
function addDynamicRoutes(list) {
  list.forEach((route) => {
    if (route && route.path) {
      _routeRemovers.push(router.addRoute("Layout", route))
    }
  })
  _routesAdded = true
}

/**
 * 回收全部动态路由并复位标记
 *
 * 调用时机：登出 / 切换账号 / 会话失效（stores/user.js#logout）。
 * 不调用的话，一个新账号会「继承」上一个账号的路由表。
 */
export function resetDynamicRoutes() {
  _routeRemovers.forEach((remove) => {
    try { remove() } catch { /* 可能已被移除，忽略 */ }
  })
  _routeRemovers = []
  _routesAdded = false
}

router.beforeEach(async (to) => {
  // 开始进度条
  NProgress.start();
  const user = userStore();

  // 白名单（登录页 / 重定向页 / 404）直接放行
  if (whiteList.includes(to.path)) {
    // 已确认登录还去登录页 → 回首页，避免重复登录
    if (to.path === "/login" && user.isAuthenticated) {
      return { path: "/dashboard" };
    }
    return true;
  }

  // 🔴 登录态判定与「服务端凭证」挂钩，不看本地缓存：
  //    sessionStorage 里的 isAuthenticated 是浏览器可写的，用户可以手工改成 true，
  //    真正有效的凭证是后端下发的登录 cookie（前端读不到、也改不了）。
  //    因此每个页面会话（冷启动后）第一次导航时，都向服务端确认一次会话是否仍然有效：
  //      - 有效 → 恢复登录态继续；
  //      - 无效（cookie 过期 / 已被 logout 拉黑 / 从未登录）→ 视为未登录，跳登录页。
  //    这样「改 sessionStorage 骗过守卫」不再成立，也避免旧 bundle 时代
  //    「刷新后以为还在线、实际全是 401」的假在线状态。
  if (!user.sessionVerified) {
    const ok = await user.verifySession();
    if (!ok) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }

  // 路由已注册：仍需保证落点可达（登录后被送到默认首页，可能因未授权而没注册）
  if (_routesAdded) {
    if (!isReachable(to.path)) {
      const fallback = firstAllowedPath(user.menuList)
      if (fallback && fallback !== to.path) return { path: fallback }
    }
    return true;
  }

  //首次：获取菜单并注册路由
  try {
    await user.getMenuList();
    //把过滤后的路由注册到 Layout 下
    addDynamicRoutes(user.menuList);
  } catch (e) {
    console.error('[Router] getMenuList 失败:', e)
    // 菜单拉取失败：跳回登录页清登录态
    await user.logout()
    return { path: "/login" }
  }

  //触发重定向，让动态路由生效
  // 🔴 登录落点兜底（2026-09-17）：动态路由是「按 sys_role_menu 过滤后」注册的，
  //    若该角色未授权默认首页 /dashboard，/ 的 redirect 会把用户直接送进 404。
  //    这里注册完成后校验一次目标可达性，不可达就改跳第一个可见页面。
  //    （若该角色一个页面都没授权，则不兜底，交给 404 页呈现"无可用菜单"。）
  if (!isReachable(to.path)) {
    const fallback = firstAllowedPath(user.menuList)
    if (fallback && fallback !== to.path) return { path: fallback }
  }
  return to.fullPath;
});


router.afterEach(() => {
  // 结束进度条
  NProgress.done();
});

router.onError((error) => {
  console.log('Routing error:', error);
  // 动态 import 失败时 error 可能是 ChunkLoadError / Event，message 不保证存在
  // 这里只做日志记录，不自动 reload（避免登录页等场景的死循环）
  const msg = error?.message || String(error) || '';
  if (msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed')) {
    console.warn('[Router] 动态模块加载失败，可能由 dev server 重启/缓存导致，请手动刷新页面');
  }
  NProgress.done(); // 确保进度条停止
});

// 挂到 router 上，便于调试时观察当前是否已注册动态路由
router.dynamicRoutesAdded = () => _routesAdded

export default router;

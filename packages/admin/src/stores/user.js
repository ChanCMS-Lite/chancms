import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { allRouter, allPermission } from '@/api/menu.js'
import { asyncRoutes } from '@/router/asyncRoutes.js'
import { filterAsyncRoutes } from '@/utils/permission.js'
import Login from '@/api/Login.js'

const PERMS_COOKIE_KEY = 'perms'

let _menuLoadingPromise = null

export const userStore = defineStore('user', {
  state: () => {
    return {
      // 登录态一律以**后端登录 cookie** 为凭证，前端不持有 token。
      // isAuthenticated 只是「本页面会话内已确认过」的结果，**不写进持久化**：
      // 每次冷启动都由路由守卫调用 verifySession() 重新向服务端确认，
      // 避免用户手工改 sessionStorage 就能骗过守卫（详见 router/index.js）。
      isAuthenticated: false,
      // 本页面会话是否已向服务端确认过会话（冷启动后首次导航确认一次，确认过就不再重复请求）
      sessionVerified: false,
      userInfo: null,
      menuList: [],      // 平铺路由：用于 router.addRoute 注册
      sidebarTree: [],   // 后端树：用于侧边栏渲染
      // 权限码不再写入 cookie（曾双写镜像到 Cookies['perms']，浏览器可读写、易被本地篡改误导）：
      //   登录后由 getMenuList → allPermission() 拉取 -> setPerms 唯一写入内存；
      //   冷启动进受保护页前路由守卫必先 getMenuList，权限不会为空（见 router/index.js）。
      perms: [],
    }
  },

  actions: {
    setAuthenticated(value = true) {
      this.isAuthenticated = !!value
    },

    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },

    setPerms(perms) {
      // 只写内存（+ pinia persist 不持久化 perms），不再镜像到可读写 cookie：
      // 权限码的单一真相是服务端接口 allPermission()，前端仅用它在内存里做按钮级 UX 拦截。
      this.perms = perms || []
    },

    async getMenuList() {
      // 如果已经有正在进行的请求，复用同一个 Promise
      if (_menuLoadingPromise) return _menuLoadingPromise

      _menuLoadingPromise = (async () => {
        try {
          const res = await allRouter()
          if (res.code == 0) {
            const { routers } = res.data

            // 1. 递归提取所有有权限的 name
            const allowedNames = []
            const extractNames = (list) => {
              list.forEach(item => {
                if (item.name) allowedNames.push(item.name)
                if (item.children) extractNames(item.children)
              })
            }
            extractNames(routers)

            // 2. 用 name 过滤本地路由表（平铺，用于注册）
            // 安全策略（P0-S03）：空菜单不再兜底全量路由，零权限用户只能看到 404/无权限页
            let filtered = filterAsyncRoutes(asyncRoutes, allowedNames)
            this.menuList = filtered

            // 3. 后端树直接用于侧边栏渲染
            this.sidebarTree = routers || []

            // 4. 权限从 sys_permission 单独获取
            const permsRes = await allPermission()
            if (permsRes.code == 0) {
              this.setPerms(permsRes.data || [])
            }
          } else {
            // eslint-disable-next-line no-undef
            ElMessage.error(res.msg || '获取菜单失败')
            throw new Error(res.msg || '获取菜单失败')
          }
        } catch (error) {
          // eslint-disable-next-line no-undef
          ElMessage.error(error.message || '获取菜单失败')
          throw error
        } finally {
          _menuLoadingPromise = null
        }
      })()

      return _menuLoadingPromise
    },

    /**
     * 以「服务端会话」为准确认登录态（路由守卫在冷启动首次导航时调用）
     *
     * 为什么不能直接信 sessionStorage 里的 isAuthenticated：
     *   那只是浏览器可写的普通存储，任何人手工改成 true 都能骗过守卫；
     *   真正的凭证是后端下发的登录 cookie，前端既读不到、也改不了，
     *   唯一可靠的确认方式就是拿它请求一个受保护接口：
     *     - 200 + code 0 → 会话有效，恢复登录态与用户信息
     *     - 401（1001/1002/1010）→ http 拦截器已清态并跳登录，这里只需返回 false
     * @returns {Promise<boolean>} 会话是否有效
     */
    async verifySession() {
      try {
        const res = await Login.userInfo()
        if (res && res.code === 0) {
          this.setAuthenticated(true)
          if (res.data) this.setUserInfo(res.data)
          this.sessionVerified = true
          return true
        }
      } catch (e) {
        // 401 类错误已由 http.js 拦截器统一处理（清登录态 + 跳登录页），此处不重复提示
        console.warn('[user] 会话校验未通过:', e)
      }
      // 无论成败都标记「本会话已确认过」，避免守卫在未登录状态下反复打接口
      this.$reset()
      this.sessionVerified = true
      return false
    },

    async logout() {
      // 调用后端 logout 接口清登录 cookie + token 加入黑名单
      // 前端拿不到、也删不掉服务端下发的 cookie，必须由后端处理
      try {
        await Login.userLogout()
      } catch (e) {
        // 即使后端 logout 失败，仍要清空前端登录态，避免用户卡在登录态
        console.warn('[user] logout API failed, still clearing frontend state:', e)
      }
      this.$reset()
      Cookies.remove('appInfo')
      Cookies.remove('n')
      Cookies.remove('pos')
      Cookies.remove(PERMS_COOKIE_KEY)
      sessionStorage.removeItem('user')
      // 🔴 回收上一账号已注册的动态路由与 _routesAdded 标记：
      //    否则下个账号进站时守卫会直接放行，继承上一个账号的路由表（前端可见的越权）
      try {
        const { resetDynamicRoutes } = await import('@/router/index.js')
        resetDynamicRoutes()
      } catch (e) {
        console.warn('[user] 重置动态路由失败:', e)
      }
    },
  },

  persist: {
    key: 'user',
    storage: sessionStorage,
    // 🔴 只持久化展示用的 userInfo；isAuthenticated **不持久化** ——
    //    登录态每次冷启动都由 verifySession() 向服务端重新确认（登录 cookie 才是唯一凭证），
    //    否则用户手工往 sessionStorage 写个 isAuthenticated:true 就能绕过守卫。
    paths: ['userInfo'],
    beforeRestore: () => {
      // 冷启动不依赖 cookie 恢复权限 —— 权限只由服务端接口加载，
      // 守卫进受保护页前必先 getMenuList()（见 router/index.js）。
      // 保留空实现占位，避免 pinia-persistedstate 对 beforeRestore 的默认行为生效。
    },
  },
})

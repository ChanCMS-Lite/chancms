import axios from 'axios'
import { userStore } from '@/stores/user.js'
import { jsonp } from '@/utils/jsonp.js'

/**
 * HTTP 请求工具
 *
 * ============================================================
 * 业务 code 体系（与后端 chancms-vip 保持一致）
 * ============================================================
 * 0       → 成功
 * 1001    → 认证失败（token 无效/未登录）→ 跳登录
 * 1002    → token 过期 → 跳登录
 * 1003    → 权限不足 → 提示无权限
 * 1004    → 资源不存在 → 提示
 * 1005    → 资源已存在 → 提示
 * 1006    → 参数无效 → 提示
 * 1007    → 参数缺失 → 提示
 * 1008    → 业务处理失败（通用兜底）→ 提示
 * 1009    → 请求过于频繁（限流）→ 提示
 * 1010    → 登录设备异常 → 跳登录
 * 5xxx    → 系统错误 → 提示
 * 6xxx    → 数据库错误 → 提示
 *
 * 前端处理优先级：
 * 1. HTTP Status 异常（401/403/500/502 等）→ 走 axios error 拦截器
 * 2. 业务 code（HTTP 200 但业务失败）→ 走 response 拦截器
 */

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8'
axios.defaults.crossDomain = true //设置cross跨域 并设置访问权限
axios.defaults.withCredentials = true //允许跨域携带cookie信息
axios.defaults.timeout = 10000 //请求超时
// 创建axios实例
let http = axios.create({
  baseURL: '', // api的base_url   import.meta.env.VITE_APP_BASE_API,
})

// request拦截器
// 安全策略（P0-S06）：token 已由后端 HttpOnly cookie 下发，axios 已配置 withCredentials=true，
// cookie 会自动随请求带上，无需在 header 中注入 token
http.interceptors.request.use(
  config => {
    //拦截放行
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error || '网络异常')
  },
)

// 业务 code 段位常量
const CODE = {
  OK: 0,                  // 成功
  AUTH_FAILED: 1001,       // 认证失败
  TOKEN_EXPIRED: 1002,    // token 过期
  FORBIDDEN: 1003,         // 权限不足
  NOT_FOUND: 1004,         // 资源不存在
  CONFLICT: 1005,           // 资源已存在
  PARAM_INVALID: 1006,    // 参数无效
  PARAM_MISSING: 1007,    // 参数缺失
  BUSINESS_FAIL: 1008,    // 业务失败
  RATE_LIMIT: 1009,        // 限流
  DEVICE_ERROR: 1010,      // 登录设备异常
  SERVICE_ERROR: 5001,     // 系统内部错误
  DB_CONNECTION_ERROR: 6001, // 数据库连接失败
}

/**
 * 跳转登录页（清登录态 + 延迟跳转）
 * @param {string} msg - 提示消息
 */
let isRedirecting = false
function redirectToLogin(msg) {
  if (isRedirecting) return
  // 🔴 已经在登录页就**短路**（含退出登录后迟到的在途请求 401）：此刻弹「登录已失效」纯属噪音。
  if (window.location.hash.startsWith('#/login')) return
  const user = userStore()
  // 🔴 2026-09-17 追加：只在「会话中掉线」（isAuthenticated===true）时弹「登录已失效」并清态重载。
  //    冷启动 / 从未登录（isAuthenticated===false）时，会话校验 401 由路由守卫负责跳登录页，
  //    此处若弹"登录已失效"会让**从未登录的新访客**首屏就看到恐吓式提示 —— 即"登录前 token 失效"根因。
  //    路由守卫（router/index.js）才是未登录态跳转的唯一权威；拦截器只负责"已登录 → 掉线"的降级。
  if (!user.isAuthenticated) return
  isRedirecting = true
  user.logout()
  ElNotification({
    title: '提示',
    message: msg || '登录已过期，3秒后跳转到登录页',
    type: 'warning',
    duration: 3000,
  })
  setTimeout(() => {
    // 后台 SPA 可能挂在 /public/admin/ 或经反代挂在其它子路径（如 /admin/）：
    // 不能写死根路径 /public/admin/，用相对当前目录 + hash 跳转，绑定域名/改部署路径后依然正确。
    //
    // 🔴 必须强制重载：只改 hash 时浏览器**不会重新加载文档**（仅触发 hashchange），
    //    内存里上一账号的 Pinia 状态与已注册的动态路由会原样残留 —— 表现为
    //    「地址栏已到登录页，但页面上还是旧账号的界面」，即旧路由没被清掉。
    //    这里先把 hash 归一为登录页（reload 后直接落登录页），再 reload 重建整个运行时。
    //    reload 之后 isRedirecting 会随内存一起归零，无需再手动释放。
    window.location.hash = '#/login'
    window.location.reload()
  }, 3000)
}

// respone拦截器
http.interceptors.response.use(
  response => {
    const { data } = response
    const { code, msg, success } = data

    // 安全策略（P0-S06）：token 续期由后端通过 Set-Cookie 自动完成（HttpOnly），
    // 前端不再读取 x-refresh-token 响应头

    // 1. 成功
    if (code === CODE.OK) {
      return data
    }

    // 2. 认证类（跳登录）
    if (code === CODE.AUTH_FAILED) {
      redirectToLogin(msg || '登录已失效，请重新登录')
      return Promise.reject(msg)
    }
    if (code === CODE.TOKEN_EXPIRED) {
      redirectToLogin(msg || '登录已过期，请重新登录')
      return Promise.reject(msg)
    }
    if (code === CODE.DEVICE_ERROR) {
      redirectToLogin(msg || '登录设备异常，请重新登录')
      return Promise.reject(msg)
    }

    // 3. 权限不足
    if (code === CODE.FORBIDDEN) {
      ElMessage({
        message: msg || '暂无权限',
        type: 'warning',
      })
      return Promise.reject(msg)
    }

    // 3.5 系统错误（5001）：明确提示根因，不跳登录
    if (code === CODE.SERVICE_ERROR) {
      ElMessage({
        message: msg || '系统内部错误，请稍后重试',
        type: 'error',
      })
      return Promise.reject(msg)
    }

    // 3.6 数据库连接错误（6001）：明确提示根因，不跳登录（跳登录也登不进去）
    if (code === CODE.DB_CONNECTION_ERROR) {
      ElMessage({
        message: msg || '数据库连接失败，请稍后重试',
        type: 'error',
      })
      return Promise.reject(msg)
    }

    // 4. 限流
    if (code === CODE.RATE_LIMIT) {
      ElMessage({
        message: msg || '请求过于频繁，请稍后再试',
        type: 'warning',
      })
      return Promise.reject(msg)
    }

    // 5. 其他业务失败（1004/1005/1006/1007/1008/5xxx/6xxx）
    if (success === false) {
      ElMessage({
        message: msg || '操作失败',
        type: 'warning',
      })
      return Promise.reject(msg)
    }

    // 6. 兜底
    ElMessage({
      message: msg || '请求失败',
      type: 'error',
    })
    return Promise.reject(msg)
  },
  error => {
    const { response } = error
    // 认证类（1001/1002/1010）：token 失效/过期/设备异常 → 清 cookie + 跳后台登录页
    // 后端对此类错误返回 HTTP 401，故走 error 拦截器而非 response 拦截器
    const bizCode = response?.data?.code
    if (bizCode === CODE.AUTH_FAILED || bizCode === CODE.TOKEN_EXPIRED || bizCode === CODE.DEVICE_ERROR) {
      redirectToLogin(response?.data?.msg)
      return Promise.reject(error)
    }
    if (response && response.status) {
      const { status, statusText, data } = response
      const codeMessage = {
        400: '请求错误',
        401: '用户没有权限。',
        403: '用户得到授权，但是访问是被禁止的。',
        404: '发出的请求是不存在的记录',
        406: '请求的格式不可得。',
        410: '请求的资源被永久删除',
        422: '验证错误',
        500: '服务器发生错误',
        502: '网关错误。',
        503: '服务不可用，服务器暂时过载或维护。',
        504: '网关超时。',
        505: 'http版本不支持该请求',
      }

      let errorMessage = codeMessage[status] || statusText

      if (data && data.msg) {
        errorMessage = data.msg
      }

      ElMessage({
        message: errorMessage,
        type: 'error',
      })
    } else if (!response) {
      ElMessage({
        message: "网络异常，无法连接到服务器",
        type: 'error',
      })
    }

    console.error(error)
    return Promise.reject(error)
  },
)

// 挂载 jsonp 工具（保留备用，当前业务未调用）
http.jsonp = jsonp

export default http

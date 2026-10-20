import axios from "axios";
import { ElMessage, ElNotification } from "element-plus";
import Cookies from "js-cookie";
import { jsonp } from "@/utils/jsonp.js";
// 注意：不在此处静态 import "@/router"，否则会形成循环依赖
//   router → MainLayout → http → router
// 打包混淆后（obfuscator + manualChunks 分包）会触发 TDZ 报错
// "Cannot access before initialization"，因此改为动态导入（见 redirectToLogin）

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

// 创建axios实例（配置写在 create 参数中，避免污染全局 defaults 影响其他 axios 实例）
let http = axios.create({
  baseURL: "", // api的base_url
  timeout: 10000, // 请求超时
  withCredentials: true, // 允许跨域携带 cookie
  crossDomain: true, // 设置 cross 跨域
  headers: {
    post: { "Content-Type": "application/json; charset=utf-8" }
  }
});

http.interceptors.request.use(
  (config) => {
    // 登录态由后端下发的 cookie（ut）自动携带，前端无需手动设置任何头
    return config;
  },
  (error) => {
    console.error("[HTTP REQUEST ERROR]", error);
    return Promise.reject(error || "网络异常");
  }
);

// 业务 code 段位常量（与后端 chancms-vip/node_modules/chanjs/config/code.js 保持一致）
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
};

/**
 * 清除前端登录态 cookie
 *
 * 统一方案下 ut/un 均为非 HttpOnly，前端可直接清除；
 * 同时仍调用后端 /member/v1/logout 让服务端把 token 拉黑（主动失效）。
 */
function clearUserAuth() {
  Cookies.remove("ut");
  Cookies.remove("un");
}

/**
 * 跳转登录页（调后端 logout 拉黑 token + 清前端登录态 + 延迟跳转）
 * @param {string} msg - 提示消息
 *
 * 说明：项目使用 hash 路由（createWebHashHistory），
 * 不能用 window.location.href = '/login'（会跳到根路径而非 hash 路由），
 * 必须用 router.replace('/login') 走 hash 路由跳转。
 *
 * 防抖：多个请求并发失败时，避免重复弹通知和重复跳转
 */
let isRedirecting = false;
function redirectToLogin(msg) {
  if (isRedirecting) return;
  isRedirecting = true;
  // 调后端 logout 接口让服务端把 token 拉黑（主动失效）
  // 失败也不阻塞跳转（前端登录态已失效，必须跳登录页）
  import('@/utils/cookie.js').then(({ loginOut }) => loginOut()).catch(() => {});
  clearUserAuth();
  ElNotification({
    title: '提示',
    message: msg || '登录已过期，3秒后跳转到登录页',
    type: 'warning',
    duration: 3000,
  });
  setTimeout(() => {
    // token 失效统一跳转到 chancms 官网首页（退出会员中心），而非停留在会员 SPA
    window.location.href = '/';
    // 跳转完成后释放防抖标记
    setTimeout(() => { isRedirecting = false; }, 500);
  }, 3000);
}

// respone拦截器
http.interceptors.response.use(
  (response) => {
    const data = response.data;
    const { code, msg, success } = data;

    // 1. 成功
    if (code === CODE.OK) {
      return Promise.resolve(data);
    }

    // 2. 认证类（跳登录）
    if (code === CODE.AUTH_FAILED) {
      redirectToLogin(msg || '登录已失效，请重新登录');
      return Promise.reject(msg);
    }
    if (code === CODE.TOKEN_EXPIRED) {
      redirectToLogin(msg || '登录已过期，请重新登录');
      return Promise.reject(msg);
    }
    if (code === CODE.DEVICE_ERROR) {
      redirectToLogin(msg || '登录设备异常，请重新登录');
      return Promise.reject(msg);
    }

    // 3. 权限不足
    if (code === CODE.FORBIDDEN) {
      ElMessage({
        message: msg || '暂无权限',
        type: 'warning',
      });
      return Promise.reject(msg);
    }

    // 3.5 系统错误（5001）：明确提示根因，不跳登录
    if (code === CODE.SERVICE_ERROR) {
      ElMessage({
        message: msg || '系统内部错误，请稍后重试',
        type: 'error',
      });
      return Promise.reject(msg);
    }

    // 3.6 数据库连接错误（6001）：明确提示根因，不跳登录
    if (code === CODE.DB_CONNECTION_ERROR) {
      ElMessage({
        message: msg || '数据库连接失败，请稍后重试',
        type: 'error',
      });
      return Promise.reject(msg);
    }

    // 4. 限流
    if (code === CODE.RATE_LIMIT) {
      ElMessage({
        message: msg || '请求过于频繁，请稍后再试',
        type: 'warning',
      });
      return Promise.reject(msg);
    }

    // 5. 其他业务失败（1004/1005/1006/1007/1008/5xxx/6xxx）
    if (success === false) {
      ElMessage({
        message: msg || '操作失败',
        type: 'warning',
      });
      return Promise.reject(msg);
    }

    // 6. 兜底
    ElMessage({
      message: msg || '请求失败',
      type: 'error',
    });
    return Promise.reject(msg);
  },
  (error) => {
    const { response } = error;
    // 认证类（1001/1002/1010）：token 失效/过期/设备异常 → 清 cookie + 跳网站首页
    // 注意：后端对此类错误返回 HTTP 401，故走 error 拦截器而非 response 拦截器
    const bizCode = response?.data?.code;
    if (bizCode === CODE.AUTH_FAILED || bizCode === CODE.TOKEN_EXPIRED || bizCode === CODE.DEVICE_ERROR) {
      redirectToLogin(response?.data?.msg);
      return Promise.reject(error);
    }
    // 仅记录状态码和错误信息，避免泄露完整 response 对象
    console.warn('[HTTP ERROR]', error?.response?.status, error?.message);
    if (response && response.status) {
      const { status, statusText, data } = response;
      const codeMessage = {
        400: "请求错误",
        401: "用户没有权限。",
        403: "用户得到授权，但是访问是被禁止的。",
        404: "发出的请求是不存在的记录",
        406: "请求的格式不可得。",
        410: "请求的资源被永久删除",
        422: "验证错误",
        500: "服务器发生错误",
        502: "网关错误。",
        503: "服务不可用，服务器暂时过载或维护。",
        504: "网关超时。",
      };
      
      let errorMessage = codeMessage[status] || statusText;
      
      if (data && data.msg) {
        errorMessage = data.msg;
      }
      
      ElMessage.error(errorMessage);
    } else if (!response) {
      ElMessage.error("您的网络发生异常，无法连接服务器")
    }
    return Promise.reject(error);
  }
);

// 挂载 jsonp 工具（保留备用，当前业务未调用）
http.jsonp = jsonp;

export default http;

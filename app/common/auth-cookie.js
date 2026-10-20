/**
 * 统一登录态 cookie 下发工具（admin token / 会员 ut、un 共用）
 *
 * 统一登录态方案：token 经非 HttpOnly cookie 下发，前端 JS 可直接读取判断登录态
 * （小程序端不支持 cookie，走 body 返回 token，由调用方按 isMiniProgram 分支处理；
 *   前端 axios 配置 withCredentials=true，cookie 自动随请求带上）
 * 安全权衡：非 HttpOnly 后页面 XSS 可读到 JWT，属统一方案的已知风险，已确认接受。
 *
 * 仅以 token 判定登录态（不绑定设备指纹）：避免与同 host 下其他项目共用同名 cookie
 *    互相踩踏导致误踢。
 */

import { setToken } from "chanjs";

/**
 * cookie 公共属性
 * sameSite 策略：prd=strict（最严格），dev=lax（兼容 vite proxy 跨端口）：
 *   vite dev server（如 3001）→ 后端（3000）经代理转发，浏览器视为跨站，
 *   SameSite=Strict 会阻止 cookie 发送导致登录后接口全部 401
 * @param {number} maxAge - 有效期毫秒
 * @returns {Object} express res.cookie 选项
 */
const baseCookieOptions = (maxAge) => ({
  httpOnly: false,
  sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  maxAge,
});

/**
 * 登录态 token cookie 选项（maxAge 跟随 JWT_COOKIE_MAXAGE_MS，与 JWT_EXPIRES_IN 对齐）
 * @param {Object} config - 应用配置（需含 JWT_COOKIE_MAXAGE_MS）
 * @returns {Object} express res.cookie 选项
 */
export const loginCookieOptions = (config) => baseCookieOptions(config.JWT_COOKIE_MAXAGE_MS);

/**
 * 会员登录态签发收敛（member controller 的 login / register / updatePass 共用）
 * 统一 "setToken → cookie 下发" 两段：
 *   cookie：'ut' token cookie；'un' 用户名 cookie（encodeURIComponent，供服务端渲染模板显示）
 * @param {Object} opts
 * @param {Object} opts.req - 请求对象
 * @param {Object} opts.res - 响应对象
 * @param {Object} opts.config - 应用配置（JWT_SECRET / JWT_EXPIRES_IN / JWT_COOKIE_MAXAGE_MS）
 * @param {number|string} opts.uid - 用户 ID
 * @param {string} opts.username - token payload / 'un' cookie 使用的用户名
 * @param {string} [opts.ip] - token payload ip（调用方 getIp(req) 结果）
 * @param {boolean} [opts.setCookies=true] - 小程序端不支持 cookie，传 false 跳过全部 cookie 下发
 * @param {boolean} [opts.unCookie=true] - 是否下发 'un' 用户名 cookie（updatePass 续签场景不需要）
 * @returns {{ token: string }} 签发的 JWT
 */
export const issueMemberSession = ({
  req,
  res,
  config,
  uid,
  username,
  ip = "",
  setCookies = true,
  unCookie = true,
}) => {
  // 生成 token（仅携带 uid / username / ip，不再绑定设备指纹）
  const token = setToken(
    { uid, username, ip, scope: 'member' },
    config.JWT_SECRET,
    config.JWT_EXPIRES_IN
  );

  if (setCookies) {
    const cookieOpts = loginCookieOptions(config);
    // token 经非 HttpOnly cookie 下发（统一登录态方案，见本文件头注释）
    res.cookie('ut', token, cookieOpts);
    if (unCookie) {
      // 会员用户名 cookie（非 httpOnly，供服务端渲染模板 header/mobile-nav 显示）
      res.cookie('un', encodeURIComponent(username), cookieOpts);
    }
  }

  return { token };
};

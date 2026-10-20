import { getApp } from "chanjs";
import { store } from "chanjs/storage/index.js";
import { getToken } from "chanjs";
import { isUserTokenRevoked } from "../common/token-revoke.js";


/**
 * 软认证中间件（SSR 页面专用）
 *
 * 与 userauth 的区别：
 *   - userauth：强制认证，无 token 直接返回 1001 错误
 *   - optionalAuth：软认证，有 token 则解析 uid 挂载 req.user，无 token 也继续
 *
 * 用途：前台 SSR 页面（文章详情、合集详情）需要根据登录状态判断付费可见性，
 *      但未登录用户也能访问页面（只是内容被锁定）。
 *
 * 挂载字段：
 *   有效 token → req.user = { uid, ip }
 *   无效/缺失 token → req.user = null（不报错，继续 next）
 *
 * 安全说明：
 *   - token 黑名单校验保留（logout 主动失效）
 *   - 仅校验 token 有效性，不再做设备指纹绑定（避免跨项目 cookie 踩踏导致误踢）
 *   - 任何异常都降级为未登录，不阻塞 SSR 渲染
 */
export default () => {
  return async (req, res, next) => {
    try {
      const { JWT_SECRET } = getApp().config || {};
      const token = req.cookies?.ut || req.headers.token || "";
      if (!token) {
        req.user = null;
        return await next();
      }

      // 黑名单校验
      const isBlacklisted = await store.get(`blacklist:${token}`);
      if (isBlacklisted) {
        req.user = null;
        return await next();
      }

      // 验证并解析 token
      const { uid, ip, iat } = await getToken(token, JWT_SECRET);
      if (!uid) {
        req.user = null;
        return await next();
      }

      // 用户级吊销水位线：改密前签发的 token 视为未登录（不报错，按游客渲染）
      if (await isUserTokenRevoked(uid, iat)) {
        req.user = null;
        return await next();
      }

      req.user = { uid, ip };
    } catch (err) {
      // 任何异常（token过期/格式错误等）都降级为未登录
      req.user = null;
    }
    await next();
  };
};

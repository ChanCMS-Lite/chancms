import { getApp, respondError, logger } from "chanjs";
import { store } from "chanjs/storage/index.js";
import { verifyToken } from "chanjs";
import { isUserTokenRevoked } from "../common/token-revoke.js";
import MemberService from "../service/Member.js";


/**
 * 业务码体系（与前端 http.js CODE 常量对齐）
 * 1001 → 认证失败（token 无效/缺失/黑名单）→ 跳登录
 * 1002 → token 过期 → 跳登录
 * 1010 → 登录设备异常 → 跳登录
 */
const CODE = {
  AUTH_FAILED: 1001,
  TOKEN_EXPIRED: 1002,
  DEVICE_ERROR: 1010,
  DB_CONNECTION_ERROR: 6001,
};

// 统一响应：HTML 页面请求渲染内置错误页，接口请求返回 JSON
const sendResponse = (res, req, code, message) => {
  // HTTP 状态：数据库连接故障 503，其余鉴权失败 401（HTML 用真实状态；JSON 保持 200 兼容前端拦截器）
  const httpStatus = code === CODE.DB_CONNECTION_ERROR ? 503 : 401;
  return respondError(res, req, { httpStatus, code, msg: message });
};

export default () => {
  return async (req, res, next) => {
    try {
      const { JWT_SECRET } = getApp().config || {};

      // 0. 数据库可用性短路（与 admin auth 一致）
      //    库挂了直接返回 6001「数据库连接失败」，不把 DB 故障伪装成 token 缺失
      if (getApp().dbManager?.isDown?.()) {
        return sendResponse(res, req, CODE.DB_CONNECTION_ERROR, "数据库连接失败，请稍后重试");
      }

      // 1. 获取token（优先从cookie中获取ut）
      const token = req.cookies?.ut || req.headers.token || "";

      // 2. 检查token是否存在
      if (!token) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token缺失");
      }

      // 3. 校验token是否已加入黑名单（logout 主动失效）
      const isBlacklisted = await store.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token已失效，请重新登录");
      }

      // 4. 验证并解析token
      //    注意：getToken 在 token 失效时返回 null，若直接 `const { uid } = await getToken(...)`
      //    会对 null 解构抛 TypeError，被下方 catch 当成 1001 返回，掩盖真实错误。
      //    改用 verifyToken（返回结构化结果、永不抛异常），按原因给出清晰提示。
      const { valid, reason, payload } = await verifyToken(token, JWT_SECRET);
      if (!valid) {
        if (reason === "expired") {
          return sendResponse(res, req, CODE.TOKEN_EXPIRED, "token已过期，请重新登录");
        }
        if (reason === "revoked") {
          return sendResponse(res, req, CODE.AUTH_FAILED, "token已失效，请重新登录");
        }
        return sendResponse(res, req, CODE.AUTH_FAILED, "无效的token，请重新登录");
      }

      // 5. 验证用户基本信息
      const { uid, ip } = payload;
      if (!uid) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "请登录");
      }

      // 5.1 用户级吊销水位线：改密/重置密码前签发的 token 一律失效（跨设备强制下线）
      if (await isUserTokenRevoked(uid, payload.iat)) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "密码已变更，请重新登录");
      }

      // 5.2 作用域校验：会员路由只接受 member 作用域 token，拒绝后台 admin token 越权复用
      //     （后台 token 带 scope:'admin'，会员 token 带 scope:'member'；旧 token 无 scope 仍放行，过渡期兼容）
      if (payload.scope && payload.scope !== 'member') {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token作用域不符，请重新登录");
      }

      // 5.3 账号启用状态校验：会员被后台禁用后，旧 token 立即失效（与后台 isActive 对称）
      //     带 60s 内存缓存，避免每请求查库（与后台 auth 的 isActive 缓存策略一致）
      const statusCacheKey = `member:status:${uid}`;
      let memberStatus = await store.get(statusCacheKey).catch(() => undefined);
      if (memberStatus == null) {
        const member = await MemberService.detail(uid);
        memberStatus = member ? String(member.status) : '0';
        try { await store.set(statusCacheKey, memberStatus, 60 * 1000); } catch (_) {}
      }
      if (String(memberStatus) !== '1') {
        return sendResponse(res, req, CODE.AUTH_FAILED, "账号已停用或不存在，请重新登录");
      }

      // 6. 将用户信息挂载到req对象，方便后续使用（仅校验 token，不再做设备指纹绑定）
      req.user = { uid, ip };

      // 8. 验证通过，继续处理
      await next();
    } catch (error) {
      logger.error("认证错误:", error.message);

      // 区分不同类型的JWT错误（TokenExpiredError 单独用 1002，其他用 1001）
      if (error.name === 'TokenExpiredError') {
        return sendResponse(res, req, CODE.TOKEN_EXPIRED, "token已过期，请重新登录");
      }
      const errorMap = {
        JsonWebTokenError: "无效的token",
        NotBeforeError: "token尚未生效",
      };
      const message = errorMap[error.name] || error.message || "认证失败";
      sendResponse(res, req, CODE.AUTH_FAILED, message);
    }
  };
};

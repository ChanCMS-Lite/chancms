import { getApp, cache, respondError, logger } from "chanjs";
import { store } from "chanjs/storage/index.js";
import SysPermission from "../modules/base/service/SysPermission.js";
import SysPermRoute from "../modules/base/service/SysPermRoute.js";
import SysUser from "../modules/base/service/SysUser.js";
import { permMatches, SKIP_PATHS } from "../common/permission-utils.js";
import { setToken, getToken } from "chanjs";


// token 剩余时间 < 30 分钟时自动刷新
// 权限缓存 TTL（60秒），减少高频请求下数据库压力
const PERMS_CACHE_TTL = 60 * 1000;

/**
 * 业务码体系（与前端 http.js CODE 常量对齐）
 * 1001 → 认证失败（token 无效/缺失/黑名单）→ 跳登录
 * 1002 → token 过期 → 跳登录
 * 1003 → 权限不足 → 提示无权限
 * 1010 → 登录设备异常 → 跳登录
 */
const CODE = {
  AUTH_FAILED: 1001,
  TOKEN_EXPIRED: 1002,
  FORBIDDEN: 1003,
  DEVICE_ERROR: 1010,
  // 数据库连接异常：与「鉴权失败」严格区分，
  // 避免把 DB 故障伪装成 1001/1003 误导用户去重新登录
  DB_CONNECTION_ERROR: 6001,
};

// 统一响应：HTML 页面请求渲染内置错误页，接口请求返回 JSON
// 关键点：浏览器直接访问页面（Accept: text/html）必须拿到 HTML，不能吐 JSON
const sendResponse = (res, req, code, message) => {
  // HTTP 状态：权限类 401/403，数据库连接故障 503（HTML 用真实状态；JSON 保持 200 兼容前端拦截器）
  const httpStatus =
    code === CODE.FORBIDDEN ? 403 :
    code === CODE.DB_CONNECTION_ERROR ? 503 : 401;
  return respondError(res, req, { httpStatus, code, msg: message });
};

export default () => {
  // 权限比对规则与放行名单来自 app/common/permission-utils.js（纯函数）；接口归属查 sys_perm_route 表（SysPermRoute 缓存）
  return async (req, res, next) => {
    try {
      const { JWT_SECRET, JWT_EXPIRES_IN } = getApp().config || {};

      // 0. 数据库可用性短路（最高优先级）
      //    框架 dbManager 在启动 ping / 运行时连接异常时已缓存健康状态。
      //    若库确实挂了，直接返回 6001「数据库连接失败」，绝不让「无 token → 1001 token缺失」
      //    把 DB 故障伪装成鉴权失败，避免用户看到 token 报错却不知根因是数据库。
      if (getApp().dbManager?.isDown?.()) {
        return sendResponse(res, req, CODE.DB_CONNECTION_ERROR, "数据库连接失败，请稍后重试");
      }

      // 1. 获取 token（支持 Bearer / headers.token / cookie）
      const authHeader = req.headers.authorization || "";
      const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const token = bearerToken || req.headers.token || req.cookies?.token || "";

      // 2. 检查 token 是否存在
      if (!token) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token缺失");
      }

      // 3. 校验 token 是否已加入黑名单（logout 主动失效）
      //    缓存层故障（Redis 不可用）不应阻断鉴权，降级为「未命中黑名单」并告警
      let isBlacklisted = false;
      try {
        isBlacklisted = await store.get(`blacklist:${token}`);
      } catch (e) {
        logger.error("[Auth] 黑名单查询失败(缓存基础设施异常)，降级为未命中:", e.message);
      }
      if (isBlacklisted) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token已失效，请重新登录");
      }

      // 4. 验证并解析 token
      const decoded = await getToken(token, JWT_SECRET);
      if (!decoded) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token无效或已过期，请重新登录");
      }

      const { username, uid, i, exp } = decoded;

      // 5. 验证用户基本信息
      if (!username || !uid || exp === undefined) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "登录信息异常，请重新登录！");
      }

      // 5.0 作用域校验：后台路由只接受 admin 作用域 token，拒绝会员 token 越权复用
      //     （会员 token 带 scope:'member'，后台 token 带 scope:'admin'；旧 token 无 scope 仍放行，过渡期兼容）
      if (decoded.scope && decoded.scope !== 'admin') {
        return sendResponse(res, req, CODE.AUTH_FAILED, "token作用域不符，请重新登录");
      }

      // 5.1 用户启用状态校验：账号被停用/删除后旧 token 立即失效。
      //     状态查询带 60s 内存缓存，命中即以缓存为准；DB 瞬时故障时放行不误杀在线用户。
      const active = await SysUser.isActive(uid);
      if (!active) {
        return sendResponse(res, req, CODE.AUTH_FAILED, "账号已停用或不存在，请重新登录");
      }


      // 8. 验证通过，将用户信息存入 req
      req.user = { username, uid };

      // 9. 查接口归属表取权限标识（每个接口在后台「接口权限」里显式配置归属）
      //    表里没有 = 未配置归属 → 非 SKIP_PATHS 一律拒绝（强制到后台配置，杜绝规则推导的隐式放行）
      //    懒加载：Map 未加载时先 ensureLoaded（启动零 DB 依赖，首请求自动加载；
      //    加载失败不落空 Map，下个请求自动重试，避免冷启动全 403）
      const path = req.originalUrl.split('?')[0];
      await SysPermRoute.ensureLoaded();
      const perms = SysPermRoute.getRoutePermCode(req.method, path);
      const skipKey = `${req.method.toUpperCase()} ${path}`;
      const isSkip = Array.isArray(SKIP_PATHS) && SKIP_PATHS.includes(skipKey);

      // 10. 权限列表查询：基于 chanjs cache 60 秒缓存，减少高频请求下数据库压力
      //    用户权限变更（如管理员调整角色）后最长 60 秒生效，可接受
      let permsList = [];
      const permsCacheKey = `perms:${uid}`;
      const cachedPerms = cache.get(permsCacheKey);
      if (cachedPerms) {
        permsList = cachedPerms;
      } else {
        const permsRes = await SysPermission.allPermission(uid);
        if (!permsRes.success) {
          // 基础设施异常（数据库/网络）被 allPermission 包成了 success:false，
          // 必须与点「用户确实无任何权限」区分开，否则会误导成 1003 暂无权限
          logger.error("[Auth] 获取用户权限失败(基础设施异常):", permsRes);
          return sendResponse(res, req, CODE.DB_CONNECTION_ERROR, "数据库连接失败，请稍后重试");
        }
        permsList = permsRes.data || [];
        cache.set(permsCacheKey, permsList, PERMS_CACHE_TTL);
      }

      // 11. 校验权限是否满足当前请求（动词分组归一 + save 桥接 + 通配）
      const checkPermission = (list) => {
        return list.some((item) => permMatches(perms, item));
      };

      const hasPermission = checkPermission(permsList);
      req.user.perms = permsList;

      // 12. 权限校验（接口归属 + 通配 + 公开路径跳过）
      // ① 放行白名单（登录/验证码/元接口）
      if (isSkip) {
        await next();
        return;
      }
      // ② 接口未配置归属：一律拒绝，提示到后台配置（最小权限原则）
      if (!perms) {
        logger.error(`[Auth] 接口未配置权限: ${skipKey}, uid=${uid}`);
        return sendResponse(res, req, CODE.FORBIDDEN, "该接口未配置权限，请到「权限管理-接口权限」配置");
      }
      // ③ 已配置但用户无对应权限码
      if (!hasPermission) {
        logger.error(`[Auth] 权限不足: ${perms}, uid=${uid}, permsCount=${permsList.length}`);
        return sendResponse(res, req, CODE.FORBIDDEN, "暂无权限");
      }

      // 13. 继续处理请求
      await next();
    } catch (error) {
      logger.error("认证错误:", error);
      // TokenExpiredError 单独用 1002，其他用 1001
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

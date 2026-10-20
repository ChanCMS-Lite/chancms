import { readFileSync } from "node:fs";

// 应用版本号唯一来源 = 根 package.json 的 version（发版只改一处），
// 避免登录页页脚 / 响应头 X-App-Version 与真实发版号不一致。
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

export const APP_NAME = "ChanCMS";
export const APP_VERSION = pkg.version;
// 发版日期需与 package.json version 同步手改（仅用于展示「Copyright 20xx」年份）
export const APP_VERSION_TIME = "2026-08-02";
export const PORT = process.env.PORT || "3000";

export const BODY_LIMIT = process.env.BODY_LIMIT || "500kb";

// NODE_ENV 词表说明（重要，勿混用）：
// 本项目所有「是否生产」判断统一用字符串 'prd'（jwt.js 强密钥拒绝、
// ratelimit.js、auth 的 cookie sameSite 等均判 === 'prd'）。
// pm2 生产环境由 pm2/mysql.json 的 env 注入 NODE_ENV=prd；三个 env/*.prd 文件也已写入 NODE_ENV=prd。
// 下面的兜底默认值 "production" 仅在完全未设置时生效——注意它不等于 'prd'，
// 不会触发生产硬检查（如 jwt.js 的 JWT_SECRET 强度校验）。
export const NODE_ENV = process.env.NODE_ENV || "production";

// ────────────────────────────────────────────────────────────────
// 生产环境 fail-fast 硬校验
// 在 config 加载期（早于任何业务路由）集中拦截生产 env 漏配
// （NODE_ENV=prd、COOKIE_SECURE、DB_PASS 等），缺一即拒绝启动。
// ────────────────────────────────────────────────────────────────

// 注：PAGE_SIZE / LIMIT_MAX 来源为 sys_config.page_config 分组，
// 由 base/service/remote-config.js 在启动期注入 config 根（覆盖 env 兜底）。
// 此处不做兜底，配置以数据库为准；缺失时由框架 Repository 兜底（LIMIT_MAX || 300）。


import headers from "../app/middleware/headers.js";
export default {
  APP_NAME,
  APP_VERSION,
  APP_VERSION_TIME,
  PORT,

  BODY_LIMIT,
  NODE_ENV,

  // 宿主全局中间件插槽（框架 config.middleware）：注册于核心链早期、模块路由之前，
  // 对所有响应（含静态资源）生效。安全响应头等全局策略在此注册；
  // app/router.js 的执行时机在模块路由之后，只罩得住 404 兜底，勿再放全局中间件。
  middleware: [headers],
};

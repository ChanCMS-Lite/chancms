/**
 * 健康检查配置
 *
 * 对外 /health 由项目模块 app/modules/health/router.js 提供：
 * 对 DB 执行真实 SELECT 1 探活，健康 → 200、异常 → 503。
 *
 * 框架内置版（chanjs/middleware/health.js）在此关闭，原因：
 *   1. 它是「浅模式」——只读进程内缓存的健康标记、不做实时 IO；
 *   2. 开着会占用 /health，且在 /__internal__ 下暴露一个无需鉴权、
 *      对外可达、返回 db 名与 store 模式的诊断端点。项目要「真实 ping」，故整体关闭。
 *
 * 版本要求：chanjs ≥ 2.8.5
 *   2.8.4 及以前：core/bootstrap/middleware.js 无条件注册 health 中间件，
 *   而 middleware/health.js 在 `enabled === false` 时直接返回 undefined
 *   → Express 抛 `TypeError: app.use() requires a middleware function`，**进程启动即退出**。
 *   若需回退到 2.8.4，把这里改成让框架版让出 /health 的写法：
 *       export default { health: { path: "/__internal__/health-probe" } };
 */
export default {
  health: {
    enabled: false,
  },
};

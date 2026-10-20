import { getApp } from "chanjs";

/**
 * 健康检查模块（项目接管 /health）
 *
 * 背景：框架内置版（packages/chanjs/middleware/health.js）是「浅模式」——
 * 只读进程内缓存的 DB 健康标记、不做实时 IO；且原先无论 degraded 还是内部异常
 * **一律返回 HTTP 200**，探针/负载均衡无法据此摘除故障实例。
 * 已由 config/health.js 置 `enabled:false` 整体关闭，本模块接管同名路径。
 * （框架版「恒 200」与「enabled:false 崩溃」两个缺陷已在 chanjs 2.8.5 修正；
 *   项目仍保留本模块，是为了用真实 SELECT 1 而非缓存快照。）
 *
 * 行为：对 DB 执行真实 SELECT 1（dbManager.ping），健康 → 200，异常 → 503。
 * 路径与框架版保持一致（/health），部署侧无需改动。
 */
export default async (app, router, config) => {
  router.get("/health", async (req, res) => {
    const startedAt = Date.now();
    const dbManager = getApp()?.dbManager;

    // 真实探活（ping 内部即 `SELECT 1`，并会刷新框架的 _health 缓存）；
    // 异常不抛出，统一降级为 degraded + 503
    let dbOk = false;
    try {
      dbOk = (await dbManager?.ping?.()) === true;
    } catch {
      dbOk = false;
    }

    const status = dbOk ? "ok" : "degraded";

    res.set("Cache-Control", "no-store");
    res.status(dbOk ? 200 : 503).json({
      success: dbOk,
      code: dbOk ? 0 : 5001,
      msg: status,
      data: {
        status,
        uptime: Math.floor(process.uptime()),
        db: dbManager?.healthSnapshot?.() ?? [],
        responseTime: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // /health 是顶层端点，须挂根路径。子 Router 内只注册了这一条路由，
  // 未命中请求会自动 next() 流向后继中间件，不影响其它模块。
  app.use("/", router);
};

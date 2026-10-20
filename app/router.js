import { getIp } from "chanjs/utils/index.js";
import { logger } from "chanjs";


/**
 * 应用公共路由
 * @param {Object} app - Express 应用实例
 * @param {Object} router - Express Router 实例
 * @param {Object} config - 应用配置
 */
const routers = (app, router, config) => {
  // 模板目录唯一来源是后台配置（由 web/middleware/init.js 写入 app.locals.template）。
  // 走到这里说明 web init 未执行（如非 web 模块的请求），才用 "default" 兜底。

  //=======================================
  // 404 处理
  //=======================================
  router.use((req, res, next) => {
    logger.error(
      `[异常访问-404]  url-->:${req.url} ip-->:${getIp(req)} UA-->:${req.get(
        "User-Agent",
      )}`,
    );
    const template = req.app.locals.template || "default";
    if (req.accepts("html")) {
      // 404.html include header 依赖 site/nav（app.locals 全局注入，模板直接可用）
      res.status(404).render(`${template}/404.html`, {
        url: req.url,
      });
    } else {
      res.status(404).json({ success: false, code: 1004, msg: "页面不存在" });
    }
  });

  // 500 错误处理（注册到 app 上，而非 router）
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const errorDetail = {
      message: err?.message || String(err),
      url: req.originalUrl || req.url,
      method: req.method,
      stack: err?.stack,
      ip: getIp(req),
      userAgent: req.get("User-Agent") || "",
      referer: req.get("Referer") || "",
      traceId: req.traceId || "-",
    };
    logger.error(`[接口异常-500] [TRACE:${errorDetail.traceId}] ${errorDetail.method} ${errorDetail.url} - ${errorDetail.message}`);
    logger.error(errorDetail.stack || errorDetail.message);
    // AggregateError 的 err.stack 不含嵌套 [errors] 原因、message 为空，单看堆栈仍"看不出原因"。
    // 这里把完整错误对象再打一遍（含 aggregate 的全部 reason / cause / 自定义属性），确保可追溯。
    if (err instanceof AggregateError || err?.cause) {
      logger.error(err);
    }
    // 交给框架统一解析与响应（不再自行调用 parseDatabaseError / 渲染）
    return next(err);
  });
};

export default routers;

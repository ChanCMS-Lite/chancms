import { createRateLimitMiddleware } from "chanjs";
import { rateLimit } from "../../../../config/ratelimit.js";

// 搜索接口专属限流（阈值统一在 config/ratelimit.js 的 search 段配置）
// createRateLimitMiddleware 返回标准 (req, res, next) 中间件，直接导出即可
const searchLimit = createRateLimitMiddleware({
  windowMs: rateLimit.search.windowMs,
  max: rateLimit.search.max,
  message: rateLimit.search.message,
  keyPrefix: "search_limit_",
});

export default searchLimit;

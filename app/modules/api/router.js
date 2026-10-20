import { loader } from "chanjs";
import { createRateLimitMiddleware } from "chanjs";
import { rateLimit } from "../../../config/ratelimit.js";
import userauth from "../member/middleware/userauth.js";
import optionalAuth from "../member/middleware/optionalAuth.js";
import commentSecurity from "../member/middleware/commentSecurity.js";

/**
 * C 端聚合层（小程序 / App / H5 前后端分离统一入口）
 *
 * 设计原则（与铁律一致）：
 *   1. 不重造登录 / token：登录仅「分发透传」到现有 member 逻辑；
 *   2. 不复制业务：读接口复用现有 cms / member service（this.get 跨模块取）；
 *   3. token 沿用 ut，鉴权复用 member 的 userauth()；不动后台 auth()（RBAC，风险大）；
 *   4. 客户端标识统一用 x-client-type header（见 common/client-type.js），杜绝 UA 分支。
 *
 * 路由前缀 /api/v1。
 */
export default async (app, router, config) => {
  const controller = await loader.loadController("api");

  // ===== 登录（用户名密码，公开）=====
  router.post(
    "/login",
    createRateLimitMiddleware({ windowMs: rateLimit.login.windowMs, max: rateLimit.login.max }),
    controller.Api.login,
  );
  router.post("/logout", controller.Api.logout);

  // ===== 受保护（登录态，userauth 读 ut）=====
  router.get("/me", userauth(), controller.Api.me);
  router.get("/comments", userauth(), controller.Api.comments); // 我的评论
  router.get("/favorites", userauth(), controller.Api.favorites); // 我的收藏
  router.post("/favorite/add", userauth(), controller.Api.favoriteAdd);
  router.delete("/favorite/:id", userauth(), controller.Api.favoriteDelete);
  router.post("/comments", userauth(), commentSecurity(), controller.Api.commentCreate); // 发布评论
  router.post("/comment/like", userauth(), controller.Api.commentLike); // 评论点赞

  // ===== 公开读（无需登录，optionalAuth 仅在有 token 时挂载 req.user）=====
  // 所有公开读路由统一挂 IP 限流（60 次/分钟），防止未授权爬取拖垮数据库
  router.use(createRateLimitMiddleware({
    windowMs: rateLimit.publicRead.windowMs,
    max: rateLimit.publicRead.max,
  }));
  router.get("/site/info", optionalAuth(), controller.Api.siteInfo);
  router.get("/categories", optionalAuth(), controller.Api.categories);
  router.get("/category/:id", optionalAuth(), controller.Api.categoryDetail);
  router.get("/category/:id/articles", optionalAuth(), controller.Api.categoryArticles);
  router.get("/articles", optionalAuth(), controller.Api.articles);
  router.get("/article/:id", optionalAuth(), controller.Api.articleDetail);
  router.get("/article/:id/prev-next", optionalAuth(), controller.Api.articlePrevNext);
  router.get("/article/:id/comments", optionalAuth(), controller.Api.articleComments);
  router.get("/search", optionalAuth(), controller.Api.articles); // 文章搜索（keyword 走 Article.search）
  router.get("/slides", optionalAuth(), controller.Api.slides);
  router.get("/friendlinks", optionalAuth(), controller.Api.friendlinks);
  router.get("/tags", optionalAuth(), controller.Api.tags);
  router.get("/fragments", optionalAuth(), controller.Api.fragments);
  router.get("/page/:id", optionalAuth(), controller.Api.pageDetail);

  app.use("/api/v1", router);
};

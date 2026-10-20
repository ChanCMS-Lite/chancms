import { loader } from "chanjs";
import init from "./middleware/init.js";
import adapter from "./middleware/adapter.js";
import searchRateLimit from "./middleware/search-limit.js";
import optionalAuth from "../member/middleware/optionalAuth.js";

export default async (app, router, config) => {
  let controller = await loader.loadController("web");

  router.use(adapter());
  router.use(init());
  // 软认证（全站可选）：解析会员登录态写入 req.user.uid，供访问日志按人（uid）追踪；
  // 未登录/无 token 直接放行，不拦截任何页面请求
  router.use(optionalAuth());

  // 首页模板
  router.get(["/", "/index.html", "/index.php"], controller.Home.index);

  // SEO 文件（robots.txt / sitemap.xml / llsm.txt）：按当前激活模板目录提供，需在通用栏目路由前注册
  router.get(
    ["/robots.txt", "/sitemap.xml", "/llsm.txt", "/llms.txt"],
    controller.Seo.seoFile,
  );

  // 分类
  router.get(
    [
      "/:cate/index.html",
      "/:cate/index:current.html",
      "/:cate1/:cate/index.html",
      "/:cate1/:cate/index:current.html",
      "/:cate2/:cate1/:cate/index.html",
      "/:cate2/:cate1/:cate/index:current.html",
      "/:cate3/:cate2/:cate1/:cate/index.html",
      "/:cate3/:cate2/:cate1/:cate/index:current.html",
    ],
    controller.Article.list,
  );

  // 文章页
  router.get(
    [
      "/article/:id.html",
      "/article-:id.html",
      "/:cate/article-:id.html",
      "/:cate1/:cate/article-:id.html",
      "/:cate2/:cate1/:cate/article-:id.html",
      "/:cate3/:cate2/:cate1/:cate/article-:id.html",
    ],
    controller.Article.article,
  );

  // 单页栏目
  router.get(
    [
      "/:cate/page.html",
      "/:cate1/:cate/page.html",
      "/:cate2/:cate1/:cate/page.html",
      "/:cate3/:cate2/:cate1/:cate/page.html",
      "/:cate/page-:id.html",
      "/:cate1/:cate/page-:id.html",
      "/:cate2/:cate1/:cate/page-:id.html",
      "/:cate3/:cate2/:cate1/:cate/page-:id.html",
    ],
    controller.Page.page,
  );

  // 搜索页
  router.get("/search.html", searchRateLimit, controller.Search.search);

  // tag列表页
  router.get(
    ["/tags/:path/tag.html", "/tags/:path/tag:current.html"],
    controller.Tag.tag,
  );

  // 使用路由
  app.use(router);
};

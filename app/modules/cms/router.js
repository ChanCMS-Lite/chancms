import auth from "../../middleware/auth.js";
import operLog from "../base/middleware/operLog.js";
import { loader } from "chanjs";

export default async (app, router, config) => {
  let controller = await loader.loadController("cms");

  // 操作日志中间件
  router.use(operLog());
  router.get("/site/appInfo", controller.Site.getAppInfo);

  // 留言提交（公开接口，供前台匿名访客使用，置于 auth 之前）
  router.post("/message/create", controller.Message.create);

  router.use(auth());

  // 站点信息
  router.get("/site/info", controller.Site.info);
  router.post("/site/update", controller.Site.update);
  router.get("/site/runEnv", controller.Site.runEnv);
 
  router.get("/sysApp/find", controller.SysApp.find);
  router.get("/sysApp/views", controller.SysApp.getViews);
  router.get("/sysApp/folder", controller.SysApp.folder);
  router.post("/sysApp/update", controller.SysApp.update);

  // 网站栏目
  router.get("/category/find", controller.Category.find);
  router.get("/category/findId", controller.Category.findId);
  router.get("/category/findSubId", controller.Category.findSubId);
  router.get("/category/search", controller.Category.search);
  router.post("/category/delete", controller.Category.delete);
  router.post("/category/update", controller.Category.update);
  router.post("/category/create", controller.Category.create);

  // 文章栏目
  router.get("/article/list", controller.Article.list);
  router.get("/article/statistics", controller.Article.statistics);
  router.get("/article/search", controller.Article.search);
  router.get("/article/detail", controller.Article.detail);
  router.get("/article/findField", controller.Article.findField);
  router.post("/article/create", controller.Article.create);
  router.post("/article/delete", controller.Article.delete);
  router.post("/article/update", controller.Article.update);

  // 模型管理
  router.get("/model/list", controller.Model.list);
  router.get("/model/search", controller.Model.search);
  router.get("/model/detail", controller.Model.detail);
  router.get("/model/hasUse", controller.Model.hasUse);
  router.post("/model/create", controller.Model.create);
  router.post("/model/delete", controller.Model.delete);
  router.post("/model/update", controller.Model.update);

  // 字段管理
  router.get("/field/list", controller.Field.list);
  router.get("/field/findByMid", controller.Field.findByMid);
  router.get("/field/detail", controller.Field.detail);
  router.post("/field/create", controller.Field.create);
  router.post("/field/delete", controller.Field.delete);
  router.post("/field/update", controller.Field.update);

  // 碎片管理
  router.get("/frag/list", controller.Frag.list);
  router.get("/frag/search", controller.Frag.search);
  router.get("/frag/detail", controller.Frag.detail);
  router.post("/frag/create", controller.Frag.create);
  router.post("/frag/delete", controller.Frag.delete);
  router.post("/frag/update", controller.Frag.update);

  // tag标签管理
  router.get("/tag/list", controller.Tag.list);
  router.post("/tag/create", controller.Tag.create);
  router.get("/tag/detail", controller.Tag.detail);
  router.get("/tag/has", controller.Tag.has);
  router.get("/tag/search", controller.Tag.search);
  router.post("/tag/delete", controller.Tag.delete);
  router.post("/tag/update", controller.Tag.update);

  // 友情链接
  router.get("/friendlink/list", controller.Friendlink.list);
  router.get("/friendlink/detail", controller.Friendlink.detail);
  router.post("/friendlink/create", controller.Friendlink.create);
  router.post("/friendlink/delete", controller.Friendlink.delete);
  router.post("/friendlink/update", controller.Friendlink.update);

  // 留言管理
  router.get("/message/list", controller.Message.list);
  router.get("/message/search", controller.Message.search);
  router.get("/message/detail", controller.Message.detail);
  router.post("/message/delete", controller.Message.delete);
  router.post("/message/update", controller.Message.update);

  // 轮播管理
  router.get("/slide/list", controller.Slide.list);
  router.get("/slide/search", controller.Slide.search);
  router.get("/slide/detail", controller.Slide.detail);
  router.post("/slide/create", controller.Slide.create);
  router.post("/slide/delete", controller.Slide.delete);
  router.post("/slide/update", controller.Slide.update);

  //配置前缀
  app.use("/cms", router);
};

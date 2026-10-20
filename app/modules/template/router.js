import { loader, respondError } from "chanjs";
import auth  from "../../middleware/auth.js";
import { isSuperUser } from "../../common/permission-utils.js";

/**
 * 模板文件编辑器模块（原 vip 目录，名实不符重命名为 template）
 *
 * 在线编辑 view/ 下的 art-template 模板与 public/ 下的静态资源，
 * 无会员等级/付费逻辑。挂载前缀 /template/v1。
 *
 * 安全要求（P0）：模板写入 = 在 Node 进程内执行代码（art-template 表达式可逃逸到 process），
 * 属 RCE 面。整模块仅对超级管理员开放，普通管理员（即便拥有 vip:* 权限码）也禁止访问。
 */
// 仅超级管理员可访问（复用与 auth 一致的错误响应形状：403 / code 1003）
function requireSuperAdmin(req, res, next) {
  if (isSuperUser(req)) return next();
  respondError(res, req, { httpStatus: 403, code: 1003, msg: "仅超级管理员可编辑模板文件" });
}

export default async (app, router, config) => {
  let controller = await loader.loadController("template");

  router.get("/file/tree", auth(), requireSuperAdmin, controller.CodeFile.tree);
  router.get("/file/content", auth(), requireSuperAdmin, controller.CodeFile.content);
  router.post("/file/save", auth(), requireSuperAdmin, controller.CodeFile.save);
  router.get("/file/oss", auth(), requireSuperAdmin, controller.CodeFile.oss);

  app.use("/template/v1", router);
};

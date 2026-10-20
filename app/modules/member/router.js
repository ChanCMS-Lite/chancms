import { loader } from "chanjs";
import { createRateLimitMiddleware } from "chanjs";
import { rateLimit } from "../../../config/ratelimit.js";
import verifycode from "./middleware/verifycode.js";
import userauth from "./middleware/userauth.js";
import commentSecurity from "./middleware/commentSecurity.js";
import auth from "../../middleware/auth.js";
import { generateCaptcha, preCheckCaptcha } from "../base/middleware/captcha.js";
import { fail, success } from "chanjs";
import operLog from "../base/middleware/operLog.js";

export default async (app, router, config) => {
  let controller = await loader.loadController("member");

  //登录验证码（会员端，无需鉴权）
  router.get("/captcha", generateCaptcha);

  //登录前置：仅校验图形验证码（消费式）。验证码错误时前端据此不调用登录接口，避免无意义请求
  router.post("/verifyCaptcha", async (req, res) => {
    const result = await preCheckCaptcha(req);
    if (!result.ok) {
      return res.json(fail({ msg: result.msg, code: 1006 }));
    }
    return res.json(success({ data: { ok: true } }));
  });

  //前端会员接口
  // 验证码类接口统一加 IP 维度限流（阈值见 config/ratelimit.js 的 verifyCode）
  // 与 verifycode 中间件的「猜错次数锁定」形成两道防线：本层防高频扫描，中间件防逐次猜解
  router.post(
    "/sendEmail",
    createRateLimitMiddleware({ windowMs: rateLimit.verifyCode.windowMs, max: rateLimit.verifyCode.max }),
    controller.Member.sendEmail,
  );
  router.post(
    "/register",
    createRateLimitMiddleware({ windowMs: rateLimit.verifyCode.windowMs, max: rateLimit.verifyCode.max }),
    verifycode,
    controller.Member.register,
  );
  router.post(
    "/login",
    createRateLimitMiddleware({ windowMs: rateLimit.login.windowMs, max: rateLimit.login.max }),
    controller.Member.login,
  );
  router.get("/logout", controller.Member.logout);
  router.post(
    "/checkEmail",
    createRateLimitMiddleware({ windowMs: rateLimit.verifyCode.windowMs, max: rateLimit.verifyCode.max }),
    controller.Member.checkEmail,
  );
  router.post(
    "/resetPass",
    createRateLimitMiddleware({ windowMs: rateLimit.verifyCode.windowMs, max: rateLimit.verifyCode.max }),
    verifycode,
    controller.Member.resetPass,
  );
  router.get("/detail", userauth(), controller.Member.detail);
  router.post("/updatePass", userauth(), controller.Member.updatePass);
  router.post("/updateUser", userauth(), controller.Member.updateUser);

  //评论收藏接口
  router.get("/comments", userauth(), controller.Comment.getComments);
  router.post(
    "/comment",
    userauth(),
    commentSecurity(),
    controller.Comment.addComment,
  );
  router.post("/deleteComment", userauth(), controller.Comment.deleteComment);
  router.post("/likeComment", userauth(), controller.Comment.likeComment);
  router.get(
    "/articleComments",
    controller.Comment.articleComments,
  );
  router.get("/favorites", userauth(), controller.Favorite.getFavorites);
  router.post("/favorite", userauth(), controller.Favorite.addFavorite);
  router.post("/deleteFavorite", userauth(), controller.Favorite.deleteFavorite);

  //权限-操作日志中间件（仅作用于其后的后台管理路由）
  router.use(auth());
  router.use(operLog());

  //后台管理-会员管理-列表
  router.get("/list", controller.Member.list);
  router.get("/search", controller.Member.search);
  router.get("/adminDetail", controller.Member.adminDetail);
  router.post("/updateStatus", controller.Member.updateStatus);
  // URL 保留 adminUpdateUser 兼容 admin 前端（免改打包）；逻辑复用 updateUser 的防越权分支
  // （auth() 已注入 req.user.perms，isAdmin 分支据此放行指定 id + status 修改）
  router.post("/adminUpdateUser", controller.Member.updateUser);
  router.post("/delete", controller.Member.delete);

  //后台管理-会员管理-评论收藏管理
  router.get("/comment/list", controller.Comment.commentList);
  router.post("/comment/audit", controller.Comment.commentAudit);
  router.post("/comment/delete", controller.Comment.commentDelete);
  router.get("/favorite/list", controller.Favorite.favoriteList);
  router.post("/favorite/delete", controller.Favorite.favoriteDelete);

  app.use("/member/v1", router);
};

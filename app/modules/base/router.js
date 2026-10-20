import auth from "../../middleware/auth.js";
import operLog from "./middleware/operLog.js";
import { generateCaptcha, preCheckCaptcha } from "./middleware/captcha.js";
import { loader, fail, success } from "chanjs";

export default async (app, router, config) => {
  let controller = await loader.loadController("base");

  router.use(operLog());

  //登录验证码
  router.get("/captcha", generateCaptcha);

  //登录前置：仅校验图形验证码（消费式）。验证码错误时前端据此不调用登录接口，避免无意义请求
  router.post("/verifyCaptcha", async (req, res) => {
    const result = await preCheckCaptcha(req);
    if (!result.ok) {
      return res.json(fail({ msg: result.msg, code: 1006 }));
    }
    return res.json(success({ data: { ok: true } }));
  });

  // 登录接口必须公开：若放在 router.use(auth()) 之后，访问 /base/user/login 会被自己的鉴权拦截
  router.post("/user/login", controller.SysUser.login);

  router.use(auth());
  //菜单
  router.get("/menu/list", controller.SysMenu.list);
  router.get("/menu/detail", controller.SysMenu.detail);
  router.post("/menu/create", controller.SysMenu.create);
  router.post("/menu/update", controller.SysMenu.update);
  router.post("/menu/delete", controller.SysMenu.delete);
  router.get("/menu/allRouter", controller.SysMenu.allRouter);

  //角色
  router.get("/role/list", controller.SysRole.list);
  router.get("/role/detail", controller.SysRole.detail);
  router.post("/role/create", controller.SysRole.create);
  router.post("/role/update", controller.SysRole.update);
  router.post("/role/delete", controller.SysRole.delete);

  //角色&菜单
  router.get("/roleMenu/list", controller.SysRoleMenu.list);

  //权限管理（权限码 / 接口归属 / 权限资源）
  router.get("/permission/list", controller.SysPermission.list);
  router.get("/permission/detail", controller.SysPermission.detail);
  router.post("/permission/create", controller.SysPermission.create);
  router.post("/permission/update", controller.SysPermission.update);
  router.post("/permission/delete", controller.SysPermission.delete);
  router.get("/permission/all", controller.SysPermission.allPermission);
  // 权限树（角色编辑弹窗按菜单勾选权限码）
  router.get("/permission/tree", controller.SysPermission.tree);
  // 手动同步路由权限（后台按钮触发）
  router.post("/permission/sync", controller.SysPermission.sync);

  // 接口权限归属（sys_perm_route：每个接口配置增删改查归属）
  router.get("/permission/route/list", controller.SysPermRoute.routeList);
  router.post("/permission/route/create", controller.SysPermRoute.routeCreate);
  router.post("/permission/route/update", controller.SysPermRoute.routeUpdate);
  router.post("/permission/route/delete", controller.SysPermRoute.routeDelete);
  // 归属选择数据源（模块→资源→动作，与角色权限树同源）
  router.get("/permission/permResources", controller.SysPermResource.permResources);

  // 权限资源（sys_perm_resource：角色权限树的来源，后台可视化维护）
  router.get("/permission/resource/list", controller.SysPermResource.resourceList);
  router.post("/permission/resource/save", controller.SysPermResource.resourceSave);
  router.post("/permission/resource/delete", controller.SysPermResource.resourceDelete);

  //用户
  router.post("/user/logout", controller.SysUser.logout);
  router.get("/user/list", controller.SysUser.list);
  router.get("/user/detail", controller.SysUser.detail);
  router.post("/user/create", controller.SysUser.create);
  router.post("/user/update", controller.SysUser.update);
  router.post("/user/delete", controller.SysUser.delete);

  //用户&角色
  router.get("/userRole/detail", controller.SysUserRole.detail);

  //在线用户（只读列表 + 强退；不建表，读 store 在线映射）
  router.get("/online/list", controller.SysOnline.list);
  router.post("/online/kick", controller.SysOnline.kick);

  //操作日志
  router.get("/operLog/list", controller.OperLog.index);
  router.post("/operLog/delete", controller.OperLog.delete);
  // 清空操作日志属破坏性操作：改用 POST + 仅超管可调用
  router.post("/operLog/clear", controller.OperLog.clear);

  //配置类型
  router.get("/config-type/list", controller.ConfigType.list);
  router.get("/config-type/detail", controller.ConfigType.detail);
  router.post("/config-type/create", controller.ConfigType.create);
  router.post("/config-type/update", controller.ConfigType.update);
  router.post("/config-type/delete", controller.ConfigType.delete);

  //配置
  router.get("/config/list", controller.Config.list);
  router.get("/config/getlist", controller.Config.getlist);
  router.get("/config/detail", controller.Config.detail);
  router.post("/config/create", controller.Config.create);
  router.post("/config/update", controller.Config.update);
  router.post("/config/updateMany", controller.Config.updateMany);
  router.post("/config/delete", controller.Config.delete);

  //配置前缀
  app.use("/base", router);
};

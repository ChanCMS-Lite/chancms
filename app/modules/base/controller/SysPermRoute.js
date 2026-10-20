import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { createSchema, updateSchema, deleteSchema, listSchema } from "../validator/SysPermRoute.js";

/**
 * 接口权限归属（sys_perm_route）控制器
 * 后台「权限管理-接口权限」tab：每个接口配置增删改查归属
 */
class SysPermRouteController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysPermRoute = this.get("base", "SysPermRoute", "service");
  }

  // 接口归属列表
  async routeList(req, res, next) {
    try {
      const SysPermRoute = await this.SysPermRoute;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await SysPermRoute.routeList(vdata);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 新增接口归属
  async routeCreate(req, res, next) {
    try {
      const SysPermRoute = await this.SysPermRoute;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysPermRoute.routeCreate(body, req.user?.perms || []);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 编辑接口归属
  async routeUpdate(req, res, next) {
    try {
      const SysPermRoute = await this.SysPermRoute;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysPermRoute.routeUpdate(body, req.user?.perms || []);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除接口归属
  async routeDelete(req, res, next) {
    try {
      const SysPermRoute = await this.SysPermRoute;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysPermRoute.routeDelete(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysPermRouteController();
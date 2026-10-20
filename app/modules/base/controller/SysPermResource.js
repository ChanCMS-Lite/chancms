import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { createSchema, listSchema, deleteSchema } from "../validator/SysPermResource.js";

/**
 * 权限树资源（sys_perm_resource）控制器
 * 后台「权限管理-权限资源」tab：模块→资源→动作（角色权限树的来源）
 */
class SysPermResourceController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysPermResource = this.get("base", "SysPermResource", "service");
  }

  // 归属选择数据源（模块→资源→动作，接口归属弹窗级联用）
  async permResources(req, res, next) {
    try {
      const SysPermResource = await this.SysPermResource;
      const data = await SysPermResource.permResources();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 资源列表
  async resourceList(req, res, next) {
    try {
      const SysPermResource = await this.SysPermResource;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await SysPermResource.resourceList(vdata);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 新增/编辑资源
  async resourceSave(req, res, next) {
    try {
      const SysPermResource = await this.SysPermResource;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysPermResource.resourceSave(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除资源
  async resourceDelete(req, res, next) {
    try {
      const SysPermResource = await this.SysPermResource;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysPermResource.resourceDelete(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysPermResourceController();
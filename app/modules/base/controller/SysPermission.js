import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { isSuperUser } from "../../../common/permission-utils.js";
import { createSchema, updateSchema, deleteSchema, detailSchema, listSchema } from "../validator/SysPermission.js";

class SysPermissionController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysPermission = this.get("base", "SysPermission", "service");
    this.SysUser = this.get("base", "SysUser", "service");
  }

  async list(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await SysPermission.list(vdata);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async detail(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysPermission.detail(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysPermission.create(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysPermission.update(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysPermission.delete(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 获取当前用户所有权限
   * 路由已挂 auth() 中间件，req.user.uid 由 auth 解析挂载
   * 支持查询参数 id 显式指定（仅超管可查他人权限集；普通用户只允许查自己，防水平越权）
   */
  async allPermission(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = req.query;
      const selfUid = req.user?.uid;
      const uid = id || selfUid;
      if (!uid) {
        res.json(this.fail({ msg: "请先登录" }));
        return;
      }
      // 对象级鉴权：查自己放行；查他人仅超管放行
      if (String(uid) !== String(selfUid) && !isSuperUser(req)) {
        res.status(403);
        res.json(this.fail({ msg: "无权限查看他人权限" }));
        return;
      }
      const data = await SysPermission.allPermission(uid);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 规范权限树（驱动前端角色权限配置 UI）
  async tree(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const data = await SysPermission.tree();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 手动同步路由权限（后台按钮触发）
  async sync(req, res, next) {
    try {
      const SysPermission = await this.SysPermission;
      const data = await SysPermission.sync();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysPermissionController();
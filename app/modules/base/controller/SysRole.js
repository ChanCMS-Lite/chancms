import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { createSchema, updateSchema, deleteSchema, detailSchema, listSchema } from "../validator/SysRole.js";

class SysRoleController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysRole = this.get("base", "SysRole", "service");
  }

  async list(req, res, next) {
    try {
      const SysRole = await this.SysRole;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await SysRole.list(vdata);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 增
  async create(req, res, next) {
    try {
      const SysRole = await this.SysRole;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const { roleData, menuIds, permCodes } = body;
      const data = await SysRole.create({ roleData, menuIds, permCodes, callerPerms: req.user?.perms });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const SysRole = await this.SysRole;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysRole.detail(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const SysRole = await this.SysRole;
      const vdata = validated(deleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysRole.delete(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const SysRole = await this.SysRole;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const { roleId, roleData, menuIds, permCodes } = body;
      const data = await SysRole.update({ roleId, roleData, menuIds, permCodes, callerPerms: req.user?.perms });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysRoleController();
import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { isSuperUser } from "../../../common/permission-utils.js";
import { createSchema, updateSchema, deleteSchema, detailSchema, listSchema } from "../validator/SysMenu.js";

class SysMenuController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysMenu = this.get("base", "SysMenu", "service");
    this.SysUser = this.get("base", "SysUser", "service");
  }

  async list(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await SysMenu.list(vdata);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 获取当前用户菜单
   * 路由已挂 auth() 中间件，req.user.uid 由 auth 解析挂载
   * 支持查询参数 id 显式指定（仅超管可查他人菜单；普通用户只允许查自己，防水平越权）
   */
  async allRouter(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const { id } = req.query;
      const selfUid = req.user?.uid;
      const uid = id || selfUid;
      if (!uid) {
        res.json(this.fail({ msg: "请先登录" }));
        return;
      }
      // 对象级鉴权：查自己放行；查他人仅超管放行
      // 超管判定双保险：通配权限 *:*:* 或 super 角色（库内可能无通配权限行）
      if (String(uid) !== String(selfUid)) {
        const SysUser = await this.SysUser;
        const isSuper = isSuperUser(req) || (await SysUser.hasRole(selfUid, "super"));
        if (!isSuper) {
          res.status(403);
          res.json(this.fail({ msg: "无权限查看他人菜单" }));
          return;
        }
      }
      const data = await SysMenu.allRouter(uid);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 增
  async create(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysMenu.create(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysMenu.detail(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const vdata = validated(deleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await SysMenu.delete(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const SysMenu = await this.SysMenu;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysMenu.update(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysMenuController();
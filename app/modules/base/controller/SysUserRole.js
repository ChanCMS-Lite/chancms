import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { isSuperUser } from "../../../common/permission-utils.js";
import { detailSchema } from "../validator/SysUserRole.js";

class SysUserRoleController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysUserRole = this.get("base", "SysUserRole", "service");
    this.SysUser = this.get("base", "SysUser", "service");
  }

  // 查（对象级鉴权：仅本人或超管可查角色映射，防水平越权枚举他人角色）
  // 超管判定双保险：通配权限 *:*:* 或 super 角色（库内可能无通配权限行）
  async detail(req, res, next) {
    try {
      const SysUserRole = await this.SysUserRole;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { user_id } = vdata;
      const selfUid = req.user?.uid;
      if (String(user_id) !== String(selfUid)) {
        const SysUser = await this.SysUser;
        const isSuper = isSuperUser(req) || (await SysUser.hasRole(selfUid, "super"));
        if (!isSuper) {
          res.status(403);
          res.json(this.fail({ msg: "无权限查看他人角色" }));
          return;
        }
      }
      const data = await SysUserRole.detail(user_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysUserRoleController();
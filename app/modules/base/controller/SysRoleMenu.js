import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { listSchema } from "../validator/SysRoleMenu.js";

class SysRoleMenuController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysRoleMenu = this.get("base", "SysRoleMenu", "service");
  }

  async list(req, res, next) {
    try {
      const SysRoleMenu = await this.SysRoleMenu;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const id = req.query.id;
      const data = await SysRoleMenu.list({ role_id: id });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysRoleMenuController();
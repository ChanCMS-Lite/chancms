import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { z } from "../../../common/validate.js";

const listSchema = z.looseObject({});
const kickSchema = z.looseObject({
  token: z.string().optional(),
  userId: z.union([z.number(), z.string()]).optional(),
});

class SysOnlineController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysOnline = this.get("base", "SysOnline", "service");
  }

  // 在线用户列表（只读）
  async list(req, res, next) {
    try {
      const SysOnline = await this.SysOnline;
      validated(listSchema, req.query, res, this);
      const data = await SysOnline.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 强退（按 token 或 userId）
  async kick(req, res, next) {
    try {
      const SysOnline = await this.SysOnline;
      const body = validated(kickSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await SysOnline.kick(body);
      if (data && data.success === false) {
        res.json(this.fail(data));
        return;
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new SysOnlineController();

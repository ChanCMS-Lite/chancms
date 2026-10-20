import { Controller } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { validated } from "../../../common/validate.js";
import { listSchema, deleteSchema } from "../validator/OperLog.js";

class OperLogController extends Controller {
  constructor(...args) {
    super(...args);
    this.OperLog = this.get("base", "OperLog", "service");
  }

  async index(req, res, next) {
    try {
      const OperLog = await this.OperLog;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { cur = 1, pageSize = 10, title, oper_name, business_type, operator_type, status } = req.query;
      pageSize = capPageSize(pageSize);
      const result = await OperLog.list({
        cur: parseInt(cur),
        pageSize: parseInt(pageSize),
        title,
        oper_name,
        business_type,
        operator_type,
        status,
      });
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const OperLog = await this.OperLog;
      const vdata = validated(deleteSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { ids } = vdata;
      const data = await OperLog.deleteBatch(ids);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  async clear(req, res, next) {
    try {
      const OperLog = await this.OperLog;
      // 仅超级管理员（持有 *:*:* 通配权限）可清空操作日志，防误清/恶意清空
      const perms = req.user?.perms;
      const isSuper = Array.isArray(perms) && perms.includes("*:*:*");
      if (!isSuper) {
        res.status(403);
        res.json(this.fail({ msg: "仅超级管理员可清空操作日志" }));
        return;
      }
      const data = await OperLog.clear();
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new OperLogController();
import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { createSchema, updateSchema, deleteSchema, detailSchema, listSchema } from "../validator/ConfigType.js";

class ConfigTypeController extends Controller {
  constructor(...args) {
    super(...args);
    this.ConfigType = this.get("base", "ConfigType", "service");
  }

  async list(req, res, next) {
    try {
      const ConfigType = await this.ConfigType;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await ConfigType.list(vdata || {});
      res.json(data);
    } catch (err) {
      // 显式 try/catch：局部可在此打日志/定位，异常统一交给 next(err)（全局错误处理器）
      next(err);
    }
  }

  // 增
  async create(req, res, next) {
    try {
      const ConfigType = await this.ConfigType;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await ConfigType.create(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const ConfigType = await this.ConfigType;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await ConfigType.detail(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const ConfigType = await this.ConfigType;
      const vdata = validated(deleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await ConfigType.delete(id);
      if (data && data.success === false) {
        res.json(this.fail(data));
        return;
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const ConfigType = await this.ConfigType;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await ConfigType.update(body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new ConfigTypeController();
import { Controller } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { validated } from "../../../common/validate.js";
import { clearAllWebCache } from "../../../common/cacheclear.js";

import {
  createSchema,
  updateSchema,
  deleteSchema,
  detailSchema,
  listSchema,
  searchSchema,
} from "../validator/Model.js";

class ModelController extends Controller {
  constructor() {
    super();
    this.model = this.get("cms","Model","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const model = await this.model;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const has = await model.findByName(body.model);
      if (has.data && has.data.length > 0) {
        res.json(this.fail({ msg: "模型名称已重复" }));
        return;
      }
      const data = await model.create(body);
      clearAllWebCache(req); // Model.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const model = await this.model;
      const vdata = validated(deleteSchema, req.body, res, this);
      if (vdata === undefined) return;
      // service.delete(body) 期望 {id} 对象（内部自行拆逗号批量），不能只传 id 值
      const data = await model.delete(vdata);
      clearAllWebCache(req); // Model.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const model = await this.model;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await model.update(body);
      clearAllWebCache(req); // Model.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const model = await this.model;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await model.detail(id);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 是否被使用
  async hasUse(req, res, next) {
    try {
      const model = await this.model;
      const { id } = req.query;
      const data = await model.hasUse(id);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const model = await this.model;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, pageSize = 10 } = vdata;
      pageSize = capPageSize(pageSize);
      const result = await model.list(parseInt(page) || 1, parseInt(pageSize) || 10);
      res.json(this.success({data:result.data}));
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const model = await this.model;
      const vdata = validated(searchSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, pageSize = 10, keyword } = vdata;
      pageSize = capPageSize(pageSize);
      const result = await model.search(keyword || "", parseInt(page) || 1, parseInt(pageSize) || 10);
      res.json(this.success({data:result.data}));
    } catch (err) {
      next(err);
    }
  }
}

export default new ModelController();
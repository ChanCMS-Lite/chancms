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
  findByMidSchema,
} from "../validator/Field.js";

class FieldController extends Controller {
  constructor() {
    super();
    this.field = this.get("cms","Field","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const field = await this.field;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      // 重名校验由 service.create 内部完成
      const data = await field.create(body);
      clearAllWebCache(req); // Field.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const field = await this.field;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await field.delete(id);
      clearAllWebCache(req); // Field.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const field = await this.field;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await field.update(body);
      clearAllWebCache(req); // Field.js：模型/字段变更影响前台 ext_data 渲染
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const field = await this.field;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const result = await field.detail(id);
      res.json(this.success({data:result.data}));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const field = await this.field;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, mid, pageSize = 10 } = vdata;
      pageSize = capPageSize(pageSize);
      const data = await field.list(mid, parseInt(page) || 1, parseInt(pageSize) || 10);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 根据模型ID拉所有字段定义（无分页，给前端 DynamicForm 用）
  async findByMid(req, res, next) {
    try {
      const field = await this.field;
      const vdata = validated(findByMidSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { mid } = vdata;
      const fields = await field.getFieldDefinition(mid);
      // 与 Article.findField 保持一致形状：data:{ fields }，便于前端统一读取 res.data.fields
      res.json(this.success({ data: { fields } }));
    } catch (err) {
      next(err);
    }
  }
}

export default new FieldController();
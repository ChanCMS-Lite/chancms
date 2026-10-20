import { Controller } from "chanjs";

import { clearAllWebCache } from "../../../common/cacheclear.js";
import { validated } from "../../../common/validate.js";
import {
  createSchema,
  updateSchema,
  deleteSchema,
  findIdSchema,
  findSubIdSchema,
  searchSchema,
} from "../validator/Category.js";

class CategoryController extends Controller {
  constructor() {
    super();
    this.category = this.get("cms","Category","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(createSchema, req.body, res, this);
      if (data === undefined) return;
      const result = await category.create(data);
      this.clearCache(req);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(deleteSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await category.delete(id);
      // 只有真正删除成功才清除缓存
      if (result.success) {
        this.clearCache(req);
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(updateSchema, req.body, res, this);
      if (data === undefined) return;
      const result = await category.update(data);
      this.clearCache(req);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 清除缓存
  clearCache(req) {
    clearAllWebCache(req);
  }

  // 查
  async find(req, res, next) {
    try {
      const category = await this.category;
      // 返回完整栏目树；各模块的域隔离由前端 markForeignDisabled 标 disabled 实现
      const data = await category.find();
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async findId(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(findIdSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await category.findId(id);
      res.json(this.success({ data: result }));
    } catch (err) {
      next(err);
    }
  }

  // 查子栏目
  async findSubId(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(findSubIdSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await category.findSubId(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 搜索栏目
  async search(req, res, next) {
    try {
      const category = await this.category;
      const data = validated(searchSchema, req.query, res, this);
      if (data === undefined) return;
      const { q } = data;
      const result = await category.search(q);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
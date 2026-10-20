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
} from "../validator/Tag.js";

class TagController extends Controller {
  constructor() {
    super();
    this.tag = this.get("cms","Tag","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const tag = await this.tag;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await tag.create(body);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const tag = await this.tag;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await tag.delete(id);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const tag = await this.tag;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await tag.update(body);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const tag = await this.tag;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await tag.detail(id);
      if (!data.success) {
        res.json(this.fail({ msg: data.msg, code: data.code }));
        return;
      }
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const tag = await this.tag;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, pageSize = 50, cid } = vdata;
      pageSize = capPageSize(pageSize);
      const args = [parseInt(page) || 1, parseInt(pageSize) || 50];
      if (cid !== undefined) args.push(cid);
      const data = await tag.list(...args);
     res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  async has(req, res, next) {
    try {
      const tag = await this.tag;
      const { path, cid } = req.query;
      const exists = await tag.has(path, cid);
      if (exists) {
        res.json({ success: true, code: 0, msg: '标签已存在', data: true });
      } else {
        res.json({ success: true, code: 0, msg: '标签不存在', data: false });
      }
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const tag = await this.tag;
      const vdata = validated(searchSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, keyword, pageSize = 10, cid } = vdata;
      pageSize = capPageSize(pageSize);
      const args = [keyword, parseInt(page) || 1, parseInt(pageSize) || 10];
      if (cid !== undefined) args.push(cid);
      const data = await tag.search(...args);
     res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new TagController();
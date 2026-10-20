import { Controller } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { validated } from "../../../common/validate.js";

import { clearAllWebCache } from "../../../common/cacheclear.js";
import { formatDateFields } from "chanjs/utils/index.js";

import {
  createSchema,
  updateSchema,
  deleteSchema,
  detailSchema,
  searchSchema,
  listSchema,
} from "../validator/Frag.js";

class FragController extends Controller {
  constructor() {
    super();
    this.frag = this.get("cms","Frag","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const frag = await this.frag;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const result = await frag.create(body);
      // 服务层失败（如非法 cid 1006）原样透传，失败分支不清缓存（数据未变化）
      if (result && result.success === false) {
        res.json(result);
        return;
      }
      clearAllWebCache(req);
      res.json(this.success({ data: { id: result?.data?.insertId } }));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const frag = await this.frag;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await frag.delete(id);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const frag = await this.frag;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const result = await frag.update(body);
      if (result && result.success === false) {
        clearAllWebCache(req);
        res.json(result);
        return;
      }
      clearAllWebCache(req);
      res.json(this.success({}));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const frag = await this.frag;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await frag.detail(id);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const frag = await this.frag;
      const vdata = validated(searchSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, keywords, pageSize = 20 } = vdata;
      pageSize = capPageSize(pageSize);
      const data = await frag.search(keywords, parseInt(page) || 1, parseInt(pageSize) || 20);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const frag = await this.frag;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, pageSize = 10 } = vdata;
      pageSize = capPageSize(pageSize);
      const data = await frag.list(parseInt(page) || 1, parseInt(pageSize) || 10);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new FragController();
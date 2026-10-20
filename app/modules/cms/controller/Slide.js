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
} from "../validator/Slide.js";

class SlideController extends Controller {
  constructor() {
    super();
    this.slide = this.get("cms","Slide","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const slide = await this.slide;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const result = await slide.create(body);
      // 服务层失败（如非法 cid 1006）原样透传
      if (result && result.success === false) {
        clearAllWebCache(req);
        res.json(result);
        return;
      }
      // 轮播图影响首页，清理首页缓存
      clearAllWebCache(req);
      res.json(this.success({ data: { id: result?.data?.insertId } }));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const slide = await this.slide;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await slide.delete(id);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const slide = await this.slide;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const result = await slide.update(body);
      if (result && result.success === false) {
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
      const slide = await this.slide;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await slide.detail(id);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const slide = await this.slide;
      const vdata = validated(searchSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page, keyword, cid = 0, pageSize = 10 } = vdata;
      pageSize = capPageSize(pageSize);
      const data = await slide.search(keyword, page, pageSize, +cid);
      data.list = formatDateFields(data.list);
      res.json(this.success({ data }));
    } catch (err) {
      next(err);
    }
  }

  // 列表（带关键词搜索）
  async list(req, res, next) {
    try {
      const slide = await this.slide;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const page = parseInt(vdata.page) || 1;
      let pageSize = parseInt(vdata.pageSize) || 10;
      pageSize = capPageSize(pageSize);
      const keyword = (vdata.keyword || "").trim();
      let data;
      if (keyword) {
        data = await slide.search(keyword, page, pageSize);
      } else {
        const result = await slide.list(page, pageSize);
        data = result.data;
      }
      data.list = formatDateFields(data.list);
      res.json(this.success({ data }));
    } catch (err) {
      next(err);
    }
  }

}

export default new SlideController();
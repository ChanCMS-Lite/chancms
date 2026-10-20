import { Controller, logger } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";

import { clearAllWebCache } from "../../../common/cacheclear.js";
import { validated } from "../../../common/validate.js";
import { normalizeContentTypes } from "../../../common/content-types.js";
import {
  createSchema,
  updateSchema,
  detailSchema,
  deleteSchema,
  searchSchema,
  listSchema,
  findFieldSchema,
} from "../validator/Article.js";

class ArticleController extends Controller {
  constructor() {
    super();
    this.article = this.get("cms","Article","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(createSchema, req.body, res, this);
      if (data === undefined) return;
      const body = data;
      const { uid } = req.user || {};
      if (uid) {
        body.defaultParams = body.defaultParams || {};
        body.defaultParams.user_id = uid;
      }
      const result = await article.create(body);
      // 业务校验失败（如栏目类型不匹配）原样返回，避免被 success() 包装成 code=0 误导前端
      if (result && result.success === false) {
        res.json(result);
        return;
      }
      // 新文章影响首页、栏目列表、面包屑等，全量清前台缓存
      clearAllWebCache(req);
      res.json(this.success(result));
    } catch (err) {
      logger.error('[ArticleController.create] 错误:', err);
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(deleteSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await article.delete(id);
      // 删除影响首页、列表、详情与面包屑，全量清前台缓存
      clearAllWebCache(req);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(updateSchema, req.body, res, this);
      if (data === undefined) return;
      // 展开 defaultParams 到顶层（与 create 一致；否则 updateData 会带 defaultParams 嵌套对象 → Unknown column）
      let body = data;
      if (body.defaultParams && typeof body.defaultParams === 'object') {
        body = { ...body.defaultParams, ...body, id: data.id };
        delete body.defaultParams;
      }
      const { uid } = req.user || {};
      if (uid) {
        body.user_id = uid;
      }
      // 处理 subCid 为空数组或 undefined 的情况
      if (body.defaultParams) {
        if (Array.isArray(body.defaultParams.subCid) && body.defaultParams.subCid.length === 0) {
          body.defaultParams.subCid = '';
        } else if (body.defaultParams.subCid === undefined || body.defaultParams.subCid === null) {
          body.defaultParams.subCid = '';
        }
      }
      const result = await article.update(body);
      // 业务校验失败（如栏目类型不匹配）原样返回，避免被 success() 包装成 code=0 误导前端
      if (result && result.success === false) {
        res.json(result);
        return;
      }
      // 更新影响首页、栏目列表、详情与面包屑，全量清前台缓存
      clearAllWebCache(req);
      res.json(this.success(result));
    } catch (err) {
      logger.error('[ArticleController.update] 错误:', err);
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(detailSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await article.detail(id);
      // 记录不存在时原样返回 success:false，避免被 success() 包装成 code=0 误导前端
      if (result && result.success === false) {
        res.json(result);
        return;
      }
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(searchSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, keyword, cid = 0, pageSize = 20, id, content_type } = data;
      pageSize = capPageSize(pageSize);
      const result = await article.search(keyword, page, pageSize, +cid, id, normalizeContentTypes(content_type));
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(listSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, cid, pageSize = 10 } = data;
      pageSize = capPageSize(pageSize);
      const result = await article.list(page, pageSize, cid);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async findField(req, res, next) {
    try {
      const article = await this.article;
      const data = validated(findFieldSchema, req.query, res, this);
      if (data === undefined) return;
      const { mid, cid } = data;
      const result = await article.findField(mid, cid);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async statistics(req, res, next) {
    try {
      const article = await this.article;
      const result = await article.tongji();
      res.json(this.success({
        data: result.data
      }));
    } catch (err) {
      next(err);
    }
  }

};

export default new ArticleController();
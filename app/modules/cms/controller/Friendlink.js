import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";

import { clearAllWebCache } from "../../../common/cacheclear.js";
import { formatDateFields } from "chanjs/utils/index.js";

import {
  createSchema,
  updateSchema,
  deleteSchema,
  detailSchema,
  listSchema,
} from "../validator/Friendlink.js";

class FriendlinkController extends Controller {
  constructor() {
    super();
    this.friendlink = this.get("cms","Friendlink","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const friendlink = await this.friendlink;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      // 必须是新的绑定：validated 返回的 body 是 const，直接对 body 赋值会抛
      //    TypeError: Assignment to constant variable
      const data = await friendlink.create(formatDateFields(body));
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const friendlink = await this.friendlink;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await friendlink.delete(id);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const friendlink = await this.friendlink;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await friendlink.update(body);
      clearAllWebCache(req);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const friendlink = await this.friendlink;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const result = await friendlink.detail(id);
      res.json(this.success({data:result.data}))
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const friendlink = await this.friendlink;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const page = parseInt(vdata.page) || 1;
      const pageSize = 10;
      const keyword = (vdata.keyword || "").trim();
      const result = keyword
        ? await friendlink.search(keyword, page, pageSize)
        : await friendlink.list(page, pageSize);
      result.data.list = formatDateFields(result.data.list);
      res.json(this.success({data:result.data}));
    } catch (err) {
      next(err);
    }
  }
}

export default new FriendlinkController();
import { Controller } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { formatDateFields } from "chanjs/utils/index.js";
import { validated } from "../../../common/validate.js";
import { createSchema, deleteSchema, listSchema, likeSchema, articleCommentsSchema, commentAuditSchema } from "../validator/Comment.js";

class CommentController extends Controller {
  constructor() {
    super();
    this.Comment = this.get("member", "Comment", "service");   // 一次性预取，方法内 await 复用
  }

  /**
   * @description 获取会员评论列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async getComments(req, res, next) {
    try {
      const Comment = await this.Comment;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { uid } = req.user;
      let { page = 1, pageSize = 10 } = req.query;
      pageSize = capPageSize(pageSize);
      const result = await Comment.list(uid, parseInt(page) || 1, parseInt(pageSize) || 10);
      result.data.list = formatDateFields(result.data.list);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 添加会员评论
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async addComment(req, res, next) {
    try {
      const Comment = await this.Comment;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const { uid } = req.user;
      const { articleId, content, parentId, replyToMemberId } = body;

      if (!articleId || !content) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Comment.create(uid, articleId, content, parentId, replyToMemberId);
      res.json(this.success({ data: result }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除会员评论
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async deleteComment(req, res, next) {
    try {
      const Comment = await this.Comment;
      const vdata = validated(deleteSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { uid } = req.user;
      const { id } = vdata;

      if (!id) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Comment.delete(id, uid);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 点赞评论
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async likeComment(req, res, next) {
    try {
      const Comment = await this.Comment;
      const body = validated(likeSchema, req.body, res, this);
      if (body === undefined) return;
      const { uid } = req.user;
      // 兼容前端发送 {id} 的契约（前端 member.js 发的是 id，非 commentId）
      const commentId = body.id ?? body.commentId;

      if (!commentId) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      // 评论存在性校验，避免点赞不存在的评论返回 likeCount:undefined
      const exists = await Comment.checkExists(commentId);
      if (!exists) {
        return res.json(this.fail({ code: 1009, msg: "评论不存在" }));
      }

      const result = await Comment.like(uid, commentId);
      res.json(this.success({ data: result }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取文章评论列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async articleComments(req, res, next) {
    try {
      const Comment = await this.Comment;
      const vdata = validated(articleCommentsSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { articleId, page = 1, pageSize = 10 } = req.query;
      pageSize = capPageSize(pageSize);
      const uid = req.user ? req.user.uid : null;

      if (!articleId) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Comment.articleComments(articleId, parseInt(page) || 1, parseInt(pageSize) || 10, uid);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取后台评论列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async commentList(req, res, next) {
    try {
      const Comment = await this.Comment;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page = 1, pageSize = 10, status } = req.query;
      pageSize = capPageSize(pageSize);
      const result = await Comment.adminList(parseInt(page) || 1, parseInt(pageSize) || 10, status);
      result.data.list = formatDateFields(result.data.list);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 审核后台评论
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async commentAudit(req, res, next) {
    try {
      const Comment = await this.Comment;
      const body = validated(commentAuditSchema, req.body, res, this);
      if (body === undefined) return;
      const { uid } = req.user;
      const { id, status, auditRemark } = body;

      if (!id || !status) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Comment.audit(id, status, uid, auditRemark);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除后台评论
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async commentDelete(req, res, next) {
    try {
      const Comment = await this.Comment;
      const vdata = validated(deleteSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;

      if (!id) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Comment.adminDelete(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }
}

export default new CommentController();

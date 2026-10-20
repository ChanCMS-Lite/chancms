import { Repository, logger } from "chanjs";
import xss from "xss";
import { formatDateFields } from "chanjs/utils/index.js";
import { listPageResponse } from "../../../common/model-utils.js";


class CommentService extends Repository {
  constructor() {
    super("member_comment");
  }
 
  /**
   * @description 获取用户评论列表
   * @param {string} memberId - 用户ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Object} - 评论列表对象
   */
  async list(memberId, page = 1, pageSize = 10) {
    const total = await this.db(this.tableName)
      .where({ member_id: memberId })
      .count("id", { as: "count" });

    const offset = parseInt((page - 1) * pageSize);
    const list = await this.db(this.tableName)
      .select([
        "member_comment.id",
        "member_comment.content",
        "member_comment.status",
        "member_comment.created_at",
        "member_comment.like_count",
        "member_comment.parent_id",
        "member_comment.reply_to_member_id",
        "cms_article.id as articleId",
        "cms_article.title as articleTitle",
        "cms_category.slug as articlePath",
      ])
      .join("cms_article", "member_comment.article_id", "cms_article.id")
      .join("cms_category", "cms_article.cid", "cms_category.id")
      .where({ "member_comment.member_id": memberId })
      .orderBy("member_comment.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    // 批量附加「回复目标用户」显示名（见 attachReplyToUsernames）
    await this.attachReplyToUsernames(list);

    // 批量附加当前用户对每条评论的点赞状态（与 articleComments 口径一致），
    // 否则「我的评论」列表 is_liked 恒为 false，点赞按钮状态失准
    if (list.length > 0) {
      const likedMap = await this.checkLikeStatus(memberId, list.map((c) => c.id));
      list.forEach((c) => { c.is_liked = !!likedMap[c.id]; });
    }

    const count = total[0].count || 0;
    return listPageResponse(list, count, page, pageSize);
  }

  /**
   * @description 批量为评论附加「回复目标用户」显示名（reply_to_username）
   *   一次 in 查询代替逐条查询；nickname 优先，缺省回退 username
   * @param {Array<Object>} rows - 评论行（需含 reply_to_member_id 字段，原地修改）
   * @returns {Promise<void>}
   */
  async attachReplyToUsernames(rows) {
    const ids = new Set();
    rows.forEach((r) => {
      if (r.reply_to_member_id) ids.add(r.reply_to_member_id);
    });
    if (ids.size === 0) return;

    const members = await this.db("member")
      .select("id", "username", "nickname")
      .whereIn("id", Array.from(ids));
    const nameMap = {};
    members.forEach((m) => {
      nameMap[m.id] = m.nickname || m.username;
    });

    rows.forEach((r) => {
      if (r.reply_to_member_id && nameMap[r.reply_to_member_id]) {
        r.reply_to_username = nameMap[r.reply_to_member_id];
      }
    });
  }

  /**
   * @description 创建评论
   * @param {string} memberId - 用户ID
   * @param {string} articleId - 文章ID
   * @param {string} content - 评论内容
   * @param {string|null} parentId - 父评论ID
   * @param {string|null} replyToMemberId - 回复用户ID
   * @returns {Object} - 评论对象
   */
  async create(memberId, articleId, content, parentId = null, replyToMemberId = null) {
    const spamCheck = await this.checkSpam(memberId);
    if (!spamCheck.allowed) {
      return { success: false, msg: spamCheck.msg };
    }
    
    const cleanParentId = parentId && parentId !== 'undefined' ? parentId : null;
    const cleanReplyToMemberId = replyToMemberId && replyToMemberId !== 'undefined' ? replyToMemberId : null;

    // 过滤评论内容中的 XSS
    const safeContent = xss(content || '');

    // 插入评论
    // 新评论一律落「待审核」(1)：状态机 = 1 待审核 / 2 已通过 / 3 已拒绝。
    //    前台 articleComments 只展示 status='2'，必须由后台
    //    POST /member/v1/comment/audit 放行后才对外可见。
    const result = await this.insert({
      member_id: memberId,
      article_id: articleId,
      content: safeContent,
      status: "1",
      parent_id: cleanParentId,
      reply_to_member_id: cleanReplyToMemberId,
    });
    
    // Repository.insert 已归一化两种 knex 返回形态（mysql [id] / pg returning [{id}]），
    // 统一返回 { data: { insertId } }，无需再按分支解析
    const id = parseInt(result?.data?.insertId, 10);
    
    if (isNaN(id) || id <= 0) {
      return {
        id: null,
        content: content,
        status: "1",
        created_at: new Date().toISOString(),
        parent_id: cleanParentId,
        reply_to_member_id: cleanReplyToMemberId,
        like_count: 0,
        username: null,
        nickname: null,
        avatar: null,
        member_id: memberId,
        replies: [],
        is_liked: false
      };
    }
    
    // 查询评论详情
    const comment = await this.db(this.tableName)
      .select([
        "member_comment.id",
        "member_comment.content",
        "member_comment.status",
        "member_comment.created_at",
        "member_comment.parent_id",
        "member_comment.reply_to_member_id",
        "member_comment.like_count",
        "member.username",
        "member.nickname",
        "member.avatar",
        "member_comment.member_id",
      ])
      .join("member", "member_comment.member_id", "member.id")
      .where({ "member_comment.id": id })
      .first();
    
    const formattedComment = formatDateFields([comment], ['created_at'])[0];
    formattedComment.replies = [];
    formattedComment.is_liked = false;
    
    return formattedComment;
  }

  /**
   * @description 获取评论配置
   * @returns {Object} - 评论配置对象
   */
  async getCommentConfig() {
    const configs = await this.db('sys_config')
      .where({ type_code: 'comment_config', status: '1' })
      .select('config_key', 'config_value');
    
    const configMap = {};
    configs.forEach(c => {
      configMap[c.config_key] = c.config_value;
    });
    
    return {
      minLength: parseInt(configMap.minLength) || 5,
      maxLength: parseInt(configMap.maxLength) || 500,
      maxLinks: parseInt(configMap.maxLinks) || 2,
      spamInterval: parseInt(configMap.spamInterval) || 60,
      spamLimit: parseInt(configMap.spamLimit) || 3,
      sensitiveWords: configMap.sensitiveWords || '',
      enableSensitiveFilter: configMap.enableSensitiveFilter === '1',
      enableXSSFilter: configMap.enableXSSFilter === '1',
      enableLinkFilter: configMap.enableLinkFilter === '1'
    };
  }

  /**
   * @description 检查评论是否为垃圾评论
   * @param {string} memberId - 用户ID
   * @returns {Object} - 检查结果对象
   */
  async checkSpam(memberId) {
    const config = await this.getCommentConfig();
    const interval = config.spamInterval;
    const limit = config.spamLimit;
    
    // 兼容 MySQL 和 SQLite 的日期查询
    const dbType = process.env.DB_TYPE || 'mysql';
    let recentComments;

    if (dbType === 'sqlite') {
      // SQLite 使用 datetime 函数
      const cutoffTime = new Date(Date.now() - interval * 1000).toISOString();
      recentComments = await this.db(this.tableName)
        .where({ member_id: memberId })
        .where('created_at', '>', cutoffTime)
        .orderBy('created_at', 'desc')
        .limit(limit);
    } else if (dbType === 'pg') {
      // PG 用 now() - interval 参数化等价 DATE_SUB
      recentComments = await this.db(this.tableName)
        .where({ member_id: memberId })
        .whereRaw(`created_at > now() - (? * interval '1 second')`, [interval])
        .orderBy('created_at', 'desc')
        .limit(limit);
    } else {
      // MySQL 使用 DATE_SUB
      recentComments = await this.db(this.tableName)
        .where({ member_id: memberId })
        .whereRaw(`created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)`, [interval])
        .orderBy('created_at', 'desc')
        .limit(limit);
    }
    
    if (recentComments.length >= limit) {
      return {
        allowed: false,
        msg: `评论过于频繁，请${config.spamInterval}秒后再试`
      };
    }
    
    return { allowed: true };
  }

  /**
   * @description 删除评论
   * @param {string} id - 评论ID
   * @param {string} memberId - 用户ID
   * @returns {Object} - 删除结果对象
   */
  async delete(id, memberId) {
    const res = await this.db(this.tableName)
      .where({ id, member_id: memberId })
      .delete();
    return res;
  }

  /**
   * @description 获取评论列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {string} status - 状态
   * @returns {Object} - 评论列表对象
   */
  async adminList(page = 1, pageSize = 10, status = "") {
    let countQuery = this.db(this.tableName);
    let listQuery = this.db(this.tableName);

    if (status) {
      countQuery = countQuery.where({ "member_comment.status": status });
      listQuery = listQuery.where({ "member_comment.status": status });
    }

    const total = await countQuery.count("member_comment.id", { as: "count" });

    const offset = parseInt((page - 1) * pageSize);
    const list = await listQuery
      .select([
        "member_comment.id",
        "member_comment.content",
        "member_comment.status",
        "member_comment.audit_time",
        "member_comment.audit_remark",
        "member_comment.created_at",
        "member.username",
        "member.nickname",
        "cms_article.id as articleId",
        "cms_article.title as articleTitle",
      ])
      .join("member", "member_comment.member_id", "member.id")
      .join("cms_article", "member_comment.article_id", "cms_article.id")
      .orderBy("member_comment.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const count = total[0].count || 0;
    return listPageResponse(list, count, page, pageSize);
  }

  /**
   * @description 审核评论
   * @param {string} id - 评论ID
   * @param {string} status - 状态
   * @param {string} auditUserId - 审核用户ID
   * @param {string} auditRemark - 审核备注
   * @returns {Object} - 审核结果对象
   */
  async audit(id, status, auditUserId, auditRemark = "") {
    const res = await this.db(this.tableName)
      .where({ id })
      .update({
        status: status,
        audit_time: new Date(),
        audit_user_id: auditUserId,
        audit_remark: auditRemark,
      });
    return res;
  }

  /**
   * @description 删除评论
   * @param {string} id - 评论ID
   * @returns {Object} - 删除结果对象
   */
  async adminDelete(id) {
    const res = await this.delById(id);
    return res;
  }

  /**
   * @description 获取文章评论列表
   * @param {string} articleId - 文章ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @param {string} memberId - 用户ID
   * @returns {Object} - 评论列表对象
   */
  async articleComments(articleId, page = 1, pageSize = 10, memberId = null) {

    //获取
    const totalResult = await this.db(this.tableName)
      .where({ article_id: articleId, status: "2", parent_id: null })
      .count("id", { as: "count" });
    const total = totalResult[0].count || 0;

    const offset = parseInt((page - 1) * pageSize);
    const rootList = await this.db(this.tableName)
      .select([
        "member_comment.id",
        "member_comment.content",
        "member_comment.status",
        "member_comment.created_at",
        "member_comment.parent_id",
        "member_comment.reply_to_member_id",
        "member_comment.like_count",
        "member.username",
        "member.nickname",
        "member.avatar",
        "member_comment.member_id",
      ])
      .join("member", "member_comment.member_id", "member.id")
      .where({ 
        "member_comment.article_id": articleId, 
        "member_comment.status": "2",
        "member_comment.parent_id": null 
      })
      .orderBy("member_comment.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const rootIds = rootList.map(c => c.id);
    // 使用 Set 替代 Array.includes，将 O(n) 查找降为 O(1)
    const rootIdSet = new Set(rootIds);
    let allRepliesList = [];
    
    if (rootIds.length > 0) {
      // 获取所有回复评论（限定上限 500，防止评论爆量时全表加载导致 OOM）
      const repliesList = await this.db(this.tableName)
        .select([
          "member_comment.id",
          "member_comment.content",
          "member_comment.status",
          "member_comment.created_at",
          "member_comment.parent_id",
          "member_comment.reply_to_member_id",
          "member_comment.like_count",
          "member.username",
          "member.nickname",
          "member.avatar",
          "member_comment.member_id",
        ])
        .join("member", "member_comment.member_id", "member.id")
        .where({ "member_comment.article_id": articleId, "member_comment.status": "2" })
        .whereNotNull("member_comment.parent_id")
        .orderBy("member_comment.created_at", "asc")
        .limit(500);
      
      const allCommentsMap = {};
      rootList.forEach(c => {
        allCommentsMap[c.id] = { ...c, isReply: false };
      });
      repliesList.forEach(r => {
        allCommentsMap[r.id] = { ...r, isReply: true };
      });
      
      repliesList.forEach(reply => {
        let rootId = reply.parent_id;
        let parent = allCommentsMap[rootId];
        
        while (parent && parent.parent_id) {
          rootId = parent.parent_id;
          parent = allCommentsMap[rootId];
        }
        
        if (rootIdSet.has(rootId)) {
          allRepliesList.push(reply);
        }
      });
    }

    const formattedRootList = formatDateFields(rootList, ['created_at']);
    const formattedRepliesList = formatDateFields(allRepliesList, ['created_at']);

    const commentMap = {};
    formattedRootList.forEach(comment => {
      comment.replies = [];
      comment.is_liked = false;
      commentMap[comment.id] = comment;
    });
    formattedRepliesList.forEach(reply => {
      reply.replies = [];
      reply.is_liked = false;
      commentMap[reply.id] = reply;
    });

    // 批量附加「回复目标用户」显示名，再挂到根评论的 replies 树
    await this.attachReplyToUsernames(formattedRepliesList);
    formattedRepliesList.forEach(reply => {
      const parent = commentMap[reply.parent_id];
      if (parent) parent.replies.push(reply);
    });

    if (memberId) {
      const allCommentIds = [
        ...formattedRootList.map(c => c.id),
        ...formattedRepliesList.map(c => c.id)
      ];
      
      if (allCommentIds.length > 0) {
        const likedMap = await this.checkLikeStatus(memberId, allCommentIds);
        
        formattedRootList.forEach(comment => {
          if (likedMap[comment.id]) comment.is_liked = true;
          comment.replies.forEach(reply => {
            if (likedMap[reply.id]) reply.is_liked = true;
          });
        });
      }
    }

    return listPageResponse(formattedRootList, total, page, pageSize);
  }

  /**
   * @description 检查评论是否存在
   * @param {number} commentId - 评论ID
   * @returns {boolean}
   */
  async checkExists(commentId) {
    const row = await this.db(this.tableName)
      .select("id")
      .where({ id: commentId })
      .first();
    return !!row;
  }

  /**
   * @description 点赞评论
   * @param {string} memberId - 用户ID
   * @param {string} commentId - 评论ID
   * @returns {Object} - 点赞结果对象
   */
  async like(memberId, commentId) {
    // 使用事务保证 member_comment_like 的 insert/delete 与 member_comment.like_count 的 increment/decrement 原子性
    // 原逻辑两步独立 SQL，异常时会导致点赞记录与计数不一致
    try {
      return await this.db.transaction(async (trx) => {
        const existing = await trx("member_comment_like")
          .where({ comment_id: commentId, member_id: memberId })
          .first();

        if (existing) {
          await trx("member_comment_like")
            .where({ comment_id: commentId, member_id: memberId })
            .delete();

          await trx(this.tableName)
            .where({ id: commentId })
            .decrement("like_count", 1);

          const comment = await trx(this.tableName)
            .select("like_count")
            .where({ id: commentId })
            .first();

          return { success: true, msg: "取消点赞", isLiked: false, likeCount: comment.like_count };
        }

        await trx("member_comment_like").insert({
          comment_id: commentId,
          member_id: memberId,
          created_at: new Date(),
        });

        await trx(this.tableName)
          .where({ id: commentId })
          .increment("like_count", 1);

        const comment = await trx(this.tableName)
          .select("like_count")
          .where({ id: commentId })
          .first();

        return { success: true, msg: "点赞成功", isLiked: true, likeCount: comment.like_count };
      });
    } catch (err) {
      // 并发场景主键冲突视为已点赞，避免暴露数据库错误给前端
      if (err.code === 'ER_DUP_ENTRY') {
        return { success: false, msg: "已点赞过" };
      }
      logger.error("[Comment.like] 失败:", err.message);
      throw err;
    }
  }

  async checkLikeStatus(memberId, commentIds) {
    if (!memberId || !commentIds || commentIds.length === 0) {
      return {};
    }

    const likedComments = await this.db("member_comment_like")
      .select("comment_id")
      .where({ member_id: memberId })
      .whereIn("comment_id", commentIds);

    const likedMap = {};
    likedComments.forEach(item => {
      likedMap[item.comment_id] = true;
    });

    return likedMap;
  }
}

export default new CommentService();
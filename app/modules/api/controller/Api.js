import { Controller, logger } from "chanjs";
import { loader } from "chanjs";
import { getClientType } from "../../../common/client-type.js";
import { normalizePage } from "../../../common/pagination.js";

/**
 * C 端聚合控制器
 * 仅做「路由聚合 + 参数透传 + 响应裁剪」，不实现任何业务逻辑；
 * 登录透传到 member 控制器（Lite 仅用户名密码登录），读接口复用现有 cms / member service。
 *
 * 响应归一化：各 service 返回形态不一（Article.list 扁平 / Slide 包 success），
 * 统一经 wrap() 收敛为 { success, code, msg, data }。
 */
class ApiController extends Controller {
  constructor() {
    super();
    // service 句柄（this.get 返回 Promise，方法内 await）
    this.Member = this.get("member", "Member", "service");
    this.Article = this.get("cms", "Article", "service");
    this.Category = this.get("cms", "Category", "service");
    this.Site = this.get("cms", "Site", "service");
    this.Slide = this.get("cms", "Slide", "service");
    this.Friendlink = this.get("cms", "Friendlink", "service");
    this.Tag = this.get("cms", "Tag", "service");
    this.Frag = this.get("cms", "Frag", "service");
    this.Comment = this.get("member", "Comment", "service");
    this.Favorite = this.get("member", "Favorite", "service");
    // 现有控制器（透传登录）
    this.MemberCtrl = loader.loadController("member");
  }

  /** 归一化各 service 返回 → { success, code, msg, data } */
  wrap(result) {
    if (result && result.success === false) return this.fail({ msg: result.msg || "操作失败" });
    const data = result && Object.prototype.hasOwnProperty.call(result, "data") ? result.data : result;
    return this.success({ data });
  }

  // ===== 登录（透传 member 用户名密码登录）=====
  async login(req, res, next) {
    try {
      if (!req.headers["x-client-type"]) {
        req.headers["x-client-type"] = "h5";
      }
      const MemberCtrl = await this.MemberCtrl;
      return MemberCtrl.Member.login(req, res, next);
    } catch (err) {
      logger.error("[Api.login]", err);
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const MemberCtrl = await this.MemberCtrl;
      return MemberCtrl.Member.logout(req, res, next);
    } catch (err) {
      logger.error("[Api.logout]", err);
      next(err);
    }
  }

  // ===== 受保护：会员信息 =====
  async me(req, res, next) {
    try {
      const Member = await this.Member;
      const { uid } = req.user;
      const result = await Member.detail(uid);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.me]", err);
      next(err);
    }
  }

  // ===== 受保护：我的评论 =====
  async comments(req, res, next) {
    try {
      const Comment = await this.Comment;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 10);
      const result = await Comment.list(req.user.uid, page, pageSize);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.comments]", err);
      next(err);
    }
  }

  // ===== 受保护：我的收藏（列表）=====
  async favorites(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 10);
      const { type = "", categoryId = 0, keyword = "" } = req.query;
      const result = await Favorite.list(req.user.uid, {
        page,
        pageSize,
        type,
        categoryId: Number(categoryId) || 0,
        keyword,
      });
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.favorites]", err);
      next(err);
    }
  }

  // ===== 受保护：收藏新增 =====
  async favoriteAdd(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const { articleId, articleTitle, articleCover, articleSummary, articleUrl, type = "article", categoryId = 0, categoryName = "" } = req.body || {};
      const result = await Favorite.add(req.user.uid, {
        articleId, articleTitle, articleCover, articleSummary, articleUrl, type, categoryId, categoryName,
      });
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.favoriteAdd]", err);
      next(err);
    }
  }

  // ===== 受保护：收藏删除 =====
  async favoriteDelete(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const { id } = req.params;
      const result = await Favorite.delete(Number(id), req.user.uid);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.favoriteDelete]", err);
      next(err);
    }
  }

  // ===== 受保护：发布评论 =====
  async commentCreate(req, res, next) {
    try {
      const Comment = await this.Comment;
      const { articleId, content, parentId = null, replyToMemberId = null } = req.body || {};
      // 入参非空校验（与 member 端口径对齐）：防止空 articleId/content 直接落库
      if (!articleId || !content || !String(content).trim()) {
        return res.json(this.wrap({ success: false, code: 1006, msg: "文章与评论内容不能为空" }));
      }
      const result = await Comment.create(req.user.uid, Number(articleId), content, parentId, replyToMemberId);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.commentCreate]", err);
      next(err);
    }
  }

  // ===== 受保护：评论点赞 =====
  async commentLike(req, res, next) {
    try {
      const Comment = await this.Comment;
      const { commentId } = req.body || {};
      if (!commentId) {
        return res.json(this.wrap({ success: false, code: 1006, msg: "评论ID不能为空" }));
      }
      // 点赞前确认评论存在，避免对不存在评论点赞导致 like() 内解构 count 抛 500
      if (!(await Comment.checkExists(Number(commentId)))) {
        return res.json(this.wrap({ success: false, code: 1006, msg: "评论不存在" }));
      }
      const result = await Comment.like(req.user.uid, Number(commentId));
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.commentLike]", err);
      next(err);
    }
  }

  // ===== 公开读：站点信息 =====
  async siteInfo(req, res, next) {
    try {
      const Site = await this.Site;
      const result = await Site.info();
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.siteInfo]", err);
      next(err);
    }
  }

  // ===== 公开读：栏目树 =====
  async categories(req, res, next) {
    try {
      const Category = await this.Category;
      const result = await Category.find();
      const list = (result && result.data) || [];
      // 构建层级树（pid=0 为根）
      const map = new Map();
      const roots = [];
      list.forEach((c) => map.set(c.id, { ...c, children: [] }));
      list.forEach((c) => {
        const node = map.get(c.id);
        if (c.pid && map.has(c.pid)) map.get(c.pid).children.push(node);
        else roots.push(node);
      });
      return res.json(this.success({ data: { list, tree: roots } }));
    } catch (err) {
      logger.error("[Api.categories]", err);
      next(err);
    }
  }

  // ===== 公开读：栏目详情 =====
  async categoryDetail(req, res, next) {
    try {
      const Category = await this.Category;
      const result = await Category.findId(req.params.id);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.categoryDetail]", err);
      next(err);
    }
  }

  // ===== 公开读：栏目下文章列表 =====
  async categoryArticles(req, res, next) {
    try {
      const Article = await this.Article;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 10);
      const result = await Article.list(page, pageSize, Number(req.params.id));
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.categoryArticles]", err);
      next(err);
    }
  }

  // ===== 公开读：文章列表（支持 cid 筛选 + keyword 搜索）=====
  async articles(req, res, next) {
    try {
      const Article = await this.Article;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 10);
      const { cid, keyword } = req.query;
      const numCid = cid ? Number(cid) : 0;
      const result = keyword
        ? await Article.search(String(keyword), page, pageSize, numCid)
        : await Article.list(page, pageSize, cid ? numCid : undefined);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.articles]", err);
      next(err);
    }
  }

  // ===== 公开读：文章详情 =====
  async articleDetail(req, res, next) {
    try {
      const Article = await this.Article;
      const result = await Article.detail(req.params.id);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.articleDetail]", err);
      next(err);
    }
  }

  // ===== 公开读：文章上一页 / 下一页 =====
  async articlePrevNext(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.json(this.fail({ msg: "参数无效" }));
      const row = await this.db("cms_article").where("id", id).first("id", "cid");
      if (!row) return res.json(this.fail({ msg: "文章不存在" }));
      const cols = ["id", "title", "cid", "img", "description"];
      const [prevRow, nextRow] = await Promise.all([
        this.db("cms_article").where("cid", row.cid).where("id", ">", id).orderBy("id", "asc").limit(1).select(...cols),
        this.db("cms_article").where("cid", row.cid).where("id", "<", id).orderBy("id", "desc").limit(1).select(...cols),
      ]);
      return res.json(this.success({
        data: { prev: prevRow[0] || null, next: nextRow[0] || null },
      }));
    } catch (err) {
      logger.error("[Api.articlePrevNext]", err);
      next(err);
    }
  }

  // ===== 公开读：文章评论（树形）=====
  async articleComments(req, res, next) {
    try {
      const Comment = await this.Comment;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 10);
      const articleId = req.params.id;
      const memberId = req.user ? req.user.uid : null;
      const result = await Comment.articleComments(Number(articleId), page, pageSize, memberId);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.articleComments]", err);
      next(err);
    }
  }

  // ===== 公开读：轮播图 =====
  async slides(req, res, next) {
    try {
      const Slide = await this.Slide;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 20);
      const result = await Slide.list(page, pageSize);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.slides]", err);
      next(err);
    }
  }

  // ===== 公开读：友情链接 =====
  async friendlinks(req, res, next) {
    try {
      const Friendlink = await this.Friendlink;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 50);
      const result = await Friendlink.list(page, pageSize);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.friendlinks]", err);
      next(err);
    }
  }

  // ===== 公开读：标签 =====
  async tags(req, res, next) {
    try {
      const Tag = await this.Tag;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 50);
      const { cid } = req.query;
      const result = await Tag.list(page, pageSize, cid ? Number(cid) : undefined);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.tags]", err);
      next(err);
    }
  }

  // ===== 公开读：碎片 / 区块 =====
  async fragments(req, res, next) {
    try {
      const Frag = await this.Frag;
      const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize, 50);
      const result = await Frag.list(page, pageSize);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.fragments]", err);
      next(err);
    }
  }

  // ===== 公开读：单页（content_type=page 的文章）=====
  async pageDetail(req, res, next) {
    try {
      const Article = await this.Article;
      const result = await Article.detail(req.params.id);
      return res.json(this.wrap(result));
    } catch (err) {
      logger.error("[Api.pageDetail]", err);
      next(err);
    }
  }
}

export default new ApiController();

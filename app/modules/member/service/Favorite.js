import { Repository } from "chanjs";
import { listPageResponse } from "../../../common/model-utils.js";

class FavoriteService extends Repository {
  constructor() {
    super("member_favorite");
  }

  async list(memberId, { page = 1, pageSize = 10, type = "", categoryId = 0, keyword = "" } = {}) {
    const query = this.db(this.tableName).where({ member_id: memberId });
    if (type) query.where("type", type);
    if (categoryId) query.where("category_id", categoryId);
    if (keyword) {
      query.where(function () {
        this.where("article_title", "like", `%${keyword}%`).orWhere("article_summary", "like", `%${keyword}%`);
      });
    }
    const total = await query.clone().count("id", { as: "count" });

    const offset = parseInt((page - 1) * pageSize);
    const list = await query
      .select([
        "member_favorite.id",
        "member_favorite.article_id",
        "member_favorite.article_title",
        "member_favorite.article_cover",
        "member_favorite.article_summary",
        "member_favorite.article_url",
        "member_favorite.type",
        "member_favorite.category_id",
        "member_favorite.category_name",
        "member_favorite.created_at",
      ])
      .orderBy("member_favorite.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const count = total[0].count || 0;
    return listPageResponse(list, count, page, pageSize);
  }

  async add(memberId, { articleId, articleTitle, articleCover, articleSummary, articleUrl, type = "article", categoryId = 0, categoryName = "" }) {
    const existing = await this.db(this.tableName)
      .where({ member_id: memberId, article_id: articleId, type })
      .first();

    if (existing) {
      return {
        success: false,
        code: 1005,
        msg: "已收藏该内容",
        data: { id: existing.id },
      };
    }

    // 栏目名称冗余存储：详情页只传了栏目ID时，回查栏目名，保证收藏列表可按栏目展示/筛选
    let cateName = categoryName;
    if (!cateName && categoryId) {
      const cate = await this.db("cms_category").where({ id: categoryId }).first("name");
      cateName = cate?.name || "";
    }

    const res = await this.insert({
      member_id: memberId,
      article_id: articleId,
      article_title: articleTitle,
      article_cover: articleCover,
      article_summary: articleSummary,
      article_url: articleUrl,
      type,
      category_id: categoryId,
      category_name: cateName,
    });
    return {
      success: true,
      code: 0,
      msg: "收藏成功",
      data: { id: res?.data?.insertId || 0 },
    };
  }

  async delete(id, memberId) {
    const rows = await this.db(this.tableName)
      .where({ id, member_id: memberId })
      .delete();
    if (!rows) {
      return { success: false, code: 1006, msg: "收藏记录不存在", data: null };
    }
    return { success: true, code: 0, msg: "取消收藏成功", data: { affectedRows: rows } };
  }

  async adminList(page = 1, pageSize = 10, keyword = "") {
    const query = this.db(this.tableName)
      .join("member", "member_favorite.member_id", "member.id");
    if (keyword) {
      query.where(function () {
        this.where("member_favorite.article_title", "like", `%${keyword}%`)
          .orWhere("member.username", "like", `%${keyword}%`)
          .orWhere("member.nickname", "like", `%${keyword}%`);
      });
    }
    const total = await query.clone().count("member_favorite.id", { as: "count" });

    const offset = parseInt((page - 1) * pageSize);
    const list = await query
      .select([
        "member_favorite.id",
        "member_favorite.article_id",
        "member_favorite.article_title",
        "member_favorite.article_cover",
        "member_favorite.created_at",
        "member.username",
        "member.nickname",
      ])
      .orderBy("member_favorite.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const count = total[0].count || 0;
    return listPageResponse(list, count, page, pageSize);
  }

  async adminDelete(id) {
    const res = await this.delById(id);
    return res;
  }
}

export default new FavoriteService();
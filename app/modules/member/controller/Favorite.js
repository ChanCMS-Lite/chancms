import { Controller } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { formatDateFields } from "chanjs/utils/index.js";
import { validated } from "../../../common/validate.js";
import { createSchema, deleteSchema, listSchema, favoriteDeleteSchema } from "../validator/Favorite.js";

class FavoriteController extends Controller {
  constructor() {
    super();
    this.Favorite = this.get("member", "Favorite", "service");   // 一次性预取，方法内 await 复用
  }

  /**
   * @description 获取会员收藏列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async getFavorites(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { uid } = req.user;
      let { page = 1, pageSize = 10, type = "", categoryId = 0, keyword = "" } = req.query;
      pageSize = capPageSize(pageSize);
      const result = await Favorite.list(uid, {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 10,
        type: type || "",
        categoryId: parseInt(categoryId) || 0,
        keyword: keyword || "",
      });
      result.data.list = formatDateFields(result.data.list);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 添加会员收藏
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async addFavorite(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const { uid } = req.user;
      const { articleId, articleTitle, articleCover, articleSummary, articleUrl, type, categoryId, categoryName } = body;

      if (!articleId) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Favorite.add(uid, {
        articleId,
        articleTitle,
        articleCover,
        articleSummary,
        articleUrl,
        type: type || "article",
        categoryId: parseInt(categoryId) || 0,
        categoryName: categoryName || "",
      });
      // 直接透传 service 结果，保留 code=1005（已收藏）等业务状态，避免被 success() 抹平
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除会员收藏
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async deleteFavorite(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const vdata = validated(deleteSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { uid } = req.user;
      const { id } = vdata;

      if (!id) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Favorite.delete(id, uid);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取后台收藏列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async favoriteList(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      let { page = 1, pageSize = 10, keyword = "" } = req.query;
      pageSize = capPageSize(pageSize);
      const result = await Favorite.adminList(parseInt(page) || 1, parseInt(pageSize) || 10, keyword || "");
      result.data.list = formatDateFields(result.data.list);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除后台收藏
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async favoriteDelete(req, res, next) {
    try {
      const Favorite = await this.Favorite;
      const vdata = validated(favoriteDeleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const id = req.body?.id || req.query?.id;

      if (!id) {
        return res.json(this.fail({ msg: "参数不完整" }));
      }

      const result = await Favorite.adminDelete(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }
}

export default new FavoriteController();

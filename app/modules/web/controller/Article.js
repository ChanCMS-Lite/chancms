import { logger } from "chanjs";
import { CACHE_TTL } from "../../../common/cache-keys.js";
import { validated } from "../../../common/validate.js";
import { listSchema, articleSchema } from "../validator/page.js";
import {
    listGetParams,
    listDataParse,
    articleGetParams,
    articleDataParse,
} from "../utils/index.js";
import WebController from "../common/base.js";

// 文章控制器：栏目列表页（含 tag/keyword 筛选）+ 文章详情页
class ArticleController extends WebController {
    constructor() {
        super();
        this.home = this.get("web", "Home", "service");
    }

    // 栏目列表页
    async list(req, res, next) {
        try {
            const vdata = validated(listSchema, req.query, res, this);
            if (vdata === undefined) return;
            const home = await this.home;
            const { template, category, cate, cid, page, tagId, keyword } = listGetParams(req);

            if (!cid) {
                return next();
            }

            // 缓存 key 与 service 查询同口径（kw 已截断 10 字）
            const kw = (keyword || "").toString().trim().slice(0, 10);
            const data = await this.cachedData(
                `home:list:${cid}:${page}:${tagId || 0}:${encodeURIComponent(kw)}`,
                CACHE_TTL.LIST,
                () => home.list({ cid, page, categoryList: category, tagId, keyword: kw })
            );

            const { pageHtml, view, position, page: pageInfo } = listDataParse({
                cid,
                category,
                cate,
                page,
                data,
                tagId,
                keyword,
            });

            const { articleList, ...dataRest } = data || {};
            const list = articleList?.list || [];

            const bind = await this.categoryBind(category, cid);

            const renderData = {
                position,
                cate,
                pageHtml,
                page: pageInfo,
                list,
                keyword: kw,
                ...dataRest,
                ...bind,
            };

            await res.render(`${template}/${view}`, renderData);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    // 文章详情页
    async article(req, res, next) {
        try {
            const vdata = validated(articleSchema, req.params, res, this);
            if (vdata === undefined) return;
            const commonService = await this.commonService;
            const home = await this.home;
            const { id, template, category } = articleGetParams(req);

            if (!id) {
                return next();
            }

            const cached = await this.cachedData(`home:article:${id}`, CACHE_TTL.ARTICLE, () =>
                commonService.article(id)
            );

            if (!cached) {
                return next();
            }

            const article = cached;
            // 非阻塞浏览计数，+1 让当前页立即反映
            commonService.count({ id: article.id }).catch(() => {});
            article.pv = Number(article.pv || 0) + 1;

            if (article.content && article.editorType === "md") {
                const { marked } = await import("marked");
                article.content = marked.parse(article.content);
            }

            const cid = article.cid || "";
            const { cate, position, view } = articleDataParse({
                article,
                cid,
                category,
            });

            const data = await home.article({ id, cid, categoryList: category });
            const bind = await this.categoryBind(category, cid);

            await res.render(`${template}/${view}`, {
                ...data,
                cate,
                article,
                position,
                ...bind,
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}

export default new ArticleController();

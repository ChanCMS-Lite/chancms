import { logger } from "chanjs";
import { treeById } from "chanjs/utils/index.js";
import { CACHE_TTL } from "../../../common/cache-keys.js";
import { validated } from "../../../common/validate.js";
import { pageSchema } from "../validator/page.js";
import { resolveCategoryPath } from "../utils/index.js";
import WebController from "../common/base.js";

// 单页控制器：单页栏目页面（content_type=page）
// 路由规则：/:cate/page.html  /:cate/page-:id.html  /:cate1/:cate/page.html
class PageController extends WebController {
    /**
     * 单页栏目页面
     * URL 段解析出栏目（多段树链优先，单段 slug 全局兜底），
     * 仅对单页栏目（type=1）渲染，其余一律 404
     */
    async page(req, res, next) {
        try {
            const vdata = validated(pageSchema, req.params, res, this);
            if (vdata === undefined) return;
            const commonService = await this.commonService;
            const { template } = req.app.locals;
            const category = req.app.get("category");
            const { id: rawId } = req.params;
            const id = rawId ? Number(rawId) : null;

            const segments = [
                req.params.cate3,
                req.params.cate2,
                req.params.cate1,
                req.params.cate,
            ].filter(Boolean);

            let resolved = resolveCategoryPath(segments, category);
            if (!resolved) {
                // 兜底：单段 slug 直达深层栏目（如 /company/page.html），与列表页全局 slug 匹配口径对齐
                const lastSeg = segments[segments.length - 1];
                const hit = (category || []).find((c) => c && c.slug === lastSeg);
                if (hit) resolved = { cate: hit, id: hit.id, position: treeById(hit.id, category) };
            }
            if (!resolved) return next();
            const { cate, id: cid, position } = resolved;

            // 单页路由仅对单页栏目（type=1）有意义：列表栏目的 articleView 是详情模板
            // （如 pic-detail.html），拿到这里渲染空 article 会因模板变量未定义抛 5001
            if (String(cate.type) !== "1") {
                return next();
            }

            const pageData = await this.cachedData(`home:page:${cid}:${id || 0}`, CACHE_TTL.PAGE, () =>
                commonService.page({ cid, id })
            );
            const { article = null, list = [], children = [] } = pageData;

            // 无内容时回退父级章节导航
            let parentPage = null;
            if (!list.length && !children.length && cate && cate.pid) {
                parentPage = await this.cachedData(`home:page:${cate.pid}:0`, CACHE_TTL.PAGE, () =>
                    commonService.page({ cid: cate.pid })
                );
            }

            const finalArticle = article || {};

            // 非阻塞浏览计数，+1 让当前页立即反映
            if (finalArticle.id) {
                commonService.count({ id: finalArticle.id }).catch(() => {});
                finalArticle.pv = Number(finalArticle.pv || 0) + 1;
            }

            // 视图选择：指定文章走 article 配置，栏目单页走 cate 配置
            const viewTemplate = id
                ? finalArticle.articleView || cate?.articleView || "page-detail.html"
                : cate?.articleView || "page.html";

            // await：让模板渲染异常进入下方 try/catch（统一记日志 + 错误页），不 await 会绕过错误处理
            return await res.render(`${template}/${viewTemplate}`, {
                page: { list, children, parentPage },
                cate,
                position,
                article: finalArticle,
            });
        } catch (error) {
            // err 走对象形式（pino 对 (msg, string) 抛 TypeError 会掩盖真实错误）
            logger.error({ err: error }, "[Page Error]");
            next(error);
        }
    }
}

export default new PageController();

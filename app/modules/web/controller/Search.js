import { logger } from "chanjs";
import { CACHE_TTL } from "../../../common/cache-keys.js";
import { validated } from "../../../common/validate.js";
import { searchSchema } from "../validator/page.js";
import { searchParams, searchDataParse } from "../utils/index.js";
import WebController from "../common/base.js";

// 搜索控制器：全站搜索页（文章 + 商品双维，/search.html）
class SearchController extends WebController {
    constructor() {
        super();
        this.home = this.get("web", "Home", "service");
    }

    // 搜索页
    async search(req, res, next) {
        try {
            const vdata = validated(searchSchema, req.query, res, this);
            if (vdata === undefined) return;
            const home = await this.home;
            const { page, template, keywords, cid, type } = searchParams(req);

            // 空关键词不 404（点搜索直接进来是正常路径）：渲染搜索引导页（搜索框 + 分类 chips + 空态提示）
            // await：让模板渲染异常进入下方 try/catch（统一记日志 + 错误页），不 await 会绕过错误处理
            if (!keywords) {
                return await res.render(`${template}/search.html`, {
                    keywords: '',
                    cid: 0,
                    type: '',
                    search: { list: [], total: 0 },
                    products: { list: [], total: 0 },
                    pageHtml: '',
                    productPageHtml: '',
                });
            }

            const data = await this.cachedData(
                `home:search:${encodeURIComponent(keywords)}:${page}:${cid}:${type || ''}`,
                CACHE_TTL.SEARCH,
                () => home.search({ keywords, page, cid })
            );

            // 兜底：sys_config 的 search 配置缺 products/search 键时，模板属性访问先于 || 执行会崩 500
            if (!data.search) data.search = { list: [], total: 0 };
            if (!data.products) data.products = { list: [], total: 0 };

            const { pageHtml, productPageHtml, page: pageInfo } = searchDataParse({ data, keywords, page, cid, type });
            await res.render(`${template}/search.html`, {
                keywords,
                cid,
                type,
                ...data,
                pageHtml,
                productPageHtml,
                page: pageInfo,
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}

export default new SearchController();

import { getApp, logger } from "chanjs";
import { CACHE_TTL } from "../../../common/cache-keys.js";
import { validated } from "../../../common/validate.js";
import { tagSchema } from "../validator/page.js";
import { tagParams, tagDataParse } from "../utils/index.js";
import WebController from "../common/base.js";

// 标签控制器：标签文章聚合页（/tags/:path/tag.html）
class TagController extends WebController {
    constructor() {
        super();
        this.home = this.get("web", "Home", "service");
    }

    // 标签列表页
    async tag(req, res, next) {
        try {
            const vdata = validated(tagSchema, req.params, res, this);
            if (vdata === undefined) return;
            const home = await this.home;
            const { page, template, path, tag } = tagParams(req);

            // tag 不存在直接 404（不渲染空壳页）
            const tagRow = await getApp().db("cms_tag").where("path", path).first("id");
            if (!tagRow) {
                return next();
            }

            const data = await this.cachedData(`home:tag:${path}:${page}`, CACHE_TTL.TAG, () =>
                home.tag({ path, page })
            );

            const { pageHtml } = tagDataParse({ data, page, tag, path });
            await res.render(`${template}/tag.html`, {
                ...data,
                path,
                tag,
                pageHtml,
            });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}

export default new TagController();

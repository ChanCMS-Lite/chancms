// web 模块控制器基类：沉淀跨页面控制器的共享设施（service 注入 / 缓存样板 / 统一 404 / 栏目绑定注入）
// 各页面控制器（Home/Product/…）extends 本类，业务方法保持各自文件内聚
import { Controller, getApp, logger } from "chanjs";
import { store } from "chanjs/storage/index.js";
import { categoryIdsWithAncestors } from "../../../common/category-scope.js";

class WebController extends Controller {
    constructor() {
        super();
        this.commonService = this.get("web", "Common", "service");
    }

    // store 缓存样板：读缓存 → 未命中查库 → 写缓存
    // 受 config.CACHE 总开关控制；关掉时直接回源，便于开发期排查"改了不生效"类问题
    async cachedData(key, ttl, loader) {
        if (!this.config.CACHE) return loader();
        let data = await store.get(key);
        if (!data) {
            data = await loader();
            if (data) await store.set(key, data, ttl);
        }
        return data;
    }

    /**
     * 栏目级绑定内容（碎片覆盖 + 绑定轮播）。
     * - frag：栏目绑定的碎片（含子孙）覆盖全局同 mark，模板 {{frag.mark.xxx}} 零改动生效
     * - slides：栏目绑定的轮播排在全局之前（按 id 去重）；null = 无绑定，沿用全局
     * @returns {Promise<{frag?: Object, slides?: Object[]}>}
     */
    async categoryBind(category, cid) {
        const n = Number(cid);
        if (!n) return {};
        try {
            const ids = await categoryIdsWithAncestors(getApp().db, n);
            const commonService = await this.commonService;
            const [frag, slides] = await Promise.all([
                commonService.fragForCategory({ categoryIds: ids }),
                commonService.slidesForCategory({ categoryIds: ids }),
            ]);
            const out = {};
            if (frag) out.frag = frag;
            if (slides) out.slides = slides;
            return out;
        } catch (e) {
            logger.error({ err: e }, "[categoryBind] 栏目绑定内容注入失败:");
            return {};
        }
    }
}

export default WebController;

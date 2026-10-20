import { cache, getApp, logger } from "chanjs";

import home from "../service/Home.js";
import { CACHE_KEYS, CACHE_TTL } from "../../../common/cache-keys.js";
import { tree } from "chanjs/utils/index.js";

export default () => {
  return async (req, res, next) => {
    try {
      // 运行时通过注册表获取当前实例配置（多实例支持）
      const config = getApp().config;
      const db = getApp().db;
      config.data = config.data || {};

      // 1. 优先读全局缓存（web:global）
      if (config.CACHE) {
        const cachedData = cache.get(CACHE_KEYS.GLOBAL);
        if (cachedData) {
          // 站点关闭判断
          if (cachedData.site && cachedData.site.status === 0) {
            return res.status(503).send(cachedData.site.close_tips || '站点维护中，请稍后再访问');
          }
          // category 不进 app.locals（避免模板作用域出现 category 变量），单独挂 app 实例供控制器逻辑使用
          const { category: cachedCategory, ...localsRest } = cachedData;
          Object.assign(req.app.locals, localsRest);
          req.app.set("category", cachedCategory || null);
          return next();
        }
      }

      let { appName, version } = config;

      // 2. 查询 cms_data 配置（模板数据源配置）
      const configData = await db("sys_config").where("type_code", "cms_data").select();

      configData.forEach(item => {
        try {
          // 仅字符串做 JSON 解析；对象/原始值原样透传（驱动渲染的 config_value 恒为 JSON 串）
          config.data[item.config_key] = typeof item.config_value === 'string'
            ? JSON.parse(item.config_value)
            : item.config_value;
        } catch (e) {
          logger.warn(`Failed to parse config for key ${item.config_key}:`, e);
          config.data[item.config_key] = item.config_value;
        }
      });

      // 3. 加载全局数据（site、category、friendlink、frag、tag）
      //    frag 为结构化 { mark: {content, mid, ext_data} }，模板用 {{frag.mark.content}}
      const { site, category, friendlink, frag, tag } = await home.init();

      // 3.1 给 category 注入 model_code / page_model_code，供模板按模型路由
      if (category && category.length) {
        const models = await db("cms_model").select("id", "model_code");
        const modelMap = new Map(models.map(m => [String(m.id), m.model_code]));
        category.forEach(c => {
          c.model_code = modelMap.get(String(c.mid)) || "";
          // 栏目页面模型（page_mid）映射为 page_model_code，供模板按页面模型路由
          c.page_model_code = modelMap.get(String(c.page_mid)) || "";
        });
      }

      // 站点关闭判断
      if (site && site.status === 0) {
        return res.status(503).send(site.close_tips || '站点维护中，请稍后再访问');
      }

      const nav = tree(category || []);

      // 模板目录：唯一来源是后台配置（cms_site.template），未配置时用 "default"
      // 不再写回 config.template —— config 是进程级共享对象，写请求级状态会在多站点/多域名下互相污染
      const { domain = "", template: dbTemplate = "" } = site || {};
      const finalTemplate = dbTemplate || "default";
      config.data.site = site || {};

      const localsData = {
        appName,
        version,
        template: finalTemplate,
        domain: domain || "",
        static_url: `/view/${finalTemplate}/static/`,
        APP_VERSION: config.APP_VERSION,
        site,
        nav,
        friendlink,
        frag,
        tag,
        // 模板辅助：相对图片路径 → 绝对 URL（og:image 等分享场景爬虫要求绝对地址）。
        // site.domain 已由 site() 规范化（带协议、无尾斜杠）；入参本身是绝对地址时原样返回
        absUrl: (u) => {
          const s = String(u || "");
          if (/^https?:\/\//i.test(s)) return s;
          return (site && site.domain ? site.domain : "") + s;
        },
      };

      Object.assign(req.app.locals, localsData);

      // category 不进模板作用域（减少 nav/category/cate 混淆），挂 app 实例供控制器逻辑使用
      req.app.set("category", category);

      // 4. 写入全局缓存（30 分钟）；缓存里仍带 category，供缓存命中时恢复到 app 实例
      config.CACHE && cache.set(CACHE_KEYS.GLOBAL, { ...localsData, category }, CACHE_TTL.GLOBAL);

      await next();
    } catch (error) {
      next(error);
    }
  };
};

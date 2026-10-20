import { cache, logger } from "chanjs";
import { CACHE_KEYS } from "./cache-keys.js";

/**
 * 按 key 前缀批量删除缓存
 * 改用 chanjs 暴露的 cache.clearByPrefix（框架 2.8.8+ 提供），
 * 彻底解耦对 cache.map 内部结构的直接访问（避免框架重构 map 实现时清缓存失效）。
 * @param {string} prefix - key 前缀
 * @private
 */
const delByPrefix = (prefix) => {
  try {
    // 优先走框架 API；旧版 chanjs 无 clearByPrefix 时退回直接遍历 cache.map 兼容
    if (typeof cache.clearByPrefix === "function") {
      return cache.clearByPrefix(prefix);
    }
    const keys = [];
    for (const key of cache.map.keys()) {
      if (key.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) cache.del(key);
    return keys.length;
  } catch (e) {
    logger.warn(`[cacheclear] 按前缀 ${prefix} 清缓存失败: ${e.message}`);
    return 0;
  }
};

/**
 * 前台数据缓存的 key 前缀
 * - "web:"  —— cache 直接写入：web:global / web:home
 * - "home:" —— controller/Home.js 的 cachedData 经 store 写入：
 *              home:list:* / home:article:* / home:page:* / home:search:* / home:tag:*
 *
 * 覆盖说明：未配 Redis 时，store 的内存后端就是 chanjs 的全局 cache 单例
 * （见 Chanjs/storage/store.js 的 MemoryAdapter），所以遍历 cache.map 能一并清掉
 * store 写入的 key。启用 Redis 后 store 走 Redis，本函数清不到那部分，靠各自 TTL 过期。
 */
const WEB_CACHE_PREFIXES = ['web:', 'home:'];

/**
 * 清除全局缓存（site/nav/category/friendlink/frag/tag）
 * 同时清除 app.locals 中的全局数据，防止当前进程内残留
 *
 * 注意：app.locals 是进程内的，多进程（PM2 cluster）部署时
 *       其他进程的 app.locals 不会同步清除，需启用 Redis 共享缓存才能彻底解决
 */
const clearGlobalCache = (req) => {
  cache.del(CACHE_KEYS.GLOBAL);
  if (req?.app?.locals) {
    const locals = req.app.locals;
    delete locals.nav;
    delete locals.site;
    delete locals.friendlink;
    delete locals.frag;
    delete locals.tag;
  }
  // category 挂在 app 实例（非 locals），一并清除防止残留
  if (req?.app) {
    req.app.set("category", null);
  }
};

/**
 * 清除模板/主题相关的进程内残留（app.locals.template / static_url）
 *
 * 站点行与模板集没有独立缓存：它们打包在 `web:global` 里（见 web/middleware/init.js
 * 的 localsData），由 clearAllWebCache 一并失效。本函数只做 app.locals 兜底清理，
 * 须在 clearAllWebCache 之后调用。
 */
export const clearTemplateCache = (req) => {
  if (req?.app?.locals) {
    delete req.app.locals.template;
    delete req.app.locals.static_url;
  }
};

/**
 * 全量清除前台缓存（推荐：任何后台写操作都调它）
 *
 * 为什么不做精准失效：前台各页面数据是交叉的——文章详情页含栏目面包屑（来自 category）、
 * 碎片/友链（来自 frag/friendlink）、站点信息（来自 site）。只清「首页 + 该栏目列表」
 * 会导致改栏目名后文章页面包屑最长 5 分钟才更新。CMS 写操作频率远低于读，
 * 一次全清的成本可忽略，换来的是「改了就一定生效」，不用维护失效映射表。
 *
 * @param {object} [req] - 传入则一并清理 app.locals / app.set("category") 进程内残留
 * @returns {number} 本次清除的 key 数量
 */
export const clearAllWebCache = (req) => {
  let cleared = 0;
  for (const prefix of WEB_CACHE_PREFIXES) cleared += delByPrefix(prefix);
  // 清进程内残留（locals 里的 nav/site/friendlink/frag/tag 与 app 上的 category）
  clearGlobalCache(req);
  return cleared;
};

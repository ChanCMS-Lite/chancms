/**
 * Web 模块缓存 Key/TTL 统一管理（Key 供调试观察，TTL 供 cachedData 使用）
 *
 * 实际使用的缓存 Key：
 * - web:global                          全局数据（site/nav/friendlink/frag/tag），middleware/init.js
 * - web:home                            首页全量数据，Home.index
 * - home:list:{cid}:{page}:{tagId}:{kw} 列表页，Home.list
 * - home:article:{id}                   文章详情，Home.article
 * - home:page:{cid}:{id}                单页，Home.page
 * - home:search:{kw}:{page}             搜索页，Home.search
 * - home:tag:{path}:{page}              标签页，Home.tag
 *
 * 失效口径：所有 key 都落在 web: / home: 两个前缀下，后台写操作统一调
 * clearAllWebCache() 按前缀全清（见 app/common/cacheclear.js），无需维护映射表。
 */
export const CACHE_KEYS = {
  GLOBAL: 'web:global',
  HOME: 'web:home',
};

/**
 * 缓存 TTL（毫秒），与各控制器 cachedData 调用一一对应
 */
export const CACHE_TTL = {
  GLOBAL: 2 * 60 * 1000,      // 全局数据 2 分钟（兼顾配置即时生效）
  HOME: 10 * 60 * 1000,       // 首页
  LIST: 60 * 1000,            // 栏目列表页
  ARTICLE: 5 * 60 * 1000,     // 文章详情
  PAGE: 10 * 60 * 1000,       // 单页
  SEARCH: 30 * 1000,          // 搜索页（短 TTL，新内容尽快可见）
  TAG: 60 * 1000,             // 标签页
};

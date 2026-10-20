/**
 * 栏目域（cms_category.content_type）—— 单一真相源
 *
 * 设计：一个根栏目 = 一个「域」，子孙强制继承；域之间互不可见。
 * 后台各模块只声明「我读哪些域」，就不可能串门
 * （不会再出现文章页/单页页看到商品、专题、书籍栏目）。
 */

export const CONTENT_TYPES = {
  PAGE: "page",
  ARTICLE: "article",
  IMAGE: "image",
  VIDEO: "video",
  PRODUCT: "product",
  BOOK: "book",
};

export const ALL_CONTENT_TYPES = Object.values(CONTENT_TYPES);

/**
 * Article 服务可写入 cms_article 的域（保存校验用，一处声明）。
 * cms_article 由「文章管理 + 单页管理」共用（单页正文也存本表）；
 * 商品/书籍有独立表（cms_product / book），不在列即拦截。
 */
export const ARTICLE_STORAGE_TYPES = [
  CONTENT_TYPES.ARTICLE,
  CONTENT_TYPES.IMAGE,
  CONTENT_TYPES.VIDEO,
  CONTENT_TYPES.PAGE,
];

/**
 * 归一化 content_type 入参，供查询层使用（Article.search 的域过滤）。
 * 支持 'a,b' / ['a','b'] / 'a'；非法域名剔除。
 * @returns {string[]|null} null = 不做域过滤；[]（传了值但全非法）= 过滤但无匹配（fail-closed）
 */
export function normalizeContentTypes(value) {
  if (value === undefined || value === null || value === "") return null;
  const raw = Array.isArray(value) ? value : String(value).split(",");
  const list = raw.map((v) => String(v).trim()).filter(Boolean);
  if (!list.length) return null;
  return list.filter((v) => ALL_CONTENT_TYPES.includes(v));
}

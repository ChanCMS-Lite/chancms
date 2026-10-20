/**
 * 标签 ID 字符串解析工具
 *
 * 背景：
 *   cms_article.tagId 是逗号分隔的字符串，业务侧多处用 `tagId.split(",").map(Number).filter(Boolean)` 解析。
 *   该模式存在重复代码，且 filter(Boolean) 会丢失合法的 0（虽然实际场景不会出现 tagId=0），
 *   统一抽出 parseTagIds，避免散落的解析逻辑出现行为不一致。
 *
 * 与 service/Article.js 内 TagService.parseTagIds 的关系：
 *   service 内的 parseTagIds 仅用于 cms 模块，依赖实例 this；
 *   本文件为静态导出函数，可被 web/任意模块直接 import，无依赖。
 */

/**
 * 解析文章 tagId 字符串为 ID 数组
 * @param {string} tagId - 逗号分隔的标签 ID 字符串
 * @returns {number[]} ID 数组（空字符串/undefined/非字符串 均返回 []）
 */
export function parseTagIds(tagId) {
  if (!tagId || typeof tagId !== "string") return [];
  return tagId
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
}

export default parseTagIds;

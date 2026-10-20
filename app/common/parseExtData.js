import { logger } from "chanjs";
/**
 * 解析 ext_data 中的 JSON 字符串字段为对象/数组
 * 例如 pics: "[...]" -> pics: [...]
 * @param {Object} extData - 扩展数据对象
 * @returns {Object} 解析后的对象
 */
export const parseExtDataFields = (extData) => {
  if (!extData || typeof extData !== 'object') return extData;
  const result = {};
  for (const [key, value] of Object.entries(extData)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          result[key] = JSON.parse(value);
          continue;
        } catch (e) {
          // 解析失败保持原字符串
        }
      }
    }
    result[key] = value;
  }
  return result;
};

/**
 * 合并文章的 ext_data 扩展字段到主对象
 * 流程：JSON.parse(ext_data) → parseExtDataFields → 结果保留在 article.ext_data 子对象
 * 注意：不把 ext_data 字段提升到顶层（避免与主表字段同名冲突），渲染时模板多取一层 article.ext_data.xxx
 * @param {Object} article - 文章对象（可能含 ext_data 字段）
 * @param {Object} [options] - 选项
 * @param {boolean} [options.compatCode=false] - 是否兼容旧版 code 字段（将 ext_data.code 提升为顶层 code）
 * @returns {Object} 处理后的文章对象（原对象被修改）
 */
export const mergeExtData = (article, options = {}) => {
  if (!article || !article.ext_data) return article;

  let extData = {};
  try {
    extData = typeof article.ext_data === 'string'
      ? JSON.parse(article.ext_data)
      : article.ext_data;
  } catch (e) {
    logger.error('[mergeExtData] JSON 解析失败:', e.message);
    extData = {};
  }

  // 自动解析 ext_data 中的 JSON 字符串字段
  extData = parseExtDataFields(extData);

  // 兼容旧版 code 字段：将 ext_data.code 提升为顶层 code
  if (options.compatCode && extData.code !== undefined) {
    article.code = extData.code;
  }

  // 保留在 ext_data 子对象，不提升到顶层
  article.ext_data = extData;
  return article;
};

/**
 * 合并单页栏目的 page_ext_data 扩展字段到主对象（与 mergeExtData 同口径）
 * @param {Object} row - 栏目对象（可能含 page_ext_data 字段，原对象被修改）
 * @returns {Object} 处理后的栏目对象
 */
export const mergePageExtData = (row) => {
  if (!row || !row.page_ext_data) return row;
  let pageExt = {};
  try {
    pageExt = typeof row.page_ext_data === 'string'
      ? JSON.parse(row.page_ext_data)
      : row.page_ext_data;
  } catch (e) {
    logger.error('[mergePageExtData] JSON 解析失败:', e.message);
    pageExt = {};
  }
  row.page_ext_data = parseExtDataFields(pageExt);
  return row;
};

export default parseExtDataFields;

// 标签相关服务（原 Common.js 拆分，方法契约保持不变）
// 错误日志由聚合入口 Common.js 的 withLog 统一记录，本文件不写 try/catch 样板
import { getApp } from "chanjs";

import { parseTagIds } from "../../../../common/tag-utils.js";

/**
 * 获取标签列表，按使用数量降序排列
 * @param {Object} options - 查询选项
 * @param {number} options.pageSize - 返回数量，默认为10，最大100
 * @param {number} options.cid - 分类id，0表示查询全部
 * @returns {Promise<Object[]>} 标签列表数组，包含id、name、path、count字段
 */
export async function tag({ pageSize = 10, cid = 0 }) {
  pageSize = Math.min(parseInt(pageSize, 10) || 10, 100);

  let query = getApp().db.select(["id", "name", "path", "count", "cid"])
    .from("cms_tag")
    .limit(pageSize)
    .orderBy("count", "desc");

  if (cid) {
    query = query.where({ cid });
  }

  return query;
}

/**
 * 根据分类ID获取标签列表
 * @param {Object} options - 查询选项
 * @param {string|number} options.cid - 分类ID，必填
 * @returns {Promise<Object[]>} 标签列表数组，包含id、path、name字段
 */
export async function getTagList({ cid }) {
  return getApp().db("cms_tag").select("id", "name", "path").where("cid", cid);
}

/**
 * 根据标签路径获取关联文章的分页列表
 * @param {Object} options - 查询选项
 * @param {string} options.path - 标签路径，必填
 * @param {number} options.page - 当前页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为10
 * @returns {Promise<Object>} 分页数据对象，包含total、current、pageSize、list字段
 */
export async function tags({ path, page = 1, pageSize = 10 }) {
  if (!path) {
    return { total: 0, current: 1, pageSize: pageSize, list: [] };
  }

  const start = (page - 1) * pageSize;

  // 使用 cms_articletag 关联表 JOIN 替代 FIND_IN_SET 子查询
  // innerJoin 保证只返回匹配指定标签路径的文章，groupBy 去重避免一篇文章多标签重复
  const buildQuery = () =>
    getApp().db("cms_article as a")
      .innerJoin("cms_articletag as at", "at.aid", "a.id")
      .innerJoin("cms_tag as t", "t.id", "at.tid")
      .join("cms_category as c", "a.cid", "c.id")
      .where("t.path", path)
      .where("a.status", 0);

  // count 与 list 并行执行
  const [totalResult, result] = await Promise.all([
    buildQuery().countDistinct("a.id as total"),
    buildQuery()
      .select(
        "a.id",
        "a.title",
        "a.shortTitle",
        "a.img",
        "a.description",
        "a.created_at",
        "a.pv",
        "c.slug",
        "c.name",
        "c.path"
      )
      .groupBy("a.id")
      .orderBy("a.created_at", "desc")
      .offset(start)
      .limit(pageSize),
  ]);

  return {
    total: parseInt(totalResult[0]?.total || 0, 10),
    current: page,
    pageSize: pageSize,
    list: result,
  };
}

/**
 * 批量获取多篇文章的标签（优化 N+1 查询）
 * @param {number[]} aids - 文章ID数组
 * @returns {Promise<Object>} { aid: tags[] } 映射表
 */
export async function getTagsByArticleIds(aids) {
  const result = {};
  if (!aids || aids.length === 0) return result;

  // 1. 批量查询所有文章的 tagId（1 次查询替代 N 次）
  const articles = await getApp().db("cms_article")
    .select("id", "tagId")
    .whereIn("id", aids);

  // 2. 收集所有 tagId（去重）
  const allTagIds = new Set();
  const articleTagMap = {}; // { aid: [tagId,...] }
  for (const a of articles) {
    if (!a.tagId) continue;
    const ids = parseTagIds(a.tagId);
    articleTagMap[a.id] = ids;
    ids.forEach((id) => allTagIds.add(id));
  }

  // 3. 一次性查询所有标签详情（whereIn 空数组在部分驱动下行为异常，空集合直接短路）
  const uniqueTagIds = [...allTagIds];
  const tags = uniqueTagIds.length
    ? await getApp().db("cms_tag").select("id", "name", "path").whereIn("id", uniqueTagIds)
    : [];

  const tagMap = {};
  tags.forEach((t) => (tagMap[t.id] = t));

  // 4. 组装 { aid: tags[] }
  for (const aid of aids) {
    const ids = articleTagMap[aid] || [];
    result[aid] = ids.map((id) => tagMap[id]).filter(Boolean);
  }
  return result;
}

// 共用查询：按文章ID取 tagId 列并关联标签详情（fetchTagsByArticleId / getTagsFromArticleByAid 复用）
async function queryTagsByAid(id, fields, limit) {
  const article = await getApp().db("cms_article")
    .select("tagId")
    .where("id", id)
    .first();

  if (!article || !article.tagId) {
    return [];
  }

  const tagIds = parseTagIds(article.tagId);
  if (tagIds.length === 0) return [];

  return getApp().db("cms_tag")
    .select(...fields)
    .whereIn("id", tagIds)
    .limit(limit);
}

/**
 * 根据文章ID获取关联的标签列表
 * @param {Object} options - 查询选项
 * @param {number} options.id - 文章ID，必填
 * @param {number} options.pageSize - 返回标签数量，默认为5
 * @returns {Promise<Object[]>} 标签列表数组，包含id、path、name字段
 */
export async function fetchTagsByArticleId({ id, pageSize = 5 }) {
  if (!id) return [];
  return queryTagsByAid(id, ["id", "path", "name"], pageSize);
}

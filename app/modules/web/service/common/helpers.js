// Common 服务内部共享工具函数与常量
// 注意：本文件保持纯函数/常量，只依赖 chanjs 与公共 utils，不依赖任何分组模块（避免循环依赖）
import { getApp } from "chanjs";

import { categoryIdsWithChildren as categoryTree } from "../../../../common/category-scope.js";
import { getTagsByArticleIds } from "./tag.js";

/** 按对象 path 字段去重（保留首个） */
export function uniqueByPath(arr) {
  const map = new Map();
  return arr.filter((item) => {
    if (!map.has(item.path)) {
      map.set(item.path, item);
      return true;
    }
    return false;
  });
}

/**
 * 查询相邻文章（上一篇/下一篇共用的同构查询）
 * 注意：模块级函数，勿改成对象方法——模板标签引擎按方法名取函数引用调用，this 不可靠
 * @param {number} id - 当前文章ID
 * @param {number} cid - 分类ID
 * @param {string} op - 比较运算符："<"上一篇 / ">"下一篇
 * @param {string} order - 排序方向：desc / asc
 * @returns {Promise<Object|null>}
 */
export async function adjacentArticle(id, cid, op, order) {
  const result = await getApp().db("cms_article as a")
    .select("a.id", "a.title", "c.name", "c.slug")
    .leftJoin("cms_category as c", "a.cid", "c.id")
    .where("a.id", op, id)
    .andWhere("a.cid", cid)
    .orderBy("a.id", order)
    .first();
  return result || null;
}

// ---- AIGEO 工具：字段级合并 + 占位符替换 ----
// 解析 aigeo（兼容字符串/对象/null）
export function parseAiGeo(v) {
  if (!v) return null;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
}

// 递归替换字符串占位符（如 {{栏目名称}}/{{栏目链接}}），跨字符串/数组/对象
export function replacePlaceholders(obj, map) {
  if (typeof obj === "string") {
    let s = obj;
    for (const [k, v] of Object.entries(map)) s = s.split(k).join(v ?? "");
    return s;
  }
  if (Array.isArray(obj)) return obj.map((x) => replacePlaceholders(x, map));
  if (obj && typeof obj === "object") {
    const r = {};
    for (const [k, v] of Object.entries(obj)) r[k] = replacePlaceholders(v, map);
    return r;
  }
  return obj;
}

// 与框架 chanjs/core/Repository.js 的 PAGINATION_KEYS / SORT_FIELD_REGEX 保持一致：
// 通用表查询的过滤条件里绝不能出现分页保留字或非法字段名，否则会被当成 WHERE 列报 Unknown column。
export const PAGINATION_KEYS = new Set(['current', 'page', 'pageNum', 'pageSize', 'limit', 'offset']);
export const SORT_FIELD_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// cms_article 可排序字段白名单（knex orderBy 字段名直接拼 SQL，必须白名单防注入）
const ARTICLE_SORT_FIELDS = new Set([
  "id", "title", "shortTitle", "img", "description", "pv", "click",
  "created_at", "updated_at", "sort", "attr", "status",
]);
const SORT_ORDERS = new Set(["ASC", "DESC"]);

// 解析文章列表排序字段：支持 "pv" / "a.pv" 写法，非法回退默认字段
export function resolveArticleOrderBy(raw, fallback = "created_at") {
  if (typeof raw !== "string") return fallback;
  let field = raw.trim();
  if (field.startsWith("a.")) field = field.slice(2);
  return ARTICLE_SORT_FIELDS.has(field) ? field : fallback;
}

// 解析排序方向：仅 ASC/DESC（不区分大小写），非法回退 DESC
export function resolveArticleOrder(raw) {
  const order = String(raw || "").trim().toUpperCase();
  return SORT_ORDERS.has(order) ? order : "DESC";
}

// 查询栏目自身 + 所有后代栏目（含孙级及更深）的 id 数组（列表类查询通用）
// 实现下沉到 app/common/category-scope.js，与 cms 后台 search 共用同一套展开逻辑，
// 避免「前台能搜到子孙、后台搜不到」的行为分叉
export function categoryIdsWithChildren(cid) {
  return categoryTree(getApp().db, cid);
}

/**
 * 给文章列表批量绑定 tags，并删除 tagId 原始字段
 * 复用 tag.js#getTagsByArticleIds（同源批量查询，避免两套实现漂移）
 * 空列表安全跳过；list 变异原地生效
 * @param {Object[]} list - 文章列表（需含 tagId 字段）
 */
export async function attachTags(list) {
  if (!Array.isArray(list) || !list.length) return;
  const tagsMap = await getTagsByArticleIds(list.map((a) => a.id));
  list.forEach((a) => {
    a.tags = tagsMap[a.id] || [];
    delete a.tagId;
  });
}

// 按 article_id 集合批量查关联文章信息（_enrich 系列共用），返回 Map<id, row>
export async function fetchRelationInfoMap(idSet) {
  const rows = await getApp().db("cms_article as a")
    .select("a.id", "a.title", "a.img", "a.description", "a.created_at", "c.slug", "c.path")
    .leftJoin("cms_category as c", "a.cid", "c.id")
    .whereIn("a.id", [...idSet]);
  const map = new Map();
  rows.forEach((r) => map.set(Number(r.id), r));
  return map;
}

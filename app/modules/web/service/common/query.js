// 通用查询/搜索类服务（原 Common.js 拆分，方法契约保持不变）
// 错误日志由聚合入口 Common.js 的 withLog 统一记录；
// search() 的关键词匹配已统一为 LIKE（不再有 FULLTEXT 降级分支，详见函数注释）
import { getApp, logger } from "chanjs";

import { PAGINATION_KEYS, SORT_FIELD_REGEX } from "./helpers.js";
import { categoryIdsWithChildren } from "../../../../common/category-scope.js";

// query() 禁止查询的系统表黑名单
const RESTRICTED_TABLES = [
  "sys_user",
  "sys_role",
  "sys_notice",
  "sys_menu",
  "sys_config",
];

/**
 * 搜索文章，支持关键词和分类筛选
 * 关键词匹配用 LIKE（与后台 cms/article/search 同一策略）：
 * 表上的 ft_title 索引未带 `WITH PARSER ngram`，MySQL 默认分词器把整串中文当一个 token，
 * MATCH 搜中文必然落空；而「索引缺失自动降级」只在索引不存在时触发，索引存在却不可用的
 * 情况兜不住。统一 LIKE 后中英文表现一致，且不再依赖任何索引 DDL。
 * @param {Object} options - 查询选项
 * @param {string} options.keywords - 搜索关键词，用于匹配文章标题
 * @param {number} options.current - 当前页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为10
 * @param {number} options.cid - 分类ID，默认为0（不限制分类，命中自身及全部子孙栏目）
 * @returns {Promise<Object>} 分页数据对象，包含total、current、pageSize、list字段
 */
export async function search({ keywords = "", current = 1, pageSize = 10, cid = 0 }) {
  const offset = (current - 1) * pageSize;
  const kw = (keywords || "").trim().slice(0, 10);

  // 抽取公共查询条件构建器，保证 count/list 条件一致
  const isPg = (process.env.DB_TYPE || "mysql").toLowerCase() === "pg";
  // 栏目过滤覆盖子孙栏目，与后台搜索、栏目列表保持同一套展开逻辑
  const cidIds = cid ? await categoryIdsWithChildren(getApp().db, cid) : [];
  const buildQuery = () => {
    let q = getApp().db("cms_article as a")
      .leftJoin("cms_category as c", "a.cid", "c.id")
      .where("a.status", 0);
    if (kw) {
      // 与后台一致：只 trim + 截断 10，不做通配符转义（%/_ 命中变多但无害）；
      // SQL 注入由参数化绑定拦住。PG 用 ILIKE 保大小写不敏感
      q = q.andWhereRaw(`a.title ${isPg ? "ILIKE" : "LIKE"} ?`, [`%${kw}%`]);
    }
    if (cidIds.length) {
      q = q.whereIn("c.id", cidIds);
    }
    return q;
  };

  // count 与 list 并行执行（FULLTEXT 与 LIKE 降级共用同一套字段与排序）
  const searchFields = [
    "a.id", "a.title", "a.attr", "a.tagId", "a.description",
    "a.cid", "a.pv", "a.created_at", "a.status", "c.name", "c.slug",
  ];
  const [totalResult, list] = await Promise.all([
    buildQuery().count("a.id", { as: "count" }).first(),
    buildQuery()
      .select(...searchFields)
      .orderBy("a.id", "desc")
      .offset(offset)
      .limit(pageSize),
  ]);

  const count = parseInt(totalResult?.count || 0, 10);
  return {
    total: count,
    current: +current,
    pageSize: pageSize,
    list: list || [],
  };
}

/**
 * 通用表查询方法，支持分页、条件筛选和字段过滤，包含权限校验
 * @param {Object} options - 查询选项
 * @param {string} options.table - 表名，必填。不能查询系统表（sys_user、sys_role等）
 * @param {number} options.current - 当前页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为10。为1时返回单个对象
 * @param {Object} options.query - 查询条件对象，key-value形式，默认为空对象
 * @param {string[]} options.field - 要返回的字段数组，默认返回所有字段
 * @param {boolean} options.needCount - 是否返回总数，默认为true
 * @returns {Promise<Object|Object[]>} needCount为true时返回{data, total, current, pageSize}对象，否则返回数据数组或单个对象
 */
export async function query({
  table = "",
  current = 1,
  pageSize = 10,
  query = {},
  field = [],
  needCount = true,
}) {
  if (!table) {
    logger.error("请传入表名");
    return {};
  }

  if (RESTRICTED_TABLES.includes(table)) {
    logger.error(`查询${table}表，无权限`);
    return {};
  }

  const offset = (current - 1) * pageSize;

  let countQuery = getApp().db(table).count("* as total");
  let dataQuery = getApp().db(table);

  if (Object.keys(query).length > 0) {
    Object.entries(query).forEach(([key, value]) => {
      // 分页保留字/非法字段不能当过滤列（与框架 Repository.applyQuery 一致），
      // 否则会出现 `where pageSize = '20'` 报 Unknown column，或任意键导致注入/报错
      if (PAGINATION_KEYS.has(key) || !SORT_FIELD_REGEX.test(key)) {
        logger.warn(`[Common.query] 跳过非法过滤字段：${key}`);
        return;
      }
      dataQuery = dataQuery.where(key, value);
      countQuery = countQuery.where(key, value);
    });
  }

  if (field.length > 0) {
    dataQuery = dataQuery.select(field);
  }

  const [totalResult, data] = await Promise.all([
    countQuery.first(),
    pageSize == 1
      ? dataQuery.offset(offset).limit(pageSize).first()
      : dataQuery.offset(offset).limit(pageSize),
  ]);

  const total = totalResult?.total || 0;
  return needCount ? { data, total, current, pageSize } : data;
}

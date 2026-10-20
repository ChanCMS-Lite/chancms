// 文章列表类服务（原 Common.js 拆分，方法契约保持不变）
// 错误日志由聚合入口 Common.js 的 withLog 统一记录，本文件不写 try/catch 样板
import { getApp, logger } from "chanjs";
import { filterFields } from "chanjs/utils/index.js";

import { mergeExtData } from "../../../../common/parseExtData.js";

import {
  categoryIdsWithChildren,
  attachTags,
  uniqueByPath,
  resolveArticleOrderBy,
  resolveArticleOrder,
} from "./helpers.js";
import { getAllParentCategory } from "./site.js";
import { getTagsByArticleIds } from "./tag.js";

/**
 * 文章列表查询公共骨架：cms_article AS a leftJoin cms_category AS c，status=0
 * @param {string[]} fields - select 字段
 * @param {Object} opts - orderBy: [列, 方向] 数组；extra: 追加 where 等条件的回调
 */
function baseArticleQuery(fields, { orderBy = [["a.created_at", "DESC"]], extra } = {}) {
  const query = getApp().db
    .select(fields)
    .from("cms_article AS a")
    .leftJoin("cms_category AS c", "a.cid", "c.id")
    .where("a.status", 0);
  if (extra) extra(query);
  for (const [col, dir] of orderBy) query.orderBy(col, dir);
  return query;
}

/**
 * 获取文章列表
 * @param {Object} options - 查询选项
 * @param {number} options.start - 起始位置，默认为0
 * @param {number} options.pageSize - 每页数量，默认为5，最大100
 * @param {string|string[]} options.attr - 文章属性（top/recommend/carousel/hot），用于筛选
 * @param {string|string[]} options.excludeAttr - 要排除的文章属性
 * @param {number} options.type - 返回类型，2返回数组，其他返回单个对象，默认为2
 * @returns {Promise<Object[]|Object>} 文章列表或单个文章对象
 */
export async function getArticleList({
  start = 0,
  pageSize = 5,
  attr = "",
  excludeAttr = "",
  type = 2,
}) {
  const result = await baseArticleQuery(
    [
      "a.id", "a.title", "a.shortTitle", "a.img",
      "a.created_at", "a.description", "a.link",
      "c.slug", "c.name", "c.path",
    ],
    {
      extra: (query) => {
        if (attr) {
          query.whereIn("a.attr", Array.isArray(attr) ? attr : [attr]);
        }
        if (excludeAttr) {
          query.whereNotIn("a.attr", Array.isArray(excludeAttr) ? excludeAttr : [excludeAttr]);
        }
      },
    }
  )
    .limit(Math.min(pageSize, 100))
    .offset(parseInt(start) || 0);
  return type == 2 ? result : (result[0] || {});
}

/**
 * getArticleListByCid / getArticleListByCidWithFields 共享实现
 * 差异仅：withExt=true 时多查 a.pv / a.ext_data 并解析扩展字段
 * @returns {Promise<Object>} { nav: 栏目信息, list: 文章列表数组(包含tags) }
 */
async function articleListByCidCore({
  cid,
  pageSize = 5,
  attr = [],
  start = 0,
  excludeAttr = [],
  hasContent = false,
  withExt = true,
}) {
  // 无 cid 直接返回
  if (!cid) return { nav: {}, list: [] };
  const limit = Math.min(pageSize, 100);

  // 1. 获取所有子分类 ID（包含自身）
  const cids = await categoryIdsWithChildren(cid);

  // 2. 文章主查询
  const selectFields = [
    "a.id", "a.title", "a.shortTitle", "a.img",
    ...(withExt ? ["a.pv"] : []),
    "a.created_at", "a.description", "a.tagId", "a.link",
    ...(withExt ? ["a.ext_data"] : []),
    "c.slug", "c.path", "c.name",
  ];

  if (hasContent) {
    selectFields.push("a.content");
  }

  const query = getApp().db("cms_article AS a")
    .leftJoin("cms_category AS c", "a.cid", "c.id")
    .select(...selectFields)
    .whereIn("a.cid", cids)
    .where("a.status", 0)
    .orderBy("a.created_at", "desc")
    .limit(limit)
    .offset(parseInt(start) || 0);

  // 属性筛选
  if (attr.length) query.whereIn("a.attr", attr);

  // 排除指定属性（与 attr 筛选可同时生效）
  if (excludeAttr.length) query.whereNotIn("a.attr", excludeAttr);

  const list = await query;

  // 3. 解析 ext_data 扩展字段（withExt=false 时未查询 ext_data，跳过）
  if (withExt && list.length) {
    list.forEach(mergeExtData);
  }

  // 4. 批量绑定标签（空列表安全跳过）
  await attachTags(list);

  // 5. 获取栏目信息（slug 供模板拼 URL，path 保留用于树形比较）
  const nav = await getApp().db("cms_category").select("path", "name", "slug").where("id", cid).first() || {};
  return { nav, list };
}

/**
 * 根据分类ID获取文章列表（包含子分类），包含扩展模型字段（pv/ext_data 已解析）
 * @param {Object} options - 查询选项
 * @param {number} options.cid - 分类ID，必填
 * @param {number} options.pageSize - 每页数量，默认为5，最大100
 * @param {string[]} options.attr - 文章属性（top/recommend/carousel/hot），用于筛选
 * @param {number} options.start - 分页偏移量，默认为0
 * @param {string[]} options.excludeAttr - 排除的文章属性（top/recommend/carousel/hot），默认为空
 * @param {boolean} options.hasContent - 是否包含文章内容，默认为false
 * @returns {Promise<Object>} 返回对象 { nav: 栏目信息, list: 文章列表数组(包含tags) }
 */
export async function getArticleListByCid({ cid, pageSize = 5, attr = [], start = 0, excludeAttr = [], hasContent = false }) {
  return articleListByCidCore({ cid, pageSize, attr, start, excludeAttr, hasContent, withExt: true });
}

/**
 * 根据分类ID获取文章列表（包含子分类），不包含扩展模型字段
 * @param {Object} options - 查询选项
 * @param {number} options.cid - 分类ID，必填
 * @param {number} options.pageSize - 每页数量，默认为5，最大100；为 1 时返回单个文章对象
 * @param {string[]} options.attr - 文章属性（top/recommend/carousel/hot），用于筛选
 * @param {number} options.start - 分页偏移量，默认为0
 * @param {string[]} options.excludeAttr - 排除的文章属性（top/recommend/carousel/hot），默认为空
 * @param {boolean} options.hasContent - 是否包含文章内容，默认为false
 * @returns {Promise<Object>} 返回对象 { nav, list }；pageSize=1 时为 { nav, data: 文章对象 }
 */
export async function getArticleListByCidWithFields({ cid, pageSize = 5, attr = [], start = 0, excludeAttr = [], hasContent = false, ...options }) {
  const { nav, list } = await articleListByCidCore({ cid, pageSize, attr, start, excludeAttr, hasContent, withExt: false });

  // 如果 pageSize 为 1，直接返回单个文章对象
  if (pageSize === 1 && list.length > 0) {
    return { nav, data: list[0] };
  }

  return { nav, list };
}

/**
 * 根据父分类ID获取子分类的文章列表，按分类拼音分组
 * @param {Object} options - 查询选项
 * @param {number} options.cid - 父分类ID，必填
 * @param {number} options.pageSize - 每页数量，默认为5，最大100
 * @param {string[]} options.attr - 文章属性数组，用于筛选
 * @returns {Promise<Object>} 以分类拼音为key，文章列表为value的对象
 */
export async function getArticleListByCidCate({ cid, pageSize = 5, attr = [] }) {
  if (!cid) return {};

  const res = await getApp().db.select("id", "slug")
    .from("cms_category")
    .where("pid", cid);
  // res 是 pid=cid 的子分类，id 不可能等于 cid，无需再 filter
  const allCategoryIds = res.map((item) => item.id);

  if (allCategoryIds.length === 0) return {};

  const idToSlug = Object.fromEntries(
    res.map((item) => [item.id, item.slug])
  );

  const fetchPromises = allCategoryIds.map((id) => {
    let queryBuilder = getApp().db
      .select(
        "a.id",
        "a.title",
        "a.shortTitle",
        "a.img",
        "a.created_at",
        "a.description",
        "c.slug",
        "c.name",
        "c.path"
      )
      .from("cms_article AS a")
      .leftJoin("cms_category AS c", "a.cid", "c.id")
      .where("a.cid", id)
      .where("a.status", 0)
      .orderBy("a.created_at", "DESC");

    if (pageSize > 0) {
      queryBuilder = queryBuilder.limit(Math.min(pageSize, 100));
    }

    if (Array.isArray(attr) && attr.length > 0) {
      // attr 后台存逗号分隔多值（如 "recommend,hot"），兼容单值/多值匹配
      // 多库兼容：attr 存逗号分隔多值（如 "recommend,hot"）
      // MySQL: FIND_IN_SET / PG: ? = any(string_to_array(...)) / SQLite: instr 精确分词匹配
      const dbType = (process.env.DB_TYPE || "mysql").toLowerCase();
      const findInSetExpr =
        dbType === "pg"
          ? `? = any(string_to_array(a.attr, ','))`
          : dbType === "sqlite"
          ? `instr(',' || a.attr || ',', ',' || ? || ',') > 0`
          : `FIND_IN_SET(?, a.attr)`;
      queryBuilder = queryBuilder.where((q) => {
        attr.forEach((a, i) => {
          if (i === 0) q.whereRaw(findInSetExpr, [a]);
          else q.orWhereRaw(findInSetExpr, [a]);
        });
      });
    }

    return queryBuilder;
  });

  const results = await Promise.all(fetchPromises);

  const grouped = {};
  allCategoryIds.forEach((id, index) => {
    const slug = idToSlug[id] || "default";
    grouped[slug] = results[index] || [];
  });

  return grouped;
}

/**
 * 根据分类ID数组批量获取文章列表，包含置顶文章和标签->第一条是推荐，其它几条是普通文章
 * @param {Object} options - 查询选项
 * @param {number[]} options.cids - 分类ID数组
 * @param {string|number} options.attr - 文章属性（top/recommend/carousel/hot），默认为recommend
 * @param {number} options.toplen - 置顶文章数量，默认为1。为0时不返回top对象
 * @param {number} options.len - 普通文章数量，默认为5
 * @returns {Promise<Object>} 包含按分类拼音分组的文章对象和list数组的对象
 */
export async function getArticleListByCids({
  cids = [],
  attr = [],
  excludeAttr = [],
  toplen = 1,
  len = 5,
} = {}) {
  // 统一 attr 为数组，whereIn/whereNotIn 要求数组参数
  const attrArr = Array.isArray(attr) ? attr : [attr];
  const excludeAttrArr = Array.isArray(excludeAttr) ? excludeAttr : [excludeAttr];

  // getAllParentCategory 已限定 pid=0 且 type=0（栏目），无需再过滤
  let cate = await getAllParentCategory(cids);
  const cateField = ["id", "name", "path", "slug"];
  cate = filterFields(cate, cateField);

  const list = [];

  // 栏目间并行查询
  const cateResults = await Promise.all(
    cate.map(async (item) => {
      const [topRes, listRes] = await Promise.all([
        getArticleListByCid({ cid: item.id, pageSize: toplen, attr: attrArr }),
        getArticleListByCid({ cid: item.id, pageSize: len, excludeAttr: excludeAttrArr }),
      ]);
      return { item, _top: topRes.list, _list: listRes.list };
    })
  );

  // 收集所有文章 ID，批量查询标签（每栏目 1 次批量查询）
  const allArticleIds = cateResults.flatMap((r) => r._list.map((sub) => sub.id));
  const allTagsMap = await getTagsByArticleIds(allArticleIds);

  for (const { item, _top, _list } of cateResults) {
    // 合并当前栏目下所有文章的标签并按 path 去重
    const tags = uniqueByPath(_list.flatMap((sub) => allTagsMap[sub.id] || []));

    const _item = { list: _list, tags, category: item };
    if (toplen > 0) {
      _item.top = toplen === 1 ? (_top[0] || null) : _top;
    }
    list.push(_item);
  }

  const grouped = {};
  list.forEach((item) => {
    grouped[item.category.slug] = item;
  });

  return { ...grouped, list };
}

/**
 * 获取浏览量最高的文章列表（热门文章）
 * @param {Object} options - 查询选项
 * @param {number} options.pageSize - 每页数量，默认为10，最大100
 * @param {string|number} options.cid - 分类ID，可选。传入则只获取该分类及子分类的文章
 * @returns {Promise<Object[]>} 按浏览量降序排列的文章列表
 */
export async function getArticlePvList({ pageSize = 10, cid = "" } = {}) {
  const targetIds = cid ? await categoryIdsWithChildren(cid) : [];
  const rows = await baseArticleQuery(
    [
      "a.id", "a.title", "a.shortTitle", "a.img",
      "a.created_at", "a.description", "a.pv",
      // ext_data：视频/图片等模型模板在热门区块直接读 $value.ext_data.xxx（如视频封面/时长）
      "a.ext_data",
      "c.slug", "c.name", "c.path",
    ],
    {
      orderBy: [["a.pv", "DESC"]],
      extra: (query) => {
        if (targetIds.length) query.whereIn("a.cid", targetIds);
      },
    }
  ).limit(Math.min(pageSize, 100));
  // 解析 ext_data JSON（string→parse→字段级 JSON→回填 item.ext_data），与其他列表标签同口径
  rows.forEach(mergeExtData);
  return rows;
}

/**
 * 获取最新带图片的文章列表
 * @param {Object} options - 查询选项
 * @param {number} options.pageSize - 每页数量，默认为10，最大100
 * @param {string|number} options.cid - 分类ID，可选。传入则只获取该分类及子分类的文章
 * @param {string} options.attr - 文章属性（top/recommend/carousel/hot），用于模糊匹配筛选
 * @returns {Promise<Object[]>} 按创建时间降序排列的带图片文章列表
 */
export async function getNewImgList({ pageSize = 10, cid = "", attr = "" } = {}) {
  const ids = cid ? await categoryIdsWithChildren(cid) : [];
  const rows = await baseArticleQuery(
    [
      "a.id", "a.title", "a.shortTitle", "a.img",
      "a.created_at", "a.description",
      // ext_data：图片/视频模板在图文区块读模型字段（如图集张数、视频时长）
      "a.ext_data",
      "c.slug", "c.name", "c.path",
    ],
    {
      extra: (query) => {
        query.where("a.img", "!=", "");
        if (ids.length) query.whereIn("a.cid", ids);
        if (attr) query.whereIn("a.attr", Array.isArray(attr) ? attr : [attr]);
      },
    }
  ).limit(Math.min(pageSize, 100));
  // 解析 ext_data JSON（string→parse→字段级 JSON→回填 item.ext_data），与其他列表标签同口径
  rows.forEach(mergeExtData);
  return rows;
}

/**
 * 获取分类下的文章分页列表（包含子分类）
 * @param {Object} options - 查询选项
 * @param {number} options.cid - 分类ID，必填
 * @param {number} options.page - 当前页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为10
 * @param {boolean} options.tag - 是否查询标签，默认为true
 * @param {boolean} options.field - 是否查询扩展字段，默认为true
 * @returns {Promise<Object>} 分页数据对象，包含total、current、pageSize、list字段
 */
export async function list({ cid, page = 1, pageSize = 10, tag = true, field = true, tagId = '', keyword = '', orderBy = 'created_at', order = 'DESC' }) {
  if (!cid) {
    return { total: 0, current: 1, pageSize: pageSize, list: [] };
  }

  const start = (page - 1) * pageSize;
  const ids = await categoryIdsWithChildren(cid);

  const kw = (keyword || "").trim().slice(0, 10);

  // 构建基础where条件（使用 cms_articletag 关联表替代 FIND_IN_SET，走索引）
  const baseWhere = (qb) => {
    qb.whereIn("a.cid", ids).where("a.status", 0);
    if (tagId) {
      qb.whereExists(function () {
        this.select(1)
          .from("cms_articletag as at")
          .whereRaw("at.aid = a.id")
          .where("at.tid", tagId);
      });
    }
    if (kw) {
      // 与 search/query.js 同一口径：只 trim + 截断，不做通配符转义（SQL 注入由参数化绑定拦住）
      qb.andWhere(function () {
        this.where("a.title", "like", `%${kw}%`)
            .orWhere("a.description", "like", `%${kw}%`);
      });
    }
  };

  const selectFields = [
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
  ];

  if (tag) {
    selectFields.push("a.tagId");
  }

  // field=false 时列表不返回 ext_data（栏目模板数据 articleList.params.field 可配，默认 true）
  if (field) {
    selectFields.push("a.ext_data");
  }

  // count、list 并行执行（baseWhere 为函数引用，每次 where 调用独立应用，安全并行）
  const [total, result] = await Promise.all([
    getApp().db("cms_article AS a")
      .count("a.id as count")
      .where(baseWhere)
      .first(),
    getApp().db.select(...selectFields)
      .from("cms_article AS a")
      .leftJoin("cms_category AS c", "a.cid", "c.id")
      .where(baseWhere)
      .orderBy("a." + resolveArticleOrderBy(orderBy), resolveArticleOrder(order))
      .offset(start)
      .limit(pageSize),
  ]);

  // 从 ext_data 解析扩展字段并合并到列表项（field=false 时未查询 ext_data，跳过）
  if (field && result.length) {
    result.forEach(mergeExtData);
  }

  // 批量绑定标签（空列表安全跳过）
  if (tag) {
    await attachTags(result);
  }

  return {
    total: total?.count || 0,
    current: +page,
    pageSize: pageSize,
    list: result,
  };
}

/**
 * 按扩展字段搜索/排序文章（万能模型通用查询，供模板 dataConfig 调用）
 * @param {Object} options - 查询选项
 * @param {number} options.cid - 栏目ID
 * @param {number} options.mid - 模型ID（和cid二选一）
 * @param {string} options.fieldName - 扩展字段名，必填
 * @param {string} options.operator - 比较运算符：= > < >= <= like，默认=
 * @param {string|number} options.value - 字段值
 * @param {string} options.sortField - 排序字段名
 * @param {string} options.sortOrder - 排序方向：asc/desc，默认asc
 * @param {number} options.start - 分页偏移量，默认0
 * @param {number} options.len - 每页数量，默认10
 * @returns {Promise<Object>} { list, total, current, pageSize, totalPages }
 */
export async function getArticleListByExtField({
  cid = 0,
  mid = 0,
  fieldName = "",
  operator = "=",
  value = "",
  sortField = "",
  sortOrder = "asc",
  start = 0,
  len = 10,
}) {
  if (!fieldName) {
    return { list: [], total: 0, current: 1, pageSize: len, totalPages: 0 };
  }

  const validOperators = ["=", ">", "<", ">=", "<=", "like"];
  const op = validOperators.includes(operator) ? operator : "=";
  const pageSize = Math.min(parseInt(len) || 10, 100);
  const offset = parseInt(start) || 0;

  // 构建基础查询
  const query = getApp().db("cms_article as a")
    .leftJoin("cms_category as c", "a.cid", "c.id")
    .leftJoin("cms_article_ext_index as idx", function () {
      this.on("idx.article_id", "=", "a.id").andOn(
        "idx.field_name",
        "=",
        getApp().db.raw("?", [fieldName])
      );
    })
    .select("a.*", "c.name", "c.slug", "c.path")
    .where("a.status", 0);

  // 按栏目筛选
  if (cid) {
    query.where("a.cid", cid);
  }

  // 按模型筛选（查询该模型下所有栏目）
  if (mid && !cid) {
    const categories = await getApp().db("cms_category")
      .select("id")
      .where("mid", mid);
    const cids = categories.map((item) => item.id);
    if (cids.length > 0) {
      query.whereIn("a.cid", cids);
    }
  }

  // 扩展字段条件过滤
  if (op === "like") {
    query.where("idx.field_value", "like", `%${value}%`);
  } else {
    const numValue = Number(value);
    if (!isNaN(numValue) && value !== "") {
      query.where("idx.field_value_num", op, numValue);
    } else {
      query.where("idx.field_value", op, value);
    }
  }

  // 排序（order 经白名单校验仅允许 asc/desc，杜绝 SQL 注入）
  const order = sortOrder.toLowerCase() === "desc" ? "desc" : "asc";
  if (sortField) {
    if (sortField === fieldName) {
      // 排序字段和查询字段相同，直接用 idx
      query.orderByRaw(
        `CASE WHEN idx.field_value_num IS NOT NULL THEN idx.field_value_num WHEN idx.field_value_date IS NOT NULL THEN idx.field_value_date ELSE 0 END ${order}`
      );
    } else {
      // 排序字段不同，需要额外 JOIN
      query.leftJoin("cms_article_ext_index as sortIdx", function () {
        this.on("sortIdx.article_id", "=", "a.id").andOn(
          "sortIdx.field_name",
          "=",
          getApp().db.raw("?", [sortField])
        );
      });
      query.orderByRaw(
        `CASE WHEN sortIdx.field_value_num IS NOT NULL THEN sortIdx.field_value_num WHEN sortIdx.field_value_date IS NOT NULL THEN sortIdx.field_value_date ELSE 0 END ${order}`
      );
    }
  } else {
    query.orderBy("a.id", "desc");
  }

  // count 与 list 并行执行（使用 .clone() 避免 query builder 被消费污染）
  const [countResult, list] = await Promise.all([
    query.clone().countDistinct("a.id as count").first(),
    query.clone().offset(offset).limit(pageSize),
  ]);
  const total = parseInt(countResult?.count || 0, 10);

  // 解析扩展字段到顶层
  if (list.length) {
    list.forEach(mergeExtData);
  }

  const current = Math.floor(offset / pageSize) + 1;

  return {
    list,
    total,
    current,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

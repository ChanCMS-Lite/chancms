/**
 * service 层通用小工具，消除各 service 的复制粘贴样板
 */

/**
 * 白名单字段过滤：仅提取 body 中声明的可写字段
 * 用法：const data = pickFields(body, ["name", "path"]);
 */
import { parsePage, parsePageSize } from "chanjs/utils/index.js";
export function pickFields(body, fields) {
  const data = {};
  for (const k of fields) {
    if (k in body) data[k] = body[k];
  }
  return data;
}

/**
 * 过滤 undefined/null/空数组/空字符串字段（create/update 入参清洗共用）
 */
export function cleanEmptyFields(obj) {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (typeof val === "string" && val === "") continue;
    result[key] = val;
  }
  return result;
}

/**
 * JSON 列对象转字符串：对象直接写入 knex 会序列化成
 * '[object Object]' → ER_INVALID_JSON_TEXT → 5001
 * 用法：stringifyJsonCols(data, ["ext_data"]);
 */
export function stringifyJsonCols(data, cols = ["ext_data"]) {
  for (const col of cols) {
    if (data[col] !== undefined && data[col] !== null && typeof data[col] === "object") {
      data[col] = JSON.stringify(data[col]);
    }
  }
  return data;
}

/**
 * 分页参数归一化：page/pageSize 兼容字符串，最小值 1
 */
export function normalizePage(page = 1, pageSize = 10, defaultSize = 10) {
  const current = parsePage(page);
  const size = parsePageSize(pageSize, defaultSize);
  return { current, size, offset: (current - 1) * size };
}

/**
 * cms 风格分页响应包装：{ success, code, msg, data: { total, current, pageSize, list } }
 * count 为 count 查询结果（已兜底 0，勿用 || 1，会导致 totalPages 计算错误）
 */
function pagedResponse(list, count, page, pageSize) {
  return {
    success: true,
    code: 0,
    msg: "查询成功",
    data: {
      total: count || 0,
      current: +page,
      pageSize: +pageSize,
      list: list,
    },
  };
}

/**
 * member 风格分页响应包装：{ success, code, msg, data: { list, total, page, pageSize } }
 * （与 pagedResponse 的字段顺序/命名不同：这里 page，且 list 在前，勿混用）
 * count 为 count 查询结果（已兜底 0）
 */
export function listPageResponse(list, count, page, pageSize) {
  return {
    success: true,
    code: 0,
    msg: "查询成功",
    data: {
      list: list,
      total: count || 0,
      page: parseInt(page),
      pageSize: pageSize,
    },
  };
}

/**
 * LIKE 关键词转义（% _ \），防止用户输入干扰模糊查询
 */
export function escapeLike(str = "") {
  return String(str).replace(/[%_\\]/g, "\\$&");
}

/**
 * 栏目 id 归一化（原 cms/service/Frag.js 与 Slide.js 各自复制的同名私有函数，收敛于此）
 * 空值/0 → null（全局）；非空必须校验栏目存在。
 * 返回三态：
 *   undefined          — 入参未携带 cid（沿用缺省）
 *   null               — 归一化为全局
 *   {success:false,...} — 非法 cid（调用方直接透传给前端，不抛 500）
 */
export async function normalizeCid(db, cid) {
  if (cid === undefined) return undefined;
  const n = Number(cid);
  if (!n || n <= 0) return null;
  const cat = await db("cms_category").where("id", n).first("id");
  if (!cat) return { success: false, code: 1006, msg: `归属栏目不存在: ${cid}`, data: {} };
  return n;
}

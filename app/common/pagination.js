import { getApp } from "chanjs";
import { parsePage, parsePageSize } from "chanjs/utils/index.js";

/**
 * 全局分页参数归一化工具
 *
 * 用途：统一所有列表接口的 page / pageSize 入参处理，
 *       防止前端传 pageSize=99999 拖垮数据库。
 *
 * 配置来源（两层，DB 优先、env 兜底）：
 *   1) env 兜底：PAGE_SIZE_MAX（默认 100），在 config 加载期从环境变量读取
 *   2) 后台覆盖：sys_config.page_config.PAGE_SIZE_MAX，
 *      经 remote-config 注入 config 根，启动期合并一次；
 *      后台改完即时生效（下次请求即读新值）
 *
 * 使用方式：
 *   const { page, pageSize } = normalizePage(req.query.page, req.query.pageSize);
 *   const result = await Article.list(page, pageSize, cid);
 *
 * @param {string|number|undefined} pageRaw 原始页码（req.query.page）
 * @param {string|number|undefined} sizeRaw  原始每页条数（req.query.pageSize）
 * @param {number} [defaultSize=10]         未传 pageSize 时的默认值
 * @returns {{page: number, pageSize: number}} 归一化后的页码与每页条数（pageSize 已封顶）
 */
export function normalizePage(pageRaw, sizeRaw, defaultSize = 10) {
  const app = getApp();
  const maxSize = Number(app?.config?.PAGE_SIZE_MAX) || 100;

  // 页码/每页条数解析收敛到 chanjs 原语（NaN/负值自动回落，pageSize 钳制 [1, maxSize]）
  const page = parsePage(pageRaw);
  const pageSize = parsePageSize(sizeRaw, defaultSize, maxSize);

  return { page, pageSize };
}

/**
 * 仅封顶 pageSize（不改 page）。
 * 供老代码里已经自己 parseInt 过 pageSize 的 controller 用，一行接入全局上限。
 * 用法：`pageSize = capPageSize(pageSize)`
 */
export function capPageSize(sizeRaw, defaultSize = 10) {
  const app = getApp();
  const maxSize = Number(app?.config?.PAGE_SIZE_MAX) || 100;
  return parsePageSize(sizeRaw, defaultSize, maxSize);
}

export default normalizePage;

import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import { Repository } from "chanjs";
import xss from "xss";
import { formatDateFields } from "chanjs/utils/index.js";
import { stringifyJsonCols, pickFields, escapeLike } from "../../../common/model-utils.js";

class MessageService extends Repository {
  constructor() {
    super("cms_message");
  }

  // 过滤 XSS 危险内容
  sanitize(data) {
    if (!data || typeof data !== 'object') return data;
    const fields = ["title", "content", "wechat", "tel", "email"];
    const result = { ...data };
    fields.forEach((field) => {
      if (typeof result[field] === 'string') {
        result[field] = xss(result[field]);
      }
    });
    return result;
  }

  // 新增
  async create(body) {
    const safeBody = this.sanitize(body);
    stringifyJsonCols(safeBody);
    return this.insert(safeBody);
  }

  // 删（支持单 id 或逗号分隔批量）
  async delete(id) {
    const ids = String(id).split(",").map((i) => Number(i)).filter((i) => i > 0);
    if (ids.length === 0) {
      return { success: true, code: 0, msg: "删除成功", data: { affectedRows: 0 } };
    }
    const affectedRows = await this.db(this.tableName).whereIn("id", ids).del();
    return { success: true, code: 0, msg: "删除成功", data: { affectedRows } };
  }

  // 改
  async update(body) {
    const { id, ...data } = body;
    const safeData = this.sanitize(data);
    // ext_data 是 JSON 列，对象必须转字符串（避免 5001）
    if (safeData.ext_data !== undefined && safeData.ext_data !== null && typeof safeData.ext_data === 'object') {
      safeData.ext_data = JSON.stringify(safeData.ext_data);
    }
    const res = await this.updateById(id, safeData);
    return res;
  }

  // 列表
  async list(page = 1, pageSize = 10) {
    const res = await this.query({
      current: page,
      pageSize: pageSize,
      fields: ["id", "title", "tel","wechat", "content", "created_at"],
    });
    return res;
  }

  // 搜索（标题 + 内容模糊匹配）
  async search(keyword = "", page = 1, pageSize = 10) {
    // 转义 LIKE 特殊字符：% _ \ 防 LIKE 注入（统一用 common/model-utils.escapeLike，避免各模块重复实现）
    const safeKey = `%${escapeLike(keyword)}%`;
    const offset = (parsePage(page) - 1) * pageSize;

    const buildQuery = () =>
      this.db(this.tableName)
        .where("title", "like", safeKey)
        .orWhere("content", "like", safeKey);

    const [countResult, list] = await Promise.all([
      buildQuery().count("id", { as: "count" }).first(),
      buildQuery()
        .select("id", "title", "tel", "wechat", "content", "created_at")
        .orderBy("id", "desc")
        .limit(pageSize)
        .offset(offset),
    ]);

    const count = parseInt(countResult?.count || 0, 10);
    const formattedList = formatDateFields(list, ["created_at"]);
    return {
      success: true,
      code: 0,
      msg: "查询成功",
      data: {
        total: count,
        current: parsePage(page),
        pageSize,
        list: formattedList,
      },
    };
  }

  // 查
  async detail(id) {
    const res = await this.findById(id);
    return res;
  }
}

export default new MessageService();

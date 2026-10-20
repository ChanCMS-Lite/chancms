import { Repository } from "chanjs";
import { formatDateFields } from "chanjs/utils/index.js";

class OperLogService extends Repository {
  constructor() {
    super("sys_oper_log");
  }

  /**
   * @description 获取分页操作日志列表
   * @param {Object} param0 - 查询参数
   */
  async list({ cur = 1, pageSize = 10, title, oper_name, business_type, operator_type, status }) {
    const query = this.db(this.tableName);

    if (title) {
      query.where("title", "like", `%${title}%`);
    }
    if (oper_name) {
      query.where("oper_name", "like", `%${oper_name}%`);
    }
    if (business_type !== undefined && business_type !== '') {
      query.where("business_type", business_type);
    }
    if (operator_type !== undefined && operator_type !== '') {
      query.where("operator_type", operator_type);
    }
    if (status !== undefined && status !== '') {
      query.where("status", status);
    }

    const offset = parseInt((cur - 1) * pageSize);

    // count 与 list 并行执行（用 .clone() 保证两个独立 builder，安全并行）
    const [totalRes, list] = await Promise.all([
      query.clone().count("id", { as: "count" }).first(),
      query.clone()
        .select("*")
        .orderBy("oper_time", "desc")
        .limit(pageSize)
        .offset(offset),
    ]);
    const total = parseInt(totalRes?.count || 0, 10);

    // 格式化时间字段
    const formattedList = formatDateFields(list, ['oper_time', 'cost_time']);

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total,
        current: cur,
        pageSize,
        list: formattedList,
      },
    };
  }

  /**
   * @description 批量删除操作日志
   * @param {number[]} ids - 日志ID数组
   */
  async deleteBatch(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, code: 1007, msg: '请选择要删除的日志' };
    }
    await this.db(this.tableName).whereIn("id", ids).del();
    return { success: true, code: 0, msg: '删除成功', data: { affectedRows: ids.length } };
  }

  /**
   * @description 批量插入操作日志（中间件异步 flush 用）
   * @param {Object[]} records - 日志记录数组
   * @returns {Promise<number[]>} 插入的 ID 数组；空数组直接返回
   */
  async batchInsert(records) {
    if (!Array.isArray(records) || records.length === 0) return [];
    return await this.db(this.tableName).insert(records);
  }

  /**
   * @description 清空操作日志
   */
  async clear() {
    await this.db(this.tableName).del();
    return { success: true, code: 0, msg: '清空成功', data: {} };
  }
}

export default new OperLogService();

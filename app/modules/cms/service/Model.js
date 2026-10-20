import { Repository } from "chanjs";
import { stringifyJsonCols, pickFields } from "../../../common/model-utils.js";

const MODEL_WRITE_FIELDS = ["model", "model_code", "status", "remark", "description", "icon", "category", "settings"];

class ModelService extends Repository {
  constructor() {
    super("cms_model");
  }

  // 增 - 不再动态建表
  async create(body) {
    const data = pickFields(body, MODEL_WRITE_FIELDS);
    // 兜底默认值
    if (data.status === undefined) data.status = 1;
    if (data.remark === undefined) data.remark = "";
    stringifyJsonCols(data, ["settings"]);

    const result = await this.db(this.tableName).insert(data);
    return { success: true, code: 0, msg: '创建成功', data: { id: result[0] } };
  }

  // 检查模型名称是否重复
  async findByName(model) {
    const res = await this.db(this.tableName)
      .where('model', model)
      .select();
    
    return { success: true, code: 0, msg: '查询成功', data: res };
  }

  async hasUse(id) {
    const res = await this.db
      .select(this.db.raw("COUNT(*) as count"))
      .from("cms_article as a")
      .leftJoin("cms_category as c", "c.id", "a.cid")
      .where("c.mid", id)
      .first();

    return { success: true, code: 0, msg: '查询成功', data: { total: res.count } };
  }

  // 删 - 不再动态删表；支持批量（逗号分隔 id）
  async delete(body) {
    const rawIds = String(body.id ?? "").split(",").map((x) => parseInt(x)).filter(Boolean);
    if (!rawIds.length) return { success: false, code: 1007, msg: "请选择要删除的模型" };

    // 批量校验：有字段 / 被栏目使用 的模型不能删（2 次聚合代替 N 次循环查库）
    const fieldCounts = await this.db("cms_field").whereIn("mid", rawIds)
      .groupBy("mid").select("mid", this.db.raw("COUNT(*) as count"));
    const usedByField = fieldCounts.find((r) => r.count > 0);
    if (usedByField) {
      return { success: false, code: 1008, msg: `模型 id=${usedByField.mid} 下存在字段，无法删除` };
    }
    const catCounts = await this.db("cms_category").whereIn("mid", rawIds)
      .groupBy("mid").select("mid", this.db.raw("COUNT(*) as count"));
    const usedByCat = catCounts.find((r) => r.count > 0);
    if (usedByCat) {
      return { success: false, code: 1008, msg: `模型 id=${usedByCat.mid} 已被栏目使用，无法删除` };
    }

    // 只删除记录
    await this.db(this.tableName).whereIn("id", rawIds).del();

    return { success: true, code: 0, msg: '删除成功', data: {} };
  }

  // 修改（仅写入白名单字段，防止越权改任意列）
  async update(body) {
    const { id, ...rest } = body;
    const data = pickFields(rest, MODEL_WRITE_FIELDS);
    stringifyJsonCols(data, ["settings"]);
    const res = await this.updateById(id, data);
    return res;
  }

  // 获取全量model
  async list(page = 1, pageSize = 100) {
    let res = await this.query({
      current: page,
      pageSize: pageSize,
      query: {},
      fields: ["*"],
      // cms_model 无 created_at，id 自增即最近添加；倒序让新模型显示在第一页
      sort: { id: "desc" },
    });
    return res;
  }

  // 查
  async detail(id) {
    const res = await this.findById(id, {
      fields: ["*"],
    });
    return res;
  }

  // 搜索
  async search(key = "", page = 1, pageSize = 10) {
    let res = await this.query({
      current: page,
      pageSize: pageSize,
      query: key ? { model: { $like: `%${key}%` } } : {},
      fields: ["*"],
      // 同 list：id 倒序，最近添加的模型排前面
      sort: { id: "desc" },
    });
    return res;
  }
}

export default new ModelService();
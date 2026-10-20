import { Repository } from "chanjs";
import { formatDateFields } from "chanjs/utils/index.js";
import { stringifyJsonCols, pickFields, normalizeCid } from "../../../common/model-utils.js";


const FRAG_WRITE_FIELDS = ["name", "mark", "content", "type", "mid", "ext_data", "cid"];

class FragService extends Repository {
  constructor() {
    super("cms_frag");
  }

  // 新增（仅写入白名单字段，防止越权改任意列）
  async create(body) {
    const data = pickFields(body, FRAG_WRITE_FIELDS);
    const cid = await normalizeCid(this.db, data.cid);
    // 非法 cid：返回错误体由 controller 透传，不抛 500
    if (cid && typeof cid === "object" && cid.success === false) return cid;
    if (cid !== undefined) data.cid = cid;
    else delete data.cid;
    stringifyJsonCols(data);
    return this.insert(data);
  }

  // 删
  async delete(id) {
    const res = await this.delById(id);
    return res;
  }

  // 修改（仅写入白名单字段）
  async update(body) {
    const { id, ...rest } = body;
    const data = pickFields(rest, FRAG_WRITE_FIELDS);
    const cid = await normalizeCid(this.db, data.cid);
    if (cid && typeof cid === "object" && cid.success === false) return cid;
    if (cid !== undefined) data.cid = cid;
    else delete data.cid;
    stringifyJsonCols(data);
    return this.updateById(id, data);
  }

  // 获取全量frag，默认100个page = 1,
  async list(page = 1, pageSize = 10) {
    const offset = parseInt((page - 1) * pageSize);

    // count 与 list 并行执行（两个独立 builder，安全并行）
    const [total, list] = await Promise.all([
      this.db(this.tableName).count("id", { as: "count" }),
      this.db
        .select(["id", "name", "mark", "content", "mid", "ext_data", "cid", "created_at", "updated_at"])
        .from(this.tableName)
        .limit(pageSize)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    const formattedList = formatDateFields(list, ['created_at', 'updated_at']);
    // count 兜底 0
    const count = total[0].count || 0;
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        list: formattedList,
        total: count,
        current: page,
        pageSize: pageSize,
      },
    };
  }

  // 查
  async detail(id) {
    const res = await this.findById(id, {
      fields: ["id", "name", "mark", "content", "type", "mid", "ext_data", "cid"],
    });
    return res;
  }

  // 搜索
  async search(key = "", page = 1, pageSize = 10) {
    const dbType = process.env.DB_TYPE || 'mysql';
    // 根据数据库类型选择查询方式（SQLite 不支持 COLLATE；PG 用 ILIKE 保持大小写不敏感语义）
    const nameCondition = dbType === 'sqlite' ? 'name' : this.db.raw('name COLLATE utf8mb4_general_ci');
    const offset = parseInt((page - 1) * pageSize);

    // count 与 list 共用条件（函数引用，每次独立应用，安全并行）
    const applyKey = (qb) => {
      if (!key) return;
      if (dbType === 'pg') qb.whereRaw('name ILIKE ?', [`%${key}%`]);
      else qb.where(nameCondition, 'like', `%${key}%`);
    };

    // count 与 list 并行执行
    const [total, list] = await Promise.all([
      this.db(this.tableName).modify(applyKey).count("id", { as: "count" }),
      this.db(this.tableName)
        .modify(applyKey)
        .select(["id", "name", "mark", "updated_at"])
        .limit(pageSize)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    // count 兜底 0
    const count = total[0].count || 0;
    const formattedList = formatDateFields(list, ['created_at', 'updated_at']);
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        list: formattedList,
        total: count,
        current: page,
        pageSize: pageSize,
      },
    };
  }
}

export default new FragService();

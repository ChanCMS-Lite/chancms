import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import { Repository } from "chanjs";
import { stringifyJsonCols, pickFields, normalizeCid } from "../../../common/model-utils.js";

const SLIDE_WRITE_FIELDS = ["title", "imgUrl", "linkUrl", "content", "mark", "sort", "status", "mid", "ext_data", "cid", "created_at"];

class SlideService extends Repository {
  constructor() {
    super("cms_slide");
  }

  // 新增（仅写入白名单字段，防止越权改任意列）
  async create(body) {
    const data = pickFields(body, SLIDE_WRITE_FIELDS);
    const cid = await normalizeCid(this.db, data.cid);
    if (cid !== undefined) data.cid = cid;
    else delete data.cid;
    // 发布时间：新增可改，格式化为 Date 交给驱动序列化；为空/非法则剔除（创建时由 DB 默认值写入）
    if (data.created_at) {
      const dt = new Date(data.created_at);
      if (!isNaN(dt.getTime())) data.created_at = dt;
      else delete data.created_at;
    } else {
      delete data.created_at;
    }
    stringifyJsonCols(data);
    return this.insert(data);
  }

  // 删
  async delete(id) {
    const res = await this.delById(id);
    return res;
  }

  // 改（仅写入白名单字段）
  async update(body) {
    const { id, updated_at, ...rest } = body;
    const data = pickFields(rest, SLIDE_WRITE_FIELDS);
    const cid = await normalizeCid(this.db, data.cid);
    if (cid && typeof cid === "object" && cid.success === false) return cid;
    if (cid !== undefined) data.cid = cid;
    else delete data.cid;
    // 发布时间：编辑可改，格式化为 Date 交给驱动序列化；为空/非法则剔除（保留原值）
    if (data.created_at) {
      const dt = new Date(data.created_at);
      if (!isNaN(dt.getTime())) data.created_at = dt;
      else delete data.created_at;
    } else {
      delete data.created_at;
    }
    stringifyJsonCols(data);
    return this.updateById(id, data);
  }

  // 列表
  async list(page = 1, pageSize = 10) {
    const res = await this.query({
      current: page,
      pageSize: pageSize,
      fields: ["id", "title", "imgUrl", "linkUrl", "status", "sort", "cid"]
    });
    return res;
  }

  // 查
  async detail(id) {
    const res = await this.findById(id);
    return res;
  }

  // 搜索
  async search(keyword = '', page = 1, pageSize = 10, cid = 0) {
    // 分页参数
    const current = parsePage(page);
    const size = parsePageSize(pageSize);
    const offset = (current - 1) * size;

    // count 与 list 并行执行（两个独立 builder，安全并行）
    const [totalResult, list] = await Promise.all([
      this.db(this.tableName)
        .modify((qb) => {
          if (keyword) qb.where("title", "LIKE", `%${keyword}%`);
        })
        .count("* as total")
        .first(),
      this.db(this.tableName)
        .modify((qb) => {
          if (keyword) qb.where("title", "LIKE", `%${keyword}%`);
        })
        .select(["id", "title", "imgUrl", "linkUrl", "status", "sort", "cid", "created_at"])
        .orderBy("sort", "asc")
        .orderBy("id", "desc")
        .offset(offset)
        .limit(size),
    ]);

    const total = parseInt(totalResult?.total || 0, 10);

    return {
      total: total,
      current: current,
      pageSize: size,
      list: list
    };
  }
}

export default new SlideService();
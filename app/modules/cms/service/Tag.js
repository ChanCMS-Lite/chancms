import { Repository, logger } from "chanjs";
import { stringifyJsonCols, pickFields } from "../../../common/model-utils.js";

const TAG_WRITE_FIELDS = ["name", "path", "count", "cid"];

class TagService extends Repository {
  constructor() {
    super("cms_tag");
  }

  // 新增（仅写入白名单字段，防止越权改任意列）
  async create(body) {
    return this.insert(pickFields(body, TAG_WRITE_FIELDS));
  }

  async has(path, cid) {
    const query = { path };
    if (cid) query.cid = cid;
    const res = await this.findOne({ query });
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return true;
    }
    return false;
  }

  // 删除tag ,需要删除cms_articleTag.js 里面的tid
  // 同时清理 cms_article.tagId 字段中的孤儿 ID（逗号分隔字符串）
  async delete(id) {
    try {
      return await this.db.transaction(async (trx) => {
        // 1. 清理 cms_articletag 关联表
        await trx("cms_articletag").where("tid", id).del();
        // 2. 清理 cms_article.tagId 中残留的孤儿 ID（逗号分隔字符串字段）
        //    多库兼容：MySQL FIND_IN_SET / PG ? = any(string_to_array) / SQLite instr 精确分词
        const dbType = (process.env.DB_TYPE || 'mysql').toLowerCase();
        const findInSetRaw =
          dbType === 'pg' ? `? = any(string_to_array("tagId", ','))`
          : dbType === 'sqlite' ? `instr(',' || "tagId" || ',', ',' || ? || ',') > 0`
          : `FIND_IN_SET(?, tagId)`;
        const articles = await trx("cms_article")
          .whereRaw(findInSetRaw, [id])
          .select("id", "tagId");
        // 跨库无法用单条 SQL「从逗号列表移除某元素」，改为并发更新降低延迟（替代逐条串行 await）
        await Promise.all(articles.map((art) => {
          const newTagId = String(art.tagId || "")
            .split(",")
            .filter(tid => tid && Number(tid) !== Number(id))
            .join(",");
          return trx("cms_article").where("id", art.id).update({ tagId: newTagId });
        }));
        // 3. 删除 tag 本身
        await trx(this.tableName).where("id", id).del();
        return { success: true, code: 0, msg: '删除成功', data: { affectedRows: 1 } };
      });
    } catch (err) {
      logger.error("[TagService.delete] 失败:", err.message);
      throw err;
    }
  }

  // 修改（仅写入白名单字段）
  async update(body) {
    const { id, ...rest } = body;
    return this.updateById(id, pickFields(rest, TAG_WRITE_FIELDS));
  }

  // 文章列表
  async list(page = 1, pageSize = 20, cid) {
    const _cid = parseInt(cid, 10) || 0;
    const offset = parseInt((page - 1) * pageSize);

    // count 与 list 并行执行（两个独立 builder，安全并行）
    const [total, list] = await Promise.all([
      this.db(this.tableName).modify((qb) => {
        if (_cid) qb.where({ cid: _cid });
      }).count("id", { as: "count" }),
      this.db
        .select(["id", "name", "path", "cid"])
        .from(this.tableName)
        .modify((qb) => {
          if (_cid) qb.where({ cid: _cid });
        })
        .limit(pageSize)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    // count 兜底 0
    const count = total[0].count || 0;
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        current: +page,
        pageSize: pageSize,
        list: list,
      },
    };
  }


  // 查
  async detail(id) {
    const data = await this.db(this.tableName).where("id", "=", id).select();
    if (!data || data.length === 0) {
      return {
        success: false,
        code: 1004,
        msg: "标签不存在",
        data: null
      };
    }
    return {
      success: true,
      code: 0,
      msg: "查询成功",
      data: data[0]
    };
  }

  // 搜索
  async search(key = "", page = 1, pageSize = 10, cid) {
    const _cid = parseInt(cid, 10) || 0;
    const dbType = process.env.DB_TYPE || 'mysql';
    // SQLite 无 COLLATE；PG 用 ILIKE 保持大小写不敏感语义
    const nameCondition = dbType === 'sqlite' ? 'name' : this.db.raw('name COLLATE utf8mb4_general_ci');
    const offset = parseInt((page - 1) * pageSize);

    // count 与 list 共用条件构造器（函数引用，每次独立应用，安全并行）
    const applyCond = (qb) => {
      if (key) {
        if (dbType === 'pg') qb.whereRaw('name ILIKE ?', [`%${key}%`]);
        else qb.where(nameCondition, 'like', `%${key}%`);
      }
      if (_cid) qb.where({ cid: _cid });
    };

    // count 与 list 并行执行
    const [total, list] = await Promise.all([
      this.db(this.tableName).modify(applyCond).count("id", { as: "count" }),
      this.db
        .select(["id", "name", "path", "cid"])
        .from(this.tableName)
        .modify(applyCond)
        .limit(pageSize)
        .offset(offset)
        .orderBy("id", "desc"),
    ]);

    // count 兜底 0
    const count = total[0].count || 0;
    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        current: +page,
        pageSize: pageSize,
        list: list,
      },
    };
  }
}

export default new TagService();

import { Repository } from "chanjs";
import { formatDateFields } from "chanjs/utils/index.js";
import { stringifyJsonCols } from "../../../common/model-utils.js";
import {
  CONTENT_TYPES,
  ALL_CONTENT_TYPES,
} from "../../../common/content-types.js";


class CategoryService extends Repository {
  constructor() {
    super("cms_category");
  }

  // 视图名安全校验（仅允许 xxx.html 纯文件名）+ JSON 列对象转字符串
  _normalize(data) {
    if (data.listView && !/^[\w-]+\.html$/i.test(data.listView)) {
      return { success: false, code: 1006, msg: "列表视图名非法" };
    }
    if (data.articleView && !/^[\w-]+\.html$/i.test(data.articleView)) {
      return { success: false, code: 1006, msg: "内容视图名非法" };
    }
    stringifyJsonCols(data, ["aigeo", "variables", "dataConfig", "ext_data", "page_ext_data"]);
    return data;
  }

  // 内容域：根栏目声明、子孙继承
  // 子栏目一律跟随父级 content_type（避免子栏目被单独改成另一种域导致串门）
  async _resolveContentType(data) {
    const pid = Number(data.pid || 0);
    if (pid > 0) {
      const parent = await this.db(this.tableName).where("id", pid).select("content_type").first();
      // 父级缺失时兜底 article；父级若为脏值（不在枚举内）同样兜底
      data.content_type = ALL_CONTENT_TYPES.includes(parent?.content_type)
        ? parent.content_type
        : CONTENT_TYPES.ARTICLE;
    } else {
      // 根栏目：只接受合法域，其余一律兜底 article
      data.content_type = ALL_CONTENT_TYPES.includes(data.content_type)
        ? data.content_type
        : CONTENT_TYPES.ARTICLE;
    }
    return data;
  }

  // 取某栏目整棵子树 id（含自身），Set 防成环
  async _subtreeIds(rootId) {
    const rows = await this.db(this.tableName).select("id", "pid");
    const childrenMap = new Map();
    for (const r of rows) {
      if (!childrenMap.has(r.pid)) childrenMap.set(r.pid, []);
      childrenMap.get(r.pid).push(r.id);
    }
    const out = [];
    const seen = new Set();
    const stack = [Number(rootId)];
    while (stack.length) {
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      out.push(cur);
      for (const k of childrenMap.get(cur) || []) stack.push(k);
    }
    return out;
  }

  // 增
  async create(body) {
    const data = this._normalize({ ...body });
    if (data.success === false) return data;
    await this._resolveContentType(data);
    // NOT NULL 兜底：cms_category.path / description 库列为 NOT NULL 且无 DEFAULT，
    //    schema 里声明为 nullable+optional —— 不传/传 null 时校验放行、DB 直接抛 5001。
    //    create 阶段补空串（有值不动）；update 不受影响，避免"局部更新把已有 path 清空"。
    if (data.path === undefined || data.path === null) data.path = "";
    if (data.description === undefined || data.description === null) data.description = "";
    return this.insert(data);
  }

  // 删
  async delete(id) {
    // 引用校验并行化（独立 count 查询并行执行，替代串行 await）；
    // 结果按固定顺序检查，保持错误提示优先级：子栏目 > 文章 > 挂栏内容
    const refTables = ["cms_frag", "cms_slide"];
    const [children, articles, ...refs] = await Promise.all([
      this.db(this.tableName).where("pid", id).count("id as count").first(),
      this.db("cms_article").where("cid", id).count("id as count").first(),
      ...refTables.map((table) => this.db(table).where("cid", id).count("id as count").first()),
    ]);

    if (Number(children?.count || 0) > 0) {
      return { success: false, code: 1008, msg: '该栏目下存在子栏目，无法删除' };
    }
    if (Number(articles?.count || 0) > 0) {
      return { success: false, code: 1008, msg: '该栏目下存在文章，无法删除' };
    }
    // 其余挂栏内容引用（碎片/轮播），防止删栏目后产生孤儿数据
    if (refs.some((ref) => Number(ref?.count || 0) > 0)) {
      return { success: false, code: 1008, msg: '该栏目下存在内容，无法删除' };
    }

    const res = await this.delById(id);
    return { success: true, code: 0, msg: '删除成功', data: res };
  }

  // 改
  async update(body) {
    const { id, ...data } = body;
    const normalized = this._normalize(data);
    if (normalized.success === false) return normalized;
    const old = await this.db(this.tableName).where("id", id).first();
    await this._resolveContentType(normalized);
    const res = await this.updateById(id, normalized);
    // 根栏目内容类型变更 → 级联整棵子树，保持「子孙继承」
    if (old && Number(old.pid) === 0 && normalized.content_type && old.content_type !== normalized.content_type) {
      const ids = await this._subtreeIds(id);
      if (ids.length) {
        await this.db(this.tableName).whereIn("id", ids).update({ content_type: normalized.content_type });
      }
    }
    return res;
  }

  // 查全部栏目（完整树，按 orderBy 升序）
  // 域隔离不做在接口层：各模块拿到全量后用前端 markForeignDisabled 标 disabled
  async find(options = {}) {
    const res = await super.find({ sort: { orderBy: "asc" }, ...options });
    return res;
  }

  // 查栏目
  async findId(id) {
    const data = await this.db(this.tableName)
      .where("id", "=", id)
      .select([
        "id",
        "pid",
        "seoTitle",
        "seoKeywords",
        "seoDescription",
        "name",
        "slug",
        "path",
        "description",
        "type",
        "content_type",
        "is_dir",
        "url",
        "orderBy",
        "target",
        "status",
        "mid",
        "listView",
        "articleView",
        "dataConfig",
        "image",
        "aigeo",
        "ext_data",
        "page_mid",
        "page_ext_data",
      ])
      .first();
    return data;
  }

  // 查子栏目
  async findSubId(id) {
    const result = await this.find({ query: { pid: id } });
    return result;
  }

  // 搜索栏目
  async search(key) {
    let query = this.db(this.tableName)
      .leftJoin("cms_model", `${this.tableName}.mid`, "cms_model.id")
      .select(`${this.tableName}.*`, "cms_model.model")
      .orderBy(`${this.tableName}.orderBy`, "asc");

    if (key) {
      const dbType = process.env.DB_TYPE || 'mysql';
      // 根据数据库类型选择查询方式（SQLite 不支持 COLLATE；PG 用 ILIKE 保持大小写不敏感语义）
      if (dbType === 'sqlite') {
        query = query.where(`${this.tableName}.name`, 'like', `%${key}%`);
      } else if (dbType === 'pg') {
        query = query.whereRaw(`${this.tableName}.name ILIKE ?`, [`%${key}%`]);
      } else {
        query = query.whereRaw(
          `${this.tableName}.name COLLATE utf8mb4_general_ci LIKE ?`,
          [`%${key}%`]
        );
      }
    }

    const res = await query;
    const formattedRes = formatDateFields(res, ['created_at', 'updated_at', 'publishTime', 'startTime', 'endTime']);
    return { success: true, code: 0, msg: '查询成功', data: formattedRes };
  }
}

export default new CategoryService();

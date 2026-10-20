import { Repository, logger } from "chanjs";

class FieldService extends Repository {
  constructor() {
    super("cms_field");
  }

  // 解析 field_config JSON（加 try/catch 防损坏 JSON 导致服务崩溃）
  _parseFieldConfig(raw, where) {
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      logger.error(`[Field.${where}] field_config 解析失败:`, e.message);
      return {};
    }
  }


  /**
   * 创建字段（不再动态建表）
   * 只在 cms_field 表中插入记录,用于前端表单渲染
   */
  async create(body) {
    const { 
      mid, 
      field_name, 
      field_label, 
      type, 
      field_config,
      is_required,
      is_searchable,
      is_listable,
      is_sortable,
      sort_order,
      group_name
    } = body;

    // 检查字段名是否重复
    const exists = await this.db(this.tableName)
      .where("mid", mid)
      .where("field_name", field_name)
      .first();
    
    if (exists) {
      return { success: false, code: 1005, msg: '字段名称已存在', data: null };
    }

    const result = await this.db(this.tableName).insert({
      mid,
      field_name,
      field_label,
      type,
      field_config: JSON.stringify(field_config || {}),
      is_required: is_required ? 1 : 0,
      is_searchable: is_searchable ? 1 : 0,
      is_listable: is_listable !== undefined ? (is_listable ? 1 : 0) : 1,
      is_sortable: is_sortable ? 1 : 0,
      sort_order: sort_order || 0,
      group_name: group_name || '基本信息'
    });

    return { success: true, code: 0, msg: '创建成功', data: { id: result[0] } };
  }

  /**
   * 检查字段名是否存在
   */
  async findByName(field_name, mid) {
    const data = await this.db(this.tableName)
      .where("field_name", field_name)
      .where("mid", mid)
      .first();
    
    return data 
      ? { success: true, code: 0, msg: '查询成功', data }
      : { success: false, code: 1004, msg: '字段不存在', data: null };
  }

  /**
   * 删除字段（不再删除表列）
   */
  async delete(id) {
    const data = await this.db(this.tableName).where("id", "=", id).first();
    if (!data) {
      return { success: false, code: 1004, msg: '字段不存在', data: null };
    }

    // 清理该模型下文章的扩展字段索引，避免误删其他模型同名字段
    const articles = await this.db("cms_article as a")
      .join("cms_category as c", "a.cid", "c.id")
      .where("c.mid", data.mid)
      .select("a.id");

    const articleIds = articles.map((a) => a.id);
    if (articleIds.length > 0) {
      await this.db("cms_article_ext_index")
        .where("field_name", data.field_name)
        .whereIn("article_id", articleIds)
        .del();
    }

    await this.db(this.tableName).where("id", "=", id).del();
    return { success: true, code: 0, msg: '删除成功', data: null };
  }

  /**
   * 更新字段（不再修改表结构）
   */
  async update(body) {
    const { id, field_name, mid } = body;
    
    // 检查字段是否存在
    const field = await this.db(this.tableName).where("id", id).first();
    if (!field) {
      return { success: false, code: 1004, msg: '字段不存在', data: null };
    }

    // 如果修改了字段名,检查是否重复
    if (field_name && field_name !== field.field_name) {
      const exists = await this.db(this.tableName)
        .where("mid", mid || field.mid)
        .where("field_name", field_name)
        .whereNot("id", id)
        .first();
      
      if (exists) {
        return { success: false, code: 1005, msg: '字段名称已存在', data: null };
      }
    }

    // 准备更新数据
    const updateData = {};
    if (field_name) updateData.field_name = field_name;
    if (body.field_label) updateData.field_label = body.field_label;
    if (body.type) updateData.type = body.type;
    if (body.field_config !== undefined) updateData.field_config = JSON.stringify(body.field_config);
    if (body.is_required !== undefined) updateData.is_required = body.is_required ? 1 : 0;
    if (body.is_searchable !== undefined) updateData.is_searchable = body.is_searchable ? 1 : 0;
    if (body.is_listable !== undefined) updateData.is_listable = body.is_listable ? 1 : 0;
    if (body.is_sortable !== undefined) updateData.is_sortable = body.is_sortable ? 1 : 0;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.group_name) updateData.group_name = body.group_name;

    await this.db(this.tableName).where("id", id).update(updateData);
    return { success: true, code: 0, msg: '更新成功', data: null };
  }

  /**
   * 获取字段列表
   */
  async list(mid, page = 1, pageSize = 100) {
    // 缺少 mid 时直接返回空结果，避免 knex 执行 where("mid", undefined) 产生不确定行为
    if (mid === undefined || mid === null || mid === "") {
      return {
        success: true,
        code: 0,
        msg: '查询成功',
        data: { total: 0, current: +page, pageSize, list: [], model: [] },
      };
    }
    const total = await this.db(this.tableName)
      .where("mid", mid)
      .count("id", { as: "count" });
    
    const offset = parseInt((page - 1) * pageSize);
    const list = await this.db
      .select([
        "id", "mid", "field_name", "field_label", "type", 
        "field_config", "is_required", "is_searchable", 
        "is_listable", "is_sortable", "sort_order", "group_name"
      ])
      .from(this.tableName)
      .where("mid", "=", mid)
      .limit(pageSize)
      .offset(offset)
      .orderBy("sort_order", "asc")
      .orderBy("id", "asc");
    
    const count = total[0].count || 0;

    // 解析 field_config JSON（加 try/catch 防损坏 JSON 导致服务崩溃）
    const parsedList = list.map(item => ({
      ...item,
      field_config: this._parseFieldConfig(item.field_config, "list"),
    }));

    // 获取模型信息
    const models = await this.db
      .select(["model", "model_code"])
      .from("cms_model")
      .where("id", mid)
      .first();

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        current: +page,
        pageSize: pageSize,
        list: parsedList,
        model: models ? [models] : []
      }
    };
  }

  /**
   * 获取字段详情
   */
  async detail(id) {
    const data = await this.db(this.tableName)
      .where("id", id)
      .first();
    
    if (!data) {
      return { success: false, code: 1004, msg: '字段不存在', data: null };
    }

    // 解析 field_config（加 try/catch 防损坏 JSON 导致服务崩溃）
    data.field_config = this._parseFieldConfig(data.field_config, "detail");

    return { success: true, code: 0, msg: '查询成功', data };
  }

  /**
   * 根据模型ID获取所有字段定义（用于前端表单渲染）
   */
  async getFieldDefinition(mid) {
    const fields = await this.db(this.tableName)
      .where("mid", mid)
      .orderBy("sort_order", "asc")
      .orderBy("id", "asc");

    // 解析 field_config（加 try/catch 防损坏 JSON 导致服务崩溃）
    return fields.map(field => ({
      ...field,
      field_config: this._parseFieldConfig(field.field_config, "getFieldDefinition"),
    }));
  }
}

export default new FieldService();

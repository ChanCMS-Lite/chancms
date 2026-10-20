import { Repository } from "chanjs";

// 分页保留字不可能是合法的 WHERE 过滤列；controller 透传整个 req.query 时会被当成过滤字段，
// 需在入口剥离（与框架 Repository.applyQuery 的 PAGINATION_KEYS 保持一致），否则 count 查询会
// 拼出 `where pageSize = '20'` 触发 1054 报错。
const PAGINATION_KEYS = new Set(['current', 'page', 'pageNum', 'pageSize', 'limit', 'offset']);

class Config extends Repository {
  constructor() {
    super("sys_config");
  }

  /**
   * @description 重写 query 方法，使 count 查询同样应用过滤条件
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 分页结果
   */
  async query({ current = 1, pageSize = 10, query = {}, sort = {}, field = [] }) {
    this._checkDB();

    // 剥离分页保留字，避免被当成 WHERE 过滤列拼进 count 查询
    const cleanQuery = {};
    for (const [k, v] of Object.entries(query || {})) {
      if (PAGINATION_KEYS.has(k)) continue;
      cleanQuery[k] = v;
    }

    const size = Math.min(Math.max(pageSize, 1), this.limit);
    const offset = (current - 1) * size;

    let countQuery = this.db(this.tableName);
    let dataQuery = this._buildBaseQuery({ query: cleanQuery, sort, fields: field });

    if (Object.keys(cleanQuery).length) {
      countQuery = countQuery.where(cleanQuery);
    }

    const [totalResult, list] = await Promise.all([
      countQuery.count("* as total").first(),
      dataQuery.offset(offset).limit(size),
    ]);

    const total = Number(totalResult?.total ?? 0);
    const totalPages = Math.ceil(total / size);

    return { success: true, code: 0, msg: '查询成功', data: { list, total, current, pageSize: size, totalPages } };
  }

  /**
   * @description 根据菜单ID查找菜单信息
   * @param {number} id - 菜单ID
   * @returns {Promise<Object|null>} 返回找到的菜单对象或null
   */
  async detail(id) {
    const res = await this.findById(id, {
      fields: [
        "id",
        "type_code",
        "config_key",
        "config_value",
        "status",
        "remark",
      ],
    });
    return res;
  }

  /**
   * @description 删除菜单
   * @param {number} id - 要删除的菜单ID
   * @returns {Promise<boolean>} 操作是否成功
   */
  async delete(id) {
    const res = await this.findById(id, { fields: ["id", "is_system"] });
    // findById 返回包装对象 {success,code,msg,data:row}，须从 res.data 取行
    if (res.success && res.data && res.data.is_system === 1) {
      return { success: false, code: 1009, msg: "系统内置配置项不可删除，仅可修改" };
    }
    return await this.delById(id);
  }

  /**
   * @description 获取分页菜单列表
   * @param {Object} options - 分页查询参数
   * @returns {Promise<Object>} 包含菜单列表、总数等信息的对象
   */
  async list({
    query,
    fields = [
      "id",
      "type_code",
      "config_key",
      "config_value",
      "status",
      "remark",
      "is_system",
    ],
  }) {
    let res = await this.query({
      current: 1,
      pageSize: this.limit,
      query,
      fields,
    });
    // 安全：列表/公开配置接口对敏感字段脱敏，避免密钥明文回显
    // （detail 接口返回完整值，供管理员编辑；此处仅遮蔽列表展示）
    if (res?.success && Array.isArray(res.data?.list)) {
      const SENSITIVE_KEY = /(secret|password|passwd|pwd|token|api[_-]?key|access[_-]?key|private[_-]?key|appsecret|app_secret|security)/i;
      const SENSITIVE_JSON = /"(secret|password|passwd|pwd|token|apikey|accesskey|privatekey|appsecret)"\s*:/i;
      res.data.list = res.data.list.map((row) => {
        if (!row) return row;
        const key = String(row.config_key || "");
        if (SENSITIVE_KEY.test(key)) {
          return { ...row, config_value: "***（已脱敏）" };
        }
        if (typeof row.config_value === "string" && SENSITIVE_JSON.test(row.config_value)) {
          return { ...row, config_value: "***（已脱敏）" };
        }
        return row;
      });
    }
    return res;
  }

  // 增（字段白名单与 update/updateMany 对齐，防止越权写入 is_system 等列）
  async create(body) {
    const allowedFields = [
      'type_code', 'config_key', 'config_value', 'status', 'remark',
    ];
    const safeData = {};
    for (const key of allowedFields) {
      if (body?.[key] !== undefined) {
        safeData[key] = body[key];
      }
    }
    const res = await this.insert(safeData);
    return res;
  }

  async update(body) {
    const { id, ...data } = body;
    // 安全：字段白名单，防止越权修改 JWT_SECRET 等敏感配置
    const allowedFields = [
      'type_code', 'config_key', 'config_value', 'status', 'remark',
    ];
    const safeData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        safeData[key] = data[key];
      }
    }
    const res = await this.updateById(id, safeData);
    return res;
  }

  async updateMany(updates = []) {
    if (!Array.isArray(updates)) {
      return { success: false, code: 1007, msg: "参数格式错误" };
    }
    // 安全：字段白名单，与 update 一致，防止越权修改 JWT_SECRET 等敏感配置
    const allowedFields = [
      'type_code', 'config_key', 'config_value', 'status', 'remark',
    ];
    const safeUpdates = updates.map((u) => {
      const { query, data = {} } = u;
      const safeData = {};
      for (const key of allowedFields) {
        if (data[key] !== undefined) safeData[key] = data[key];
      }
      return { query, data: safeData };
    });
    const res = await super.updateMany(safeUpdates);
    return res;
  }
}

export default new Config();

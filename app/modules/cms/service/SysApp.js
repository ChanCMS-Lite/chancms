import { Repository } from "chanjs";

class SysAppService extends Repository {
  constructor() {
    super("sys_config");
  }

  /**
   * 查全部应用配置（按 type_code 分组由前端折叠展示）
   * @returns {Promise<Object[]>} sys_config 全表
   */
  async find() {
    return this.all({ sort: { id: "asc" }, limit: 1000 });
  }

  async update(body) {
    const { id } = body;
    // 安全：字段白名单，防止越权修改敏感配置
    const allowedFields = [
      'config_key', 'config_value', 'type_code', 'status', 'is_system', 'remark',
    ];
    const safeData = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        safeData[key] = body[key];
      }
    }
    if (!safeData.id && id) safeData.id = id;
    const res = await this.updateById(id, safeData);
    return res;
  }
}

export default new SysAppService();
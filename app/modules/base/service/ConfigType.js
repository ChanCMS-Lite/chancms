import { Repository } from "chanjs";

class ConfigTypeService extends Repository {
  constructor() {
    super("sys_config_type");
  }
  /**
   * @description 根据菜单ID查找菜单信息
   * @param {number} id - 菜单ID
   * @returns {Promise<Object|null>} 返回找到的菜单对象或null
   */
  async detail(id) {
    const res = await this.findById(id, {
      fields: ["id", "type_code", "type_name", "status", "remark", "is_system"],
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
      return { success: false, code: 1009, msg: "系统内置配置类型不可删除，仅可修改" };
    }
    return await this.delById(id);
  }

  /**
   * @description 获取分页菜单列表
   * @param {Object} options - 分页查询参数
   * @returns {Promise<Object>} 包含菜单列表、总数等信息的对象
   */
  async list(query) {
    let res = await this.query({
      current: 1,
      pageSize: this.limit,
      query,
      fields: ["id", "type_code", "type_name", "status", "remark", "is_system"],
    });
    return res;
  }

  // 可写字段白名单（对齐 sys_config_type 表结构，排除 id/时间等系统列，防批量赋值）
  static WRITE_FIELDS = ['type_code', 'type_name', 'status', 'remark'];

  // 增
  async create(body) {
    const data = {};
    for (const k of ConfigTypeService.WRITE_FIELDS) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    const res = await this.insert(data);
    return res;
  }

  async update(body) {
    const { id, ...rest } = body;
    const data = {};
    for (const k of ConfigTypeService.WRITE_FIELDS) {
      if (rest[k] !== undefined) data[k] = rest[k];
    }
    const res = await this.updateById(id, data);
    return res;
  }
}

export default new ConfigTypeService();

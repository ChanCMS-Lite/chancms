import { Repository } from "chanjs";
import { stringifyJsonCols, pickFields } from "../../../common/model-utils.js";

// 链接协议白名单：仅允许 http/https 及站内相对路径，禁止 javascript:/data:/vbscript: 等
// 危险协议（友情链接在前台以 <a href="{{link}}"> 直出，防存储型 XSS）
// 说明：无协议前缀（如 example.com/a、a）或协议相对（//cdn/x）视为安全，放行
function assertSafeLink(value, field) {
  if (value == null || value === "") return; // 允许为空
  if (typeof value !== "string") throw new Error(`${field} 格式错误`);
  const v = value.trim();
  const schemeMatch = v.match(/^([a-z][a-z0-9+.-]*):/i);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== "http" && scheme !== "https") {
      throw new Error(`${field} 仅支持 http/https 协议`);
    }
  }
}

class FriendlinkService extends Repository {
  constructor() {
    super("cms_friendlink");
  }

  // 新增
  async create(body) {
    assertSafeLink(body.link, "link");
    // 发布时间：新增可改，格式化为 Date 交给驱动序列化；为空/非法则剔除（创建时由 DB 默认值写入）
    if (body.created_at) {
      const dt = new Date(body.created_at);
      if (!isNaN(dt.getTime())) body.created_at = dt;
      else delete body.created_at;
    } else {
      delete body.created_at;
    }
    stringifyJsonCols(body);
    return this.insert(body);
  }

  // 删
  async delete(id) {
    const res = await this.delById(id);
    return res;
  }

  // 修改
  async update(body) {
    const { id, updated_at, ...data } = body;
    assertSafeLink(data.link, "link");
    // 发布时间：编辑可改，格式化为 Date 交给驱动序列化；为空/非法则剔除（保留原值）
    if (data.created_at) {
      const dt = new Date(data.created_at);
      if (!isNaN(dt.getTime())) data.created_at = dt;
      else delete data.created_at;
    } else {
      delete data.created_at;
    }
    stringifyJsonCols(data);
    const res = await this.updateById(id, data);
    return res;
  }

  // 列表
  async list(cur = 1, pageSize = 10) {
    const res = await this.query({
      current: cur,
      pageSize: pageSize,
      query: {},
      fields: ["*"],
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
  async search(key = "", cur = 1, pageSize = 10) {
    const res = await this.query({
      current: cur,
      pageSize: pageSize,
      query: key ? { title: { $like: `%${key}%` } } : {},
      fields: ["*"],
    });
    return res;
  }
}

export default new FriendlinkService();

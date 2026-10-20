import { Repository } from "chanjs";
import { stringifyJsonCols, pickFields } from "../../../common/model-utils.js";

// 站点配置可写字段白名单：与 cms_site 表结构对齐，排除系统列（id/created_at/updated_at）
// 配合 controller 的 passthrough 校验，防止越权写入任意表列
const SITE_WRITE_FIELDS = [
  "name", "logo", "domain", "tel", "email",
  "address", "icp", "copyright", "code",
  "json", "title", "keywords", "description", "template", "status",
  "close_tips", "uploadWay", "ext_data",
];

class SiteService extends Repository {
  constructor() {
    super("cms_site");
  }

  // 基本信息
  async info() {
    return await this.findOne();
  }

  // 更新基本信息（仅写入白名单字段，防止越权改任意列）
  async updateInfo(body) {
    const { id, ...rest } = body;
    const data = pickFields(rest, SITE_WRITE_FIELDS);
    stringifyJsonCols(data);
    if (Object.keys(data).length === 0) return { affectedRows: 0 };
    const res = await this.updateById(id, data);
    return res;
  }

  // 获取应用基本信息（DI：this.config 动态读取）
  // 注意：/site/appInfo 注册在 auth 之前（登录页需展示版本号），为公开接口——
  // 不可返回作者邮箱/微信号等联系方式，防止匿名爬取（前端仅消费 APP_NAME/VERSION/VERSION_TIME）
  async appInfo() {
    const { APP_VERSION, APP_NAME, APP_VERSION_TIME } = this.config;
    return { APP_VERSION, APP_NAME, APP_VERSION_TIME };
  }
}

export default new SiteService();
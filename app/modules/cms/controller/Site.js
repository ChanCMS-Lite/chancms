import { Controller, Paths, logger } from "chanjs";

import { clearAllWebCache, clearTemplateCache } from "../../../common/cacheclear.js";
import { validated } from "../../../common/validate.js";
import { updateSchema } from "../validator/Site.js";

class SiteController extends Controller {
  constructor() {
    super();
    this.Site = this.get("cms","Site","service");
  }
  // 查
  async info(req, res, next) {
    try {
      const Site = await this.Site;
      const result = await Site.info();
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const Site = await this.Site;
      const data = validated(updateSchema, req.body, res, this);
      if (data === undefined) return;
      // AIGEO：站点级配置（不增字段，存到现有 ext_data JSON 列的 aigeo 子键）。
      // Common.site() 通过 mergeExtData 自动把 ext_data.aigeo 提到顶层 site.aigeo。
      if (data.aigeo !== undefined) {
        const ext = data.ext_data && typeof data.ext_data === "object" ? data.ext_data : {};
        ext.aigeo = data.aigeo;
        data.ext_data = ext;
        delete data.aigeo;
      }
      const result = await Site.updateInfo(data);
      clearAllWebCache(req);
      clearTemplateCache(req);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 获取磁盘信息
  async runEnv(req, res, next) {
    try {
       // 仅返回项目目录名（最后一段），不泄露服务器绝对路径，降低信息泄露风险
       const dirname = String(Paths.rootPath || "").split(/[\\/]/).pop() || Paths.rootPath;
       res.json(this.success({ data: { dirname }}));
    } catch (err) {
      next(err);
    }
  }

  // 获取应用基本信息
  async getAppInfo(req, res, next) {
    try {
      const Site = await this.Site;
      const result = await Site.appInfo();
      res.json(this.success({
        data: result
      }));
    } catch (err) {
      logger.error('[SiteController.getAppInfo] 错误:', err);
      next(err);
    }
  }
}

export default new SiteController();
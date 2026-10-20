import path from "path";
import fs from "fs";
import { Controller, Paths } from "chanjs";
import { validated } from "../../../common/validate.js";

import { getFolders, getHtmlFilesSync } from "chanjs/utils/index.js";

import { findSchema, updateSchema } from "../validator/SysApp.js";

class SysAppController extends Controller {
  constructor() {
    super();
    this.sysApp = this.get("cms","SysApp","service");
    this.Site = this.get("cms","Site","service");
  }
  // 查
  async find(req, res, next) {
    try {
      const sysApp = await this.sysApp;
      const vdata = validated(findSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await sysApp.find();
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async getViews(req, res, next) {
    try {
      const Site = await this.Site;
      // 模板目录唯一来源 = 后台配置（cms_site.template），与前台 web/middleware/init.js 同口径。
      // 原写法读 this.config.template，而该键只被请求期副作用写入 → 启动时为 undefined，
      // 返回值实际取决于"有没有人访问过前台"，故改为直读 DB。
      const siteRes = await Site.info();
      const template = siteRes?.data?.template || "default";
      const viewsPath = path.join(Paths.rootPath, "view", template);
      const data = getHtmlFilesSync(viewsPath);
      // 注意：Controller.success 签名为 success({ data, msg })，必须传对象；
      // 传裸数组会被解构成 undefined → data 变 {}（前端拿到空对象，表现为"无模板"）
      res.json(this.success({ data }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取模板目录列表
   */
  async folder(req, res, next) {
    try {
      const dir = path.join(Paths.rootPath, `/view`);
      // 只列「真正含模板文件」的目录。
      // getFolders 只读子目录名，会把空目录（0 个 .html）也返回，
      // 后台模板下拉框选中它 → cms_site.template 指向无模板的目录 → 前台全站渲染失败。
      const folders = getFolders(dir).filter((name) => {
        try {
          return getHtmlFilesSync(path.join(dir, name)).length > 0;
        } catch {
          return false;
        }
      });
      // 同上：必须包成 { data } 再传给 success()
      res.json(this.success({ data: folders }));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const sysApp = await this.sysApp;
      const body = validated(updateSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await sysApp.update(body);
      res.json(this.success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new SysAppController();
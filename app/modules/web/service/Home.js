import { getApp, logger } from "chanjs";

import common from "./Common.js";

import { getApiCalls } from "../utils/index.js";
import { filterFields } from "chanjs/utils/index.js";


const home = {
  async init() {
    const config = getApp().config?.data?.init || {};
    const apiCalls = getApiCalls(config, {}, common);

    return this._aggregate(apiCalls);
  },

  // 通过 cid(数字ID) / slug(字符串) 获取栏目自定义 dataConfig
  _getCategoryConfig(categoryList, cid, defaultConfig = null) {
    if (!categoryList || !Array.isArray(categoryList)) return defaultConfig;
    
    const category = typeof cid === 'string' 
      ? categoryList.find(item => item.slug === cid)
      : categoryList.find(item => item.id === cid);
      
    if (!category || !category.dataConfig) return defaultConfig;
    
    let categoryConfig = typeof category.dataConfig === 'string' 
      ? null 
      : category.dataConfig;
    // 字符串配置需 JSON.parse，加 try/catch 防损坏 JSON 导致服务崩溃
    if (categoryConfig === null) {
      try {
        categoryConfig = JSON.parse(category.dataConfig);
      } catch (e) {
        logger.error('[Home._getCategoryConfig] JSON 解析失败:', e.message);
        categoryConfig = null;
      }
    }
    
    return categoryConfig && Object.keys(categoryConfig).length > 0 ? categoryConfig : defaultConfig;
  },

  /**
   * 聚合多个异步调用，返回 { key: result } 对象
   * @param {Object} apiCalls - { key: Promise } 对象
   * @returns {Promise<Object>} 聚合结果
   */
  async _aggregate(apiCalls) {
    const keys = Object.keys(apiCalls);
    const results = await Promise.all(Object.values(apiCalls));
    const resultObject = {};
    results.forEach((result, index) => {
      resultObject[keys[index]] = result;
    });
    return resultObject;
  },

  // 栏目自定义配置覆盖全局配置；无覆盖时返回默认 config
  _resolveConfig(defaultConfig, categoryList, cid) {
    const categoryConfig = this._getCategoryConfig(categoryList, cid);
    return categoryConfig && Object.keys(categoryConfig).length > 0 ? categoryConfig : defaultConfig;
  },

  // 首页：入参整体默认 {}，防止不传参报错
  async home(params = {}) {
    const { categoryList = [] } = params;
    // 首页固定标识为字符串 "home"
    const config = this._resolveConfig(getApp().config.data.home, categoryList, "home");
    return this._aggregate(getApiCalls(config, {}, common));
  },

  // 栏目列表页
  async list(params = {}) {
    const { cid, page = 1, categoryList = [], tagId = '', keyword = '' } = params;
    const config = this._resolveConfig(getApp().config.data.list, categoryList, cid);
    return this._aggregate(getApiCalls(config, { cid, page, tagId, keyword }, common));
  },

  // 文章详情页
  async article(params = {}) {
    const { id, cid, categoryList = [] } = params;
    const config = this._resolveConfig(getApp().config.data.article, categoryList, cid);
    return this._aggregate(getApiCalls(config, { id, cid }, common));
  },

  // 搜索页
  async search(params = {}) {
    const { keywords = "", page = 1, cid = 0, categoryList = [] } = params;
    const config = this._resolveConfig(getApp().config.data.search, categoryList, cid);
    // options 同时带 keywords/keyword：keyword 供个别搜索服务按名取参
    return this._aggregate(getApiCalls(config, { keywords, keyword: keywords, page, cid }, common));
  },

  // 标签页
  async tag(params = {}) {
    const { path, page = 1, cid = 0, categoryList = [] } = params;
    const config = this._resolveConfig(getApp().config.data.tags, categoryList, cid);
    return this._aggregate(getApiCalls(config, { path, page, cid }, common));
  },
};

export default home;
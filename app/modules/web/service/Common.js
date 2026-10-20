// 前台模板标签服务聚合入口（原 1700+ 行单文件已拆分至 common/ 目录）
// 契约铁律：方法名/签名/返回结构不可变更——模板标签引擎按方法名取函数引用调用
// 注意：消费方统一走本文件 default export 的 common 对象，请勿直接 import 分组文件
// 错误兜底说明：getApiCalls 对每个调用已有 catch + 日志 + null 兜底，此处不再包一层
import { site, category, getAllParentCategory, bannerSlide, friendLink, frag, fragForCategory, slidesForCategory } from "./common/site.js";
import { tag, getTagList, tags, fetchTagsByArticleId } from "./common/tag.js";
import {
  getArticleList,
  getArticleListByCid,
  getArticleListByCidWithFields,
  getArticleListByCidCate,
  getArticleListByCids,
  getArticleListByExtField,
  getArticlePvList,
  getNewImgList,
  list,
} from "./common/article-list.js";
import { article, prev, next, page, count } from "./common/article-detail.js";
import { search, query } from "./common/query.js";

const common = {
  site,
  category,
  getArticleList,
  getArticleListByCid,
  getArticleListByCidWithFields,
  getArticleListByCidCate,
  getAllParentCategory,
  getArticleListByCids,
  getArticleListByExtField,
  getArticlePvList,
  getNewImgList,
  list,
  getTagList,
  tags,
  fetchTagsByArticleId,
  bannerSlide,
  friendLink,
  frag,
  fragForCategory,
  slidesForCategory,
  tag,
  article,
  prev,
  next,
  page,
  count,
  search,
  query,
};

export default common;


import { htmlDecode } from "chanjs/utils/html.js";
import { treeById, filterFields, htmlEncode, pages, parsePage } from "chanjs/utils/index.js";
import { logger } from "chanjs";

/**
 * 按 slug / ID 匹配栏目，返回栏目完整数据与栏目 ID
 * 栏目匹配统一以 slug 为准：slug 优先匹配，并用 Number(id) 宽松匹配
 * （URL 参数为字符串、item.id 为数字，严格相等会失配）。
 * @param {string|number} py - 检索条件：slug 字符串 / 数字ID
 * @param {Array<Object>} source - 栏目数据源数组
 * @returns {{ cate: Object, id: string|number }}
 */
export function getChildrenId(py, source) {
  if (!Array.isArray(source)) {
    logger.warn("[getChildrenId] 数据源source不是数组", source);
    return { cate: {}, id: "" };
  }
  const num = Number(py);
  const cate =
    source.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.slug === py || (num && Number(item.id) === num))
    ) || {};
  return { cate, id: cate.id ?? "" };
}



/**
 * @description 根据导航栏目获取首页视图文件
 * @param {*} nav 导航栏目
 */
export const homeView = (nav) => {
  let view = "index.html";
  if (
    Array.isArray(nav) &&
    nav.length > 0 &&
    nav[0].slug == "home" &&
    nav[0].listView
  ) {
    const { type, listView, articleView } = nav[0];
    // type: 0-栏目(渲染列表模板) 1-页面(渲染内容模板)
    view = type == '0' ? listView : articleView;
  }
  return view;
};

/**
 * @description 获取列表页参数
 * @param {*} req
 * @returns {object}
 */
export const listGetParams = (req) => {
  const { template } = req.app.locals;
  const category = req.app.get("category");

  const { cate = "", cid } = req.params;
  const page = parsePage(req.params.current);
  const { tagId, keyword } = req.query;
  // 当前栏目和当前栏目下所有子导航
  const navSub = getChildrenId(cate || cid, category);
  const _cate = navSub?.cate || {};
  const id = cid || _cate.id;
  return { template, category, cate: _cate, cid: id, page, tagId, keyword };
};

/**
 * @description 列表页数据解析
 * @param {*} param0
 * @returns {object}
 */
export const listDataParse = ({ cid, category, cate, page, data, tagId = '', keyword = '' }) => {
  let id = cid || cate.id;
  let position = treeById(id, category).filter((item) => item); // 确保过滤掉可能的空值

  //当前位置（slug 供模板拼 URL；path 仅保留用于树形归属比较）
  const positionField = ["id", "name", "slug", "path", "type", "url"];
  position = filterFields(position, positionField);

  //文章数量
  const count = data?.articleList?.total || 0;
  const pageSize = data?.articleList?.pageSize || 10;

  // 分页
  let pageHtml = "";
  if (position.length > 0 && count > 0) {
    // 分页链接统一走 slug（URL 解析层按 slug 匹配栏目），path 仅作树形比较用
    const lastSlug = position[position.length - 1].slug || position[position.length - 1].path?.replace(/^\//, "");
    const href = `/${lastSlug}/index`;
    const queryParams = [];
    if (tagId) queryParams.push(`tag=${encodeURIComponent(tagId)}`);
    if (keyword) queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
    const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    pageHtml = pages(
      page,
      count,
      pageSize,
      href,
      query
    );

  }

  // 查找子栏目供列表页展示子分类导航（模板消费 cate.children）
  const children = category.filter((item) => item.pid === id);
  if (children.length > 0) {
    cate.children = children;
  }

  // 获取模板：优先栏目自定义 listView，无效模板名和空值统一回退到 list.html
  const legacyListViews = ["list-img.html", ""];
  let view = cate?.listView || "list.html";
  if (legacyListViews.includes(view)) view = "list.html";

  // 构造 page 对象供模板使用（与 search 页分页对象保持一致）
  const pageInfo = {
    total: count,
    current: +page || 1,
    pageSize,
    pages: Math.ceil(count / pageSize) || 0,
  };

  return { pageHtml, view, position, cate, page: pageInfo };
};

export const articleGetParams = (req) => {
  const { template } = req.app.locals;
  const category = req.app.get("category");
  let { id } = req.params;
  if (id.includes(".html")) {
    id = id.replace(".html", "");
  }
  return { id, template, category };
};

export const articleDataParse = ({ article, cid, category }) => {
  article.content = htmlDecode(article.content);
  // 当前栏目和当前栏目下所有子导航
  const navSub = getChildrenId(cid, category);
  let cate = navSub?.cate || {};
  // 当前位置
  const position = treeById(cid, category);
  // 获取模板：优先文章自定义 articleView，再栏目自定义 articleView，无效模板名和空值统一回退到 article.html
  const legacyArticleViews = [
    "article-book.html", "article-down.html", "article-img.html",
    "article-pdf.html", "article-pdf-new.html", "article-video.html", "download-section.html", ""
  ];
  let view = article.articleView || cate.articleView || "article.html";
  if (legacyArticleViews.includes(view)) view = "article.html";
  // 详情页禁用列表模板：内容模板误配成 *list.html 时文章会被渲染成栏目列表（表现为"点产品回到分类页"）
  if (/list[^/]*\.html$/i.test(view)) view = "article.html";
  return { article, cate, position, view };
};

export const searchParams = (req) => {
  const { template } = req.app.locals;
  const { keyword = "", page = 1, cid = 0, type = "" } = req.query;
  let key = keyword.slice(0, 10);
  const currentPage = +page;
  // cid：栏目过滤（0=全部）；type：结果类型（goods=商品），仅作为模板主区切换开关，不参与文章查询
  return { page: currentPage, template, keywords: key, cid: parseInt(cid, 10) || 0, type };
};

export const searchDataParse = ({ data, keywords, page, cid = 0, type = '' }) => {
  // 分页（common.search 返回 { total, current, pageSize, list }）
  const search = data.search || {};
  const count = search.total || 0;
  const list = search.list || [];
  const pageSize = search.pageSize || 10;
  const currentPage = +page || 1;
  const totalPages = Math.ceil(count / pageSize) || (count > 0 ? 1 : 0);
  const safeKeyword = encodeURIComponent(keywords);
  // 翻页保留分类过滤条件（cid/type），避免切页丢筛选
  const extraParams = [];
  if (cid) extraParams.push(`cid=${cid}`);
  if (type) extraParams.push(`type=${encodeURIComponent(type)}`);
  const extraQuery = extraParams.length ? `&${extraParams.join('&')}` : '';
  let href = `/search.html?keyword=${safeKeyword}${extraQuery}&page=`;

  let pageHtml = pages(currentPage, count, pageSize, href);

  // 高亮关键词：先 HTML 转义防止 XSS，再转义正则特殊字符防止注入
  const escapedKeyword = String(keywords || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightedKeyword = htmlEncode(String(keywords || ""));
  if (escapedKeyword) {
    list.forEach((ele) => {
      if (ele.title) {
        ele.titles = ele.title.replace(
          new RegExp(escapedKeyword, "gi"),
          `<span class='c-red'>${highlightedKeyword}</span>`
        );
      }
    });
  }

  // 构造 page 对象供模板使用（与 list 页分页对象保持一致）
  const pageInfo = {
    total: count,
    current: currentPage,
    pageSize,
    pages: totalPages,
  };

  return { list, pageHtml, page: pageInfo };
};

export const tagParams = (req) => {
  const { template } = req.app.locals;
  const { path, current = 1 } = req.params;
  const { tag } = req.query;
  const page = +current;
  return { page, template, path, tag };
};

export const tagDataParse = ({ data, page, tag, path }) => {
  // 分页（common.tags 返回 { total, current, pageSize, list }）
  const tags = data.tags || {};
  const count = tags.total || 0;
  const pageSize = tags.pageSize || 10;
  let href = `/tags/${path}/tag`;
  let query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  let pageHtml = pages(page, count, pageSize, href, query);
  return { pageHtml };
};

/**
 * 按完整路径段（拼音/ID）逐级解析栏目，支持多级分类，避免同拼音歧义
 * 例：/art3/doc/page.html → segments = ['art3','doc'] → 精确命中 id=8（文档），
 *     而不会误命中根级同拼音 id=10（书籍）
 * @param {string[]} segments 从根到叶的有序段，如 ['about','zuozhe']
 * @param {Array} source 栏目扁平列表
 * @returns {Object|null} { cate, id, position } 或 null（路径不存在）
 */
export const resolveCategoryPath = (segments = [], source = []) => {
  if (!Array.isArray(segments) || segments.length === 0 || !Array.isArray(source)) {
    return null;
  }
  const nodes = [];
  let pid = 0;
  for (const py of segments) {
    const node = source.find(
      (item) => item.pid === pid && (item.slug === py || String(item.id) === py)
    );
    if (!node) return null;
    nodes.push(node);
    pid = node.id;
  }
  const cate = nodes[nodes.length - 1];
  // position：从根到叶，模板面包屑需要 name / slug / path / type（区分单页 type=1 → page.html）
  const position = nodes.map((n) => ({ id: n.id, name: n.name, slug: n.slug, path: n.path, type: n.type, url: n.url }));
  return { cate, id: cate.id, position };
};

export const getApiCalls = (
  config = {}, //配置接口参数
  options = {}, //动态参数
  common // mysql通用查询方法
) => {
  let apiCalls = {};

  if (!common || typeof common !== 'object') {
    logger.error("getApiCalls: common is not a valid object");
    return apiCalls;
  }

  if (Object.keys(config).length === 0) {
    return apiCalls;
  }

  const { cid } = options;

  for (let key in config) {
    if (config[key].show === false) continue;

    const cfg = config[key];

    if (!cfg.method) {
      logger.warn(`getApiCalls: method is missing for key ${key}`);
      continue;
    }

    if (typeof common[cfg.method] !== 'function') {
      logger.warn(`Method ${cfg.method} not found in common module for key ${key}`);
      continue;
    }

    const apiMethod = common[cfg.method];

    let params = {
      ...options,
      ...(cfg.params || {}),
    };

    // 如果配置中没有指定cid，则默认使用当前栏目的cid
    if ((cfg.params === undefined || cfg.params.cid === undefined) && cid !== undefined) {
      params.cid = cid;
    }

    if (cfg.cid !== undefined) {
      if (cid === undefined || cfg.cid != cid) {
        continue;
      }
    }

    apiCalls[key] = apiMethod(params)
      .then((data) => {
        if (data === null || data === undefined) {
          return cfg.field ? {} : null;
        }
        if (cfg.field && Array.isArray(data)) {
          return filterFields(data, cfg.field);
        }
        if (cfg.field && typeof data === 'object') {
          return filterFields([data], cfg.field)[0] || data;
        }
        return data;
      })
      .catch((error) => {
        logger.error(`Error calling ${cfg.method} for key ${key}:`, error);
        return cfg.field ? {} : null;
      });
  }

  return apiCalls;
};

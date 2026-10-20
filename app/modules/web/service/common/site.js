// 站点/栏目/轮播/友链/碎片 相关服务（原 Common.js 拆分，方法契约保持不变）
// 错误日志由聚合入口 Common.js 的 withLog 统一记录，本文件不写 try/catch 样板
import { getApp } from "chanjs";

import { parseExtDataFields, mergeExtData, mergePageExtData } from "../../../../common/parseExtData.js";

import { parseAiGeo, replacePlaceholders } from "./helpers.js";

// 获取站点配置信息
export async function site() {
  const res = await getApp().db("cms_site")
    .select([
      "name",
      "logo",
      "domain",
      "email",
      "tel",
      "address",
      "icp",
      "copyright",
      "code",
      "status",
      "close_tips",
      "json",
      "title",
      "keywords",
      "description",
      "template",
      "uploadWay",
      "ext_data"
    ])
    .first();
  if (res) {
    mergeExtData(res);
    // domain 规范化：补协议、去尾斜杠，供模板 canonical（{{site.domain}}/...）与
    //    aigeo「{{栏目链接}}」占位符直接拼接；后台只填主机名（如 www.blince.cn）即可。
    //    未配置时保持空串，模板降级为相对地址，避免出现 https:/// 破损形态。
    if (res.domain) {
      let d = String(res.domain).trim().replace(/\/+$/, "");
      if (!/^https?:\/\//i.test(d)) d = "https://" + d;
      res.domain = d;
    }
  }
  return res || {};
}

// 获取所有分类列表，按orderBy升序排列
export async function category(params = {}) {
  // field=false 时栏目不返回 ext_data/page_ext_data（sys_config 模板数据 init.category.params.field 可配，默认 true）
  const { field = true } = params || {};
  const selectFields = [
    "id",
    "pid",
    "is_dir",
    "name",
    "slug",
    "path",
    "description",
    "orderBy",
    "target",
    "url",
    "status",
    "listView",
    "articleView",
    "seoTitle",
    "seoKeywords",
    "seoDescription",
    "type",
    "dataConfig",
    "mid",
    "page_mid",
    "aigeo",
    // 内容域（page/article/product/...）：前台商品模块按它定位商品根栏目、侧栏分类树，
    // 缺列会导致 rootCate 恒为 null → 模板 {{cate.name}} 抛 RuntimeError（HTTP 500）
    "content_type"
  ];
  if (field) {
    selectFields.push("ext_data", "page_ext_data");
  }
  const res = await getApp().db("cms_category")
    .select(selectFields)
    .orderBy("orderBy", "ASC");
  // 站点级 aigeo 兜底 + 站点域名（用于栏目链接占位符 {{栏目链接}}）
  // 同文件直调 site()：避免 this 依赖（模板标签引擎按方法名取函数引用调用，this 不可靠）
  const siteCfg = await site();
  // site() 的 ext_data 不提升顶层（mergeExtData 铁律），站点级 aigeo 必须从 ext_data 取
  const siteAigeo = (siteCfg && siteCfg.ext_data && siteCfg.ext_data.aigeo) || {};
  const siteDomain = (siteCfg && siteCfg.domain ? String(siteCfg.domain) : "").replace(/\/$/, "");

  // 栏目扩展字段保留在 ext_data/page_ext_data 子对象（不提升顶层，避免与主表字段同名冲突；field=false 时未查询 ext_data，跳过）
  if (res && res.length) {
    res.forEach((row) => {
      const colAigeoRaw = row.aigeo; // 专用列，先于 mergeExtData 取出，避免被 ext_data.aigeo 覆盖
      if (field) {
        mergeExtData(row);
        // 栏目页面扩展字段（page_ext_data）同样保留子对象，与内容扩展字段共存
        mergePageExtData(row);
      }
      // AIGEO 取值口径：整体二选一（栏目整份优先，否则站点整份），禁止字段级合并
      const parsedCol = parseAiGeo(colAigeoRaw);
      const hasCol =
        parsedCol && typeof parsedCol === "object" && Object.keys(parsedCol).length > 0;
      if (hasCol) {
        row.aigeo = replacePlaceholders(parsedCol, {
          "{{栏目名称}}": row.name || "",
          "{{栏目链接}}": siteDomain + (row.path || ""),
        });
      } else {
        // 站点垫底：浅拷贝隔离各行引用，避免下游改动相互污染
        row.aigeo =
          siteAigeo && Object.keys(siteAigeo).length ? { ...siteAigeo } : undefined;
      }
      // SEO：与 AIGEO 同口径「整体二选一」——任一 seo 字段非空视为已配置，整份取栏目；
      // 全空才整份垫底站点。hasSeo 供详情页模板区分 title 兜底（内容标题 - 站点名）。
      // 禁止字段级合并；注意栏目 SEO 列是 seoTitle/seoKeywords/seoDescription（无 title 列）
      const hasSeo = [row.seoTitle, row.seoKeywords, row.seoDescription].some(
        v => v != null && String(v).trim() !== ""
      );
      row.hasSeo = hasSeo;
      row.seo = hasSeo
        ? {
            title: row.seoTitle,
            keywords: row.seoKeywords,
            description: row.seoDescription,
          }
        : {
            title: siteCfg.title || siteCfg.name || "",
            keywords: siteCfg.keywords || "",
            description: siteCfg.description || "",
          };
    });
  }
  return res || [];
}

/**
 * 获取所有父级分类列表
 * @param {number[]} idArray - 分类ID数组，可选。传入则只返回指定ID的分类
 * @returns {Promise<Object[]>} 父级分类列表数组，按orderBy升序排列
 */
export async function getAllParentCategory(idArray = []) {
  const result = await getApp().db("cms_category")
    .select([
      "id",
      "pid",
      "name",
      "slug",
      "path",
      "orderBy",
      "target",
      "status",
      "type",
    ])
    .where("pid", 0)
    .where("type", 0)
    .where((builder) => !idArray.length || builder.whereIn("id", idArray))
    .orderBy("orderBy", "ASC");
  return result;
}

/**
 * 获取轮播图列表
 * @param {Object} options - 查询选项
 * @param {number} options.page - 当前页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为10，最大100
 * @returns {Promise<Object[]>} 轮播图列表数组，包含id、title、imgUrl、linkUrl、content字段
 */
export async function bannerSlide({ page = 1, pageSize = 10, mid = null }) {
  const offset = parseInt((page - 1) * pageSize);
  let query = getApp().db.select(["id", "title", "imgUrl", "linkUrl", "content", "mid", "ext_data"])
    .from("cms_slide");
  // 按模型（mid）过滤：同一张轮播表可承载多个位置的轮播（如 slide_home / slide_about）
  if (mid) query = query.where("mid", mid);
  // 全局轮播 = 未绑定栏目（cid IS NULL）；绑定栏目的由 slidesForCategory 按需注入
  query = query.whereNull("cid");
  const list = await query
    .where("status", 0)
    .limit(Math.min(pageSize, 100))
    .offset(offset)
    .orderBy("sort", "asc")
    .orderBy("id", "asc");
  // 将轮播扩展字段（ext_data JSON）扁平化到顶层，模板可直接 {{slide.xxx}} 访问
  list.forEach(mergeExtData);
  return list;
}

/**
 * 栏目绑定的轮播（含自身及祖先的绑定，子孙可见），排在全局轮播之前，按 id 去重
 * @param {Object} options
 * @param {number[]} options.categoryIds - 当前栏目及祖先 id 集合（categoryBind 注入）
 * @param {number} options.pageSize
 * @returns {Promise<Object[]|null>} null = 无绑定轮播，调用方沿用全局
 */
export async function slidesForCategory({ categoryIds = [], pageSize = 20 }) {
  const ids = (categoryIds || []).filter(Boolean);
  if (!ids.length) return null;
  const db = getApp().db;
  const bound = await db.select(["id", "title", "imgUrl", "linkUrl", "content", "mid", "ext_data"])
    .from("cms_slide")
    .whereIn("cid", ids)
    .where("status", 0)
    .limit(Math.min(pageSize, 100))
    .orderBy("sort", "asc")
    .orderBy("id", "asc");
  if (!bound.length) return null;
  bound.forEach(mergeExtData);
  const seen = new Set(bound.map((s) => Number(s.id)));
  const global = await bannerSlide({ pageSize });
  return [...bound, ...global.filter((s) => !seen.has(Number(s.id)))];
}

/**
 * 获取友情链接列表
 * @param {Object} options - 查询选项
 * @param {number} options.pageSize - 返回数量，默认为10，最大100
 * @returns {Promise<Object[]>} 友情链接列表数组，包含title、link字段
 */
export async function friendLink({ pageSize = 10 }) {
  pageSize = Math.min(parseInt(pageSize, 10) || 10, 100);

  const list = await getApp().db("cms_friendlink")
    .select("title", "link", "logo", "mid", "ext_data")
    .orderBy("orderBy", "desc")
    .orderBy("id", "desc")
    .limit(pageSize);
  // 将友链扩展字段（ext_data JSON）扁平化到顶层，模板可直接 {{link.xxx}} 访问
  list.forEach(mergeExtData);
  return list;
}

/**
 * 获取碎片内容列表，转换为以mark为key的对象
 * @param {Object} options - 查询选项
 * @param {number} options.pageSize - 返回数量，默认为10，最大100
 * @returns {Promise<Object>} 以mark为key的对象，value为 { content, mid, ext_data }
 */
export async function frag({ pageSize = 10 }) {
  pageSize = Math.min(parseInt(pageSize, 10) || 10, 100);

  // 全局碎片 = 未绑定栏目（cid IS NULL）；绑定栏目的由 fragForCategory 按需注入
  const list = await getApp().db.select(["id", "name", "mark", "content", "mid", "ext_data"])
    .from("cms_frag")
    .whereNull("cid")
    .limit(pageSize)
    .orderBy("id", "desc");

  // 返回结构化：{ mark: { content, mid, ext_data } }
  // 后台/模板用法：
  //   {{fragData.mark.mid}}          取模型id
  //   {{fragData.mark.字段名}}        取扩展字段（走模型后的动态字段）
  // 消费端（init.js / 模板）只使用本结构化结果，不支持旧式 { mark: content } 字符串映射
  const fragData = {};
  list.forEach((r) => {
    fragData[r.mark] = {
      content: r.content,
      mid: r.mid ?? null,
      ext_data: parseExtDataFields(r.ext_data),
    };
  });

  return fragData;
}

/**
 * 栏目绑定的碎片（绑定栏目自身及其子孙均可见，调用方传祖先链），覆盖全局同 mark
 * @param {Object} options
 * @param {number[]} options.categoryIds - 当前栏目及祖先 id 集合（categoryBind 注入）
 * @param {number} options.pageSize
 * @returns {Promise<Object|null>} null = 无绑定碎片，调用方沿用全局
 */
export async function fragForCategory({ categoryIds = [], pageSize = 50 }) {
  const ids = (categoryIds || []).filter(Boolean);
  if (!ids.length) return null;
  const db = getApp().db;
  const bound = await db.select(["mark", "content", "mid", "ext_data"])
    .from("cms_frag")
    .whereIn("cid", ids)
    .limit(Math.min(pageSize, 100));
  if (!bound.length) return null;
  // 以全局碎片为底，绑定覆盖同 mark（栏目级优先）
  const merged = { ...((await frag({ pageSize })) || {}) };
  bound.forEach((r) => {
    merged[r.mark] = {
      content: r.content,
      mid: r.mid ?? null,
      ext_data: parseExtDataFields(r.ext_data),
    };
  });
  return merged;
}

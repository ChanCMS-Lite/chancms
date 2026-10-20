// 文章详情类服务（原 Common.js 拆分，方法契约保持不变）
// 错误日志由聚合入口 Common.js 的 withLog 统一记录，本文件不写 try/catch 样板
import { getApp, logger } from "chanjs";

import { parseExtDataFields, mergeExtData } from "../../../../common/parseExtData.js";

import { parseAiGeo, adjacentArticle, fetchRelationInfoMap } from "./helpers.js";

/**
 * 根据文章ID获取文章详情，包含扩展字段（字段提到外层）
 * @param {number} id - 文章ID
 * @returns {Promise<Object|false>} 文章详情对象，扩展字段提到外层，失败返回false
 */
export async function article(id) {
  if (!id) return false;

  const data = await getApp().db("cms_article as a")
    .select("a.*", "u.username as publisher")
    .leftJoin("sys_user as u", "a.user_id", "u.id")
    .where("a.id", "=", id)
    .first();

  if (!data || !data.cid) {
    return false;
  }

  // ext_data 解析统一走 mergeExtData（string→parse→字段级 JSON→回填 data.ext_data）
  let extData = {};
  if (data.ext_data) {
    mergeExtData(data);
    extData = data.ext_data;
  } else if (data.code) {
    // 向后兼容旧数据：无 ext_data 时回退 code 列
    try {
      extData = typeof data.code === 'string' ? JSON.parse(data.code) : data.code;
    } catch (e) {
      logger.error('[article] code 解析失败:', e.message);
      extData = {};
    }
  }

  // 自动解析其中的 JSON 字符串字段（ext_data 分支 mergeExtData 内已处理，此处幂等兜底 code 分支）
  extData = parseExtDataFields(extData);

  // 关联字段（recommend_goods / recommend_article）只存了 article_id 快照，
  // 详情页渲染需要缩略图(img)/描述(description)/栏目路径(path)，这里批量补全
  extData = await _enrichRelationArticles(extData);

  // 万能模型关联字段（relativeProduct / hezuocase / recommend 等）同理补全
  extData = await _enrichModelRelations(extData, data.mid);

  // AIGEO：详情页/单页直接取内容自身 ext_data.aigeo（配啥输出啥，不合并栏目/站点兜底）。
  // 结果挂到 data.aigeo，模板直接 {{article.aigeo}} 消费；单页 page() 复用 article() 自动继承。
  const articleAigeo = parseAiGeo(extData.aigeo);
  delete extData.aigeo;
  // aigeo 即 JSON-LD 内容（顶层 Schema 键 + summary/category 等自定义键），空对象不挂，模板 {{if aigeo}} 跳过
  data.aigeo = articleAigeo && Object.keys(articleAigeo).length ? articleAigeo : undefined;

  // 自定义扩展字段保留在 ext_data 子对象（不提升到顶层，避免与主表字段同名冲突），模板多取一层 {{article.ext_data.xxx}}
  data.ext_data = extData;
  return data;
}

/**
 * _enrichRelationArticles / _enrichModelRelations 共享实现：
 * 按 article_id 集合批量查文章表，回填关联卡片的 img/description/path。
 * withMeta=true 时额外回填 title/created_at（万能模型关联需要）；纯引用解析，不新增字段、不冗余存储。
 * @param {Object} extData - 已解析的扩展字段对象
 * @param {string[]} relationKeys - 需要补全的关联字段名
 * @param {boolean} withMeta - 是否回填 title/created_at
 * @returns {Promise<Object>} 补全后的 extData
 */
async function enrichRelations(extData, relationKeys, withMeta) {
  // 收集所有关联字段里的 article_id
  const idSet = new Set();
  relationKeys.forEach((key) => {
    const arr = extData[key];
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      const aid = Number(item && item.article_id);
      if (aid) idSet.add(aid);
    });
  });
  if (idSet.size === 0) return extData;

  const infoMap = await fetchRelationInfoMap(idSet);

  relationKeys.forEach((key) => {
    if (!Array.isArray(extData[key])) return;
    extData[key] = extData[key].map((item) => {
      const aid = Number(item && item.article_id);
      const info = infoMap.get(aid) || {};
      const row = {
        ...item,
        id: aid, // 供模板 {{$value.id}} 与链接 /{{path}}/article-{{id}}.html 使用
        img: info.img || item.img || "",
        description: info.description || item.description || "",
        path: info.path || item.path || "",
      };
      if (withMeta) {
        row.title = info.title || item.title || "";
        row.created_at = info.created_at || item.created_at || "";
      }
      return row;
    });
  });

  return extData;
}

/**
 * 关联字段（recommend_goods / recommend_article）在模型里只存了 article_id 快照，
 * 详情页渲染关联卡片时按 article_id 批量查文章表补全，避免前端拿到只有 ID 的关联数据。
 * @param {Object} extData - 已解析的扩展字段对象
 * @returns {Promise<Object>} 补全后的 extData
 */
async function _enrichRelationArticles(extData) {
  if (!extData || typeof extData !== "object") return extData;
  return enrichRelations(extData, ["recommend_goods", "recommend_article"], false);
}

/**
 * 解析文章「万能模型」里的关联类型字段（如 relativeProduct / hezuocase / recommend）。
 * 这些字段在 ext_data 中只存了 [{article_id,title,category_name}] 快照，按文章模型的
 * relation 字段配置批量查一次文章表补全，与 _enrichRelationArticles 同源。
 * @param {Object} extData - 已解析的扩展字段对象
 * @param {number} mid - 文章所属模型 id
 * @returns {Promise<Object>} 补全后的 extData
 */
async function _enrichModelRelations(extData, mid) {
  if (!extData || typeof extData !== "object" || !mid) return extData;

  // 取该模型下所有 relation 类型字段名
  const relFields = await getApp()
    .db("cms_field")
    .select("field_name")
    .where("mid", mid)
    .where("type", "relation");
  if (!relFields || !relFields.length) return extData;

  const relationKeys = relFields
    .map((f) => f.field_name)
    .filter((k) => Array.isArray(extData[k]) && extData[k].length);
  if (!relationKeys.length) return extData;

  return enrichRelations(extData, relationKeys, true);
}

/**
 * 获取当前文章的上一篇
 * @param {Object} options - 查询选项
 * @param {number} options.id - 当前文章ID，必填
 * @param {number} options.cid - 分类ID，必填
 * @returns {Promise<Object|null>} 上一篇文章对象，包含id、title、name、path字段，无则返回null
 */
export async function prev({ id, cid }) {
  if (!id || !cid) return null;
  return adjacentArticle(id, cid, "<", "desc");
}

/**
 * 获取当前文章的下一篇
 * @param {Object} options - 查询选项
 * @param {number} options.id - 当前文章ID，必填
 * @param {number} options.cid - 分类ID，必填
 * @returns {Promise<Object|null>} 下一篇文章对象，包含id、title、name、path字段，无则返回null
 */
export async function next({ id, cid }) {
  if (!id || !cid) return null;
  return adjacentArticle(id, cid, ">", "asc");
}

/**
 * 获取单页内容（type=1 页面栏目专用，与文章详情 article() 分离）
 * - 支持指定 id 取某一篇，或不传 id 取栏目下首篇（按 id 升序）
 * - 仅返回当前栏目及其子栏目下的单页文章，避免跨栏目/同拼音误取
 * @param {Object} options
 * @param {number} options.cid - 单页栏目ID（必填）
 * @param {number} [options.id] - 指定文章ID（可选）
 * @param {number} [options.pageSize=20] - 侧栏列表数量
 * @returns {Promise<{article:Object|null, list:Array}>}
 */
export async function page({ cid, id, pageSize = 20 }) {
  if (!cid) return { article: null, list: [], children: [] };

  // 侧栏列表：仅当前栏目的单页文章（不含子栏目）
  // —— 子栏目由下方 children 以「章节目录」形式单独展示，避免父子内容在侧栏重复
  const list = await getApp().db("cms_article as a")
    .leftJoin("cms_category as c", "a.cid", "c.id")
    .where("a.cid", cid)
    .andWhere("a.status", 0)
    .orderBy("a.id", "ASC")
    .limit(pageSize)
    .select(
      "a.id as id",
      "a.title as title",
      "a.description as description",
      "a.img as img",
      "a.ext_data as ext_data",
      "c.slug as slug",
      "c.path as path",
      "c.name as name"
    );
  // 单页列表项扩展字段扁平化到顶层（如招聘职位的 duty/number/salary/location/education），模板可直接 {{item.xxx}}
  list.forEach(mergeExtData);

  // 章节目录：当前栏目的直属子栏目（单页 type=1），用于父级页面侧栏导航
  // 对齐 book 章节列表体验：父级单页列出其子栏目，点击进入对应子页
  const children = await getApp().db("cms_category")
    .where("pid", cid)
    .where("type", "1")
    .orderBy("orderBy", "ASC")
    .orderBy("id", "ASC")
    .select("id", "name", "slug", "path", "type", "articleView", "url", "target");

  // 解析目标单页文章（同文件直调 article()：消除 this 依赖；局部变量用 pageArticle 避免遮蔽函数名）
  let pageArticle = null;
  if (id) {
    // 仅允许访问本栏目下的文章，防止跨栏目/越权访问
    const hit = list.find((x) => x.id === Number(id));
    if (hit) {
      pageArticle = await article(id);
    }
  } else if (list.length > 0) {
    // 未指定 id：取首篇作为默认单页
    pageArticle = await article(list[0].id);
  }

  return { article: pageArticle, list, children };
}

/**
 * 增加文章浏览量
 * @param {Object} options - 查询选项
 * @param {number} options.id - 文章ID，必填
 * @returns {Promise<number|null>} 返回受影响的行数，失败返回null
 */
export async function count({ id }) {
  if (!id) return null;
  return getApp().db("cms_article").where("id", id).increment("pv", 1);
}

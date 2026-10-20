import { parsePage, parsePageSize } from "chanjs/utils/index.js";
import { Repository, logger } from "chanjs";
import dayjs from "dayjs";
import { filterImgFromStr } from "chanjs/utils/html.js";
import { parseExtDataFields } from "../../../common/parseExtData.js";
import { parseTagIds } from "../../../common/tag-utils.js";
import { categoryIdsWithChildren } from "../../../common/category-scope.js";
import { ARTICLE_STORAGE_TYPES } from "../../../common/content-types.js";
import { cleanEmptyFields } from "../../../common/model-utils.js";
import { formatDateFields } from "chanjs/utils/index.js";
import { deleteLocalImages } from "../common/delete-local-images.js";
import { sanitizeRichText } from "../../../common/sanitize.js";


/**
 * 标签数据模型说明（双轨设计，勿误删）
 * ---------------------------------------------------------------------------
 * 1. cms_article.tagId        varchar  逗号分隔的标签 ID 列表（兼容旧 web 端 service/common.js）
 *    - 用途：web 前台直接 SELECT tagId 后批量查询 cms_tag，避免 JOIN
 *    - 维护：create/update 时由前端传入，本 service 原样写入
 *
 * 2. cms_articletag           关联表   (aid, tid) 多对多关系
 *    - 用途：cms 后台逻辑通过关联表维护，支持事务、计数、删除级联
 *    - 维护：本 service 的 TagService 负责 insert/delete/updateTagCounts
 *
 * 两套数据在文章 create/update 时同步写入，删除时同步清理
 * code 字段（ext_data 扩展）与 tagId 用途不同，请勿混淆
 * ---------------------------------------------------------------------------
 */

// 标签 Service
class TagService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 批量插入标签关联
   */
  async insertTagMappings(articleId, tagIds, trx) {
    if (!tagIds.length) return;
    
    const mappings = tagIds.map(tid => ({ aid: articleId, tid }));
    await trx("cms_articletag").insert(mappings);
  }

  /**
   * 更新标签计数
   */
  async updateTagCounts(oldTagIds, newTagIds, trx) {
    const db = trx || this.db;
    
    const toIncrement = newTagIds.filter(id => !oldTagIds.includes(id));
    const toDecrement = oldTagIds.filter(id => !newTagIds.includes(id));
    
    if (toIncrement.length > 0) {
      await db("cms_tag").whereIn("id", toIncrement).increment("count", 1);
    }
    
    if (toDecrement.length > 0) {
      await db("cms_tag").whereIn("id", toDecrement).where("count", ">", 0).decrement("count", 1);
    }
  }

  /**
   * 更新标签计数（+1）
   */
  async incrementTagCounts(tagIds, trx) {
    if (!tagIds.length) return;
    
    await trx("cms_tag")
      .whereIn("id", tagIds)
      .increment("count", 1);
  }

  /**
   * 更新标签计数（-1）
   */
  async decrementTagCounts(tagIds, trx) {
    if (!tagIds.length) return;
    
    await trx("cms_tag")
      .whereIn("id", tagIds)
      .where("count", ">", 0)
      .decrement("count", 1);
  }

  /**
   * 删除标签映射
   */
  async deleteTagMappings(articleIds, trx) {
    await trx("cms_articletag")
      .whereIn("aid", articleIds)
      .del();
  }
}

// 图片 Service（db 由 ArticleService 通过 DI 注入）
class ImageService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 批量获取文章图片
   */
  async getImagesByArticleIds(articleIds, trx = null) {
    const db = trx || this.db;
    const articles = await db("cms_article")
      .select("id", "img", "content")
      .whereIn("id", articleIds);

    const allImages = [];
    for (const article of articles) {
      if (article.img) {
        allImages.push(article.img);
      }
      if (article.content) {
        const contentImages = filterImgFromStr(article.content);
        allImages.push(...contentImages);
      }
    }
    
    return allImages;
  }
}

class ArticleService extends Repository {
  constructor() {
    super("cms_article");
    this.tagService = new TagService(this.db);
    // 通过 DI 把 this.db 注入 ImageService（无需 import Chan）
    this.imageService = new ImageService(this.db);
  }

  // 增：创建文章（含事务、扩展字段、标签关联）
  async create(body) {
    const { defaultParams, extData, ext_data } = body;
    // 前端统一以 ext_data（下划线）传扩展字段，与 update 保持一致；兼容旧驼峰写法
    const finalExtData = ext_data || extData;

    // 过滤掉 undefined/null/空数组/空字符串字段
    const cleanParams = cleanEmptyFields(defaultParams);

    // 类型隔离（配置见 content-types.js）：商品/专题/书籍有独立表，挂进去即成孤儿，拦截
    const blocked = await this._assertStorableCid(cleanParams.cid);
    if (blocked) return blocked;

    try {
      return await this.db.transaction(async (trx) => {
        const { updated_at, tagId, ...paramsToInsert } = cleanParams;
        const formattedParams = formatDateFields(paramsToInsert);
        // created_at 用 dayjs 格式化为 MySQL 兼容格式（前端传的是含 Z 的 ISO 串，MySQL DATETIME 不认）
        formattedParams.created_at = formattedParams.created_at
          ? dayjs(formattedParams.created_at).format("YYYY-MM-DD HH:mm:ss")
          : dayjs().format("YYYY-MM-DD HH:mm:ss");
        // updated_at 不传，由数据库 DEFAULT CURRENT_TIMESTAMP 自动写入

        // NOT NULL 兜底：title/content 库列为 NOT NULL 无 DEFAULT，cleanEmptyFields 会把空串滤掉，此处补空串防 DB 报错
        if (formattedParams.title === undefined || formattedParams.title === null) formattedParams.title = "";
        if (formattedParams.content === undefined || formattedParams.content === null) formattedParams.content = "";
        // 存储型 XSS 过滤：正文为用户可控富文本，入库前过宽白名单（保留编辑器排版，拦 on* 事件）
        if (formattedParams.content) formattedParams.content = sanitizeRichText(formattedParams.content);

        // 扩展字段存入 ext_data JSON 字段
        if (finalExtData && Object.keys(finalExtData).length > 0) {
          formattedParams.ext_data = JSON.stringify(finalExtData);
        }

        const insertResult = await trx(this.tableName).insert(formattedParams);
        const id = insertResult[0];
        if (!id) throw new Error("Failed to insert article");

        // 更新扩展字段索引
        if (finalExtData && defaultParams.cid) {
          await this._updateExtIndex(trx, id, defaultParams.cid, finalExtData);
        }

        // 处理标签（统一走 TagService）
        if (tagId) {
          const tagIds = parseTagIds(tagId);
          if (tagIds.length > 0) {
            await this.tagService.insertTagMappings(id, tagIds, trx);
            await this.tagService.incrementTagCounts(tagIds, trx);
          }
        }

        return { success: true, data: { id } };
      });
    } catch (err) {
      logger.error("[ArticleService.create] 失败:", err.message);
      throw err;
    }
  }

  // 删：删除文章（含图片、标签）
  async delete(id) {
    // 校验并转换 ID 数组
    const ids = String(id).split(",").map(Number).filter(Boolean);
    if (ids.length === 0) return { success: false, msg: "参数无效" };

    try {
      const result = await this.db.transaction(async (trx) => {
        // 1. 从关联表批量查询文章的标签 ID（不再读 cms_article.tagId 字段）
        const tagMappings = await trx("cms_articletag")
          .whereIn("aid", ids)
          .select("tid");
        const tagIds = [...new Set(tagMappings.map(t => t.tid))];

        // 1.1 先收集待删图片路径（必须在删行之前查询，同事务内 SELECT 看不到已删行，
        //     否则图片路径永远为空、成为孤儿文件——与 ProductService.delete 顺序保持一致）
        const imagePaths = await this.imageService.getImagesByArticleIds(ids, trx);

        // 2. 并行删除所有数据
        await Promise.all([
          trx(this.tableName).whereIn("id", ids).del(),
          this.tagService.deleteTagMappings(ids, trx),
          trx("cms_article_ext_index").whereIn("article_id", ids).del()
        ]);

        // 3. 更新标签计数
        if (tagIds.length > 0) {
          await this.tagService.decrementTagCounts(tagIds, trx);
        }

        return { success: true, data: { affectedRows: ids.length }, _imagePaths: imagePaths };
      });

      // 事务提交成功后同步删除图片，回滚时不删
      // Lite 精简版仅本地上传：直接清理本地图片文件（deleteLocalImages 内部已路径校验 + try/catch，失败仅 log 不阻塞删除）
      if (result._imagePaths && result._imagePaths.length > 0) {
        const imagePaths = result._imagePaths;
        delete result._imagePaths;
        try {
          deleteLocalImages(imagePaths);
        } catch (e) {
          logger.error("[ArticleService.delete] 清理图片失败(不阻塞删除):", e?.message);
        }
      }

      return result;
    } catch (err) {
      logger.error("[ArticleService.delete] 删除失败:", err.message);
      throw err;
    }
  }

  // 改：更新文章（含事务、扩展字段、标签关联）
  async update(body) {
    const { id, ext_data, oldTagId, user_id, ...updateData } = body;

    // 过滤掉 undefined/null/空数组/空字符串字段
    const cleanUpdateData = cleanEmptyFields(updateData);

    // 类型隔离：同 create 口径
    const blocked = await this._assertStorableCid(cleanUpdateData.cid);
    if (blocked) return blocked;

    try {
      return await this.db.transaction(async (trx) => {
        const articleExists = await trx(this.tableName).where("id", id).first();

        if (!articleExists) {
          return { success: false, msg: "文章不存在" };
        }

        // 扩展字段更新到 ext_data JSON 字段
        // updated_at 不传，由数据库 ON UPDATE CURRENT_TIMESTAMP 自动刷新；
        // created_at 允许后台手动修改发布时间（前端"发布时间"字段绑定），传值时格式化为 MySQL DATETIME
        const { updated_at, tagId, ...dataToUpdate } = cleanUpdateData;
        const formattedData = formatDateFields(dataToUpdate);
        if (formattedData.created_at) {
          formattedData.created_at = dayjs(formattedData.created_at).format("YYYY-MM-DD HH:mm:ss");
        }
        // 存储型 XSS 过滤：更新时正文同样过宽白名单（content 在 payload 中才处理）
        if (formattedData.content != null) formattedData.content = sanitizeRichText(formattedData.content);

        if (ext_data && Object.keys(ext_data).length > 0) {
          formattedData.ext_data = JSON.stringify(ext_data);
        }

        if (user_id && !articleExists.user_id) {
          formattedData.user_id = user_id;
        }

        // 处理标签（tagId 不再写入 cms_article，仅维护关联表）
        const oldTagIds = parseTagIds(oldTagId);
        const newTagIds = parseTagIds(tagId);

        await trx("cms_articletag").where("aid", id).del();

        if (newTagIds.length > 0) {
          await this.tagService.insertTagMappings(id, newTagIds, trx);
        }

        await this.tagService.updateTagCounts(oldTagIds, newTagIds, trx);

        // 更新文章
        await trx(this.tableName).where("id", id).update(formattedData);

        // 更新扩展字段索引
        if (ext_data && articleExists.cid) {
          await this._updateExtIndex(trx, id, articleExists.cid, ext_data);
        }

        return { success: true, data: { affectedRows: 1 } };
      });
    } catch (err) {
      logger.error("[ArticleService.update] 更新失败:", err.message);
      throw err;
    }
  }

  /**
   * 栏目域校验：cid 属于 ARTICLE_STORAGE_TYPES 之外（商品/专题/书籍域）时返回 1006 拦截块，
   * 否则返回 null。create/update 共用，单一口径。
   * @param {number} cid - 目标栏目 id
   * @returns {{success:boolean, code:number, msg:string}|null}
   */
  async _assertStorableCid(cid) {
    if (!cid) return null;
    const cat = await this.db("cms_category").where("id", cid).select("content_type").first();
    return cat && !ARTICLE_STORAGE_TYPES.includes(cat?.content_type)
      ? { success: false, code: 1006, msg: "该栏目不属于文章/单页域，内容不能挂到商品/专题/书籍栏目下" }
      : null;
  }

  // 查：文章列表（支持分页和栏目筛选）
  async list(page = 1, pageSize = 10, cid) {
    page = parsePage(page);
    const limit = parsePageSize(pageSize);
    const offset = (page - 1) * limit;

    // 解析 cid 为 ids 数组（count 和 list 复用同一条件，保证一致）
    const ids = cid
      ? (Array.isArray(cid) ? cid : [cid].flat().map(Number).filter(Boolean))
      : [];
    const applyCid = (qb) => {
      if (ids.length > 0) qb.whereIn("cid", ids);
    };

    // count 与 list 并行执行（两个独立 builder，安全并行）
    const [totalResult, list] = await Promise.all([
      this.db(this.tableName).modify(applyCid).count("* as count").first(),
      this.db(this.tableName)
        .select(["id", "title", "attr", "pv", "created_at", "status"])
        .modify(applyCid)
        .orderBy("id", "desc")
        .offset(offset)
        .limit(limit),
    ]);

    const count = parseInt(totalResult?.count || 0, 10);
    const formattedList = formatDateFields(list, ['created_at', 'updated_at', 'publishTime', 'startTime', 'endTime']);
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        current: page,
        pageSize: limit,
        totalPages: totalPages,
        list: formattedList,
      },
    };
  }

  // 查：文章详情
  async detail(id) {
    const data = await this.db(this.tableName).where("id", id).first();

    if (!data || !data.cid) {
      return { success: false, msg: "文章不存在" };
    }

    let extData = {};

    // 从 ext_data JSON 字段读取扩展数据
    if (data.ext_data) {
      try {
        extData = typeof data.ext_data === 'string' ? JSON.parse(data.ext_data) : data.ext_data;
      } catch (e) {
        logger.error('[ArticleService.detail] JSON 解析失败:', e.message);
        extData = {};
      }
    }

    // 自动解析 ext_data 中的 JSON 字符串字段（如 pics、downloadLinks 等）
    extData = parseExtDataFields(extData);

    const formattedData = formatDateFields(data, ['created_at', 'updated_at', 'publishTime', 'startTime', 'endTime']);
    const formattedExtData = formatDateFields(extData, ['created_at', 'updated_at', 'publishTime', 'startTime', 'endTime']);

    // 用解析后的 ext_data 覆盖原始的 JSON 字符串
    return { success: true, data: { ...formattedData, ext_data: formattedExtData } };
  }

  // 搜索文章（标题 + 栏目 + ID）
  // 关键词匹配统一用 LIKE（PG 用 ILIKE 保大小写不敏感）：
  // ft_title 全文索引未带 ngram 分词器，MATCH 搜中文/英文前缀会落空；且 FULLTEXT 是硬依赖，
  // 索引缺失时 MATCH 直接抛 500。文章表量级小、后台搜索低频，LIKE 全表扫描开销可忽略。
  async search(key = "", page = 1, pageSize = 10, cid = 0, id, contentTypes) {
    // 关键词只做 trim + 截断 10 字符：
    // - SQL 注入由 knex 参数化绑定（? 占位符）拦住，与关键词内容无关，无需转义；
    // - 不做 %/_ 通配符转义，代价仅是管理员输入 % 或 _ 时命中范围变大（最坏全表），
    //   后台低频 + 结果有分页，可接受；换来更直白的实现
    const keyword = key.trim().slice(0, 10);
    page = parsePage(page);
    const limit = parsePageSize(pageSize);
    const offset = (page - 1) * limit;

    // id 优先：ID 是唯一键，传了 id 就无视关键词与栏目过滤。
    // 否则「选中产品中心再按 ID 搜一篇新闻」会因 cid 不满足而返回空
    const byId = Number(id) || 0;

    // 栏目过滤：选中栏目需覆盖其全部子孙栏目（与前台列表行为一致），
    // 否则选「产品中心」这类只有子栏目挂文章的父级时会永远返回空
    const cidIds = !byId && cid ? await categoryIdsWithChildren(this.db, cid) : [];

    // 抽取公共查询条件构建器，保证 count/list 条件一致
    const buildQuery = () => {
      // 后台搜索返回全部状态（含草稿/未发布），与 list() 行为保持一致；
      // 该接口受 auth() 保护，非公开接口，无需硬编码 status=0
      let q = this.db("cms_article as a")
        .leftJoin("cms_category as c", "a.cid", "c.id");
      if (byId) {
        q = q.andWhere("a.id", byId);
      } else {
        if (keyword) {
          // knex raw 参数必须传数组，传字符串会被当作表名
          const isPg = (process.env.DB_TYPE || "mysql").toLowerCase() === "pg";
          const pattern = `%${keyword}%`;
          q = q.andWhereRaw(`a.title ${isPg ? "ILIKE" : "LIKE"} ?`, [pattern]);
        }
        if (cidIds.length) {
          q = q.whereIn("c.id", cidIds);
        }
        // 按内容域过滤：后台各模块传自己消费的域（article/image/video、page、product…），
        // 域之间互不可见。真相源见 app/common/content-types.js
        if (Array.isArray(contentTypes) && contentTypes.length) {
          q = q.whereIn("c.content_type", contentTypes);
        }
      }
      return q;
    };

    // count 与 list 并行执行（buildQuery 每次返回新 builder，安全并行）
    const [totalResult, list] = await Promise.all([
      buildQuery().count("a.id", { as: "count" }).first(),
      buildQuery()
        .select(
          "a.id",
          "a.title",
          "a.attr",
          "a.description",
          "a.cid",
          "a.pv",
          "a.created_at",
          "a.updated_at",
          "a.status",
          "c.name",
          "c.path",
          "c.type"
        )
        // 后台文章列表按更新时间倒序；COALESCE 兜底个别 updated_at 为空（取创建时间）的情况
        .orderByRaw("COALESCE(a.updated_at, a.created_at) DESC")
        .offset(offset)
        .limit(limit),
    ]);

    const count = parseInt(totalResult?.count || 0, 10);
    const totalPages = Math.ceil(count / limit);
    const formattedList = formatDateFields(list, ['created_at', 'updated_at', 'publishTime', 'startTime', 'endTime']);

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        total: count,
        current: page,
        pageSize: limit,
        totalPages: totalPages,
        list: formattedList,
      },
    };
  }
  // 获取字段配置：mid 优先，其次回退到栏目 mid
  async findField(mid, cid) {
    let targetMid = mid;
    if (!targetMid && cid) {
      const modIdRow = await this.db("cms_category")
        .where("id", cid)
        .whereNotNull("mid")
        .select("mid")
        .first();
      targetMid = modIdRow?.mid;
    }

    let fields = [];
    if (targetMid) {
      fields = await this.db("cms_field")
        .where("mid", targetMid)
        .select("field_label", "field_name", "type", "field_config", "is_required", "group_name", "is_searchable", "is_listable", "is_sortable", "sort_order")
        .orderBy("sort_order", "asc")
        .orderBy("id", "asc");
    }

    return { success: true, code: 0, msg: '查询成功', data: { fields } };
  }

  // 统计数据（后台首页「内容统计」：各内容域的真实库存量）
  //
  // 口径说明：本 CMS 的「域」落在栏目上（cms_category.content_type），
  // 图片 / 视频 / 单页的内容**同样存在 cms_article 表**，只按 cms_article 全表 count
  // 会把图片视频单页一起算成「文章」。故此处按栏目域 join 统计，
  // 与文章管理 / 单页管理列表的 count 口径完全一致（真相源 app/common/content-types.js）：
  //   文章 = article / image / video 域（对应「文章管理」列表）
  //   单页 = page 域（对应「单页管理」列表）
  //   商品 / 标签 / 留言 各自独立成表
  async tongji() {
    // 获取7天前的日期（兼容 MySQL 和 SQLite）
    const dbType = process.env.DB_TYPE || 'mysql';
    const dateExpr = dbType === 'sqlite'
      ? "date('now', '-7 days')"
      : dbType === 'pg'
        ? "CURRENT_DATE - INTERVAL '7 days'"
        : "DATE_SUB(CURDATE(), INTERVAL 7 DAY)";

    const ARTICLE_DOMAINS = ["article", "image", "video"];

    // 按内容域统计 cms_article（leftJoin 栏目取域，与文章列表 count("a.id") 一致）
    const articleCountByDomain = (domains) =>
      this.db("cms_article as a")
        .leftJoin("cms_category as c", "a.cid", "c.id")
        .whereIn("c.content_type", domains)
        .count("a.id", { as: "count" })
        .first();

    const [article, page, tag, message, week] = await Promise.all([
      articleCountByDomain(ARTICLE_DOMAINS),
      articleCountByDomain(["page"]),
      this.db("cms_tag").count("* as count").first(),
      this.db("cms_message").count("* as count").first(),
      // 近 7 天新增文章（文章域）→ 面板标题右侧「近 7 天更新 N 篇」
      this.db("cms_article as a")
        .leftJoin("cms_category as c", "a.cid", "c.id")
        .whereIn("c.content_type", ARTICLE_DOMAINS)
        .where("a.created_at", ">=", this.db.raw(dateExpr))
        .count("a.id", { as: "count" })
        .first(),
    ]);

    return {
      success: true,
      code: 0,
      msg: '查询成功',
      data: {
        article: article.count,
        page: page.count,
        tag: tag.count,
        message: message.count,
        week: week.count,
      },
    };
  }

  /**
   * 更新扩展字段索引（用于搜索和排序）
   * @param {Object} trx - 事务对象
   * @param {number} articleId - 文章ID
   * @param {number} cid - 栏目ID
   * @param {Object} fieldParams - 扩展字段数据
   */
  async _updateExtIndex(trx, articleId, cid, fieldParams) {
    if (!fieldParams || Object.keys(fieldParams).length === 0) return;

    // 获取栏目关联的模型ID
    const category = await trx("cms_category").where("id", cid).select("mid").first();
    if (!category?.mid || category.mid === "0") return;

    // 获取需要索引的字段定义
    const fields = await trx("cms_field")
      .where("mid", category.mid)
      .andWhere(function() {
        this.where("is_searchable", 1).orWhere("is_sortable", 1);
      });

    if (fields.length === 0) return;

    // 删除旧索引
    await trx("cms_article_ext_index").where("article_id", articleId).del();

    // 构建索引记录
    const indexRecords = [];
    for (const field of fields) {
      const value = fieldParams[field.field_name];
      if (value === undefined || value === null || value === "") continue;

      const record = {
        article_id: articleId,
        field_name: field.field_name,
      };

      // 根据字段类型存入对应的索引列
      if (field.type === "number") {
        record.field_value_num = parseFloat(value) || 0;
      } else if (field.type === "date" || field.type === "datetime") {
        record.field_value_date = value;
      } else {
        // 文本类型，截取前500字符
        const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        record.field_value = strValue.substring(0, 500);
      }

      indexRecords.push(record);
    }

    if (indexRecords.length > 0) {
      await trx("cms_article_ext_index").insert(indexRecords);
    }
  }
}

export default new ArticleService();
import { z } from '../../../common/validate.js';

// 共享 id 必填 schema（字符串/数字，非 0）
const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '文章id不能为空' }
  );

/**
 * Article 模块参数校验规则（CMS 文章管理）
 *
 * 对应 controller/Article.js
 * 校验失败 code 1006（参数无效）
 */

/**
 * 创建文章 POST /cms/article/create
 * 原逻辑：body 整体传给 service.create，defaultParams.user_id 注入 uid
 * 必传字段：defaultParams.title、defaultParams.cid
 */
export const createSchema = z.looseObject({
  defaultParams: z.looseObject({
    title: z.string().min(1, '文章标题不能为空').max(200, '标题长度不能超过200'),
    cid: z.union([z.undefined(), z.number(), z.string()]).refine(
      (v) => !!v && v !== '0',
      { message: '分类cid不能为空' }
    ),
    subCid: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]).optional(),
  }),
  // 其他富文本/字段允许透传
});

/**
 * 更新文章 POST /cms/article/update
 * 原逻辑：body.id 必传，其他可选
 */
export const updateSchema = z.looseObject({
  id: idSchema,
  title: z.string().max(200).optional(),
  defaultParams: z.looseObject({
    cid: z.union([z.number(), z.string()]).optional(),
    subCid: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]).optional(),
  }).optional(),
});

/**
 * 文章详情 GET /cms/article/detail
 */
export const detailSchema = z.object({
  id: idSchema,
});

/**
 * 删除文章 GET /cms/article/delete
 */
export const deleteSchema = z.object({
  id: idSchema,
});

/**
 * 搜索文章 GET /cms/article/search
 */
export const searchSchema = z.object({
  keyword: z.string().max(100).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
  id: z.union([z.number(), z.string()]).optional(),
  // 按内容域过滤：'article,image,video' / 'page' / 'product' 等（见 app/common/content-types.js）
  content_type: z.string().max(200).optional(),
});

/**
 * 文章列表 GET /cms/article/list
 */
export const listSchema = z.object({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
});

/**
 * 查询字段 GET /cms/article/findField
 * - mid 优先；cid 兜底（按栏目 mid 拉）
 */
export const findFieldSchema = z.object({
  mid: z.union([z.number(), z.string()]).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
}).refine(
  (v) => v.mid || v.cid,
  { message: 'mid 或 cid 至少传一个' }
);

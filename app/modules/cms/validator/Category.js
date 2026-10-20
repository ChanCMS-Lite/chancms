import { z } from '../../../common/validate.js';

// 共享 id 必填 schema（字符串/数字，非 0）
const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '栏目id不能为空' }
  );

/**
 * Category 模块参数校验规则（CMS 栏目管理）
 *
 * 对应 controller/Category.js
 * 校验失败 code 1006（参数无效）
 */

// ============ 各接口 schema ============

/**
 * 创建栏目 POST /cms/category/create
 * 原逻辑：body 整体传给 service.create
 * 必传字段：name、slug
 */
export const createSchema = z.looseObject({
  name: z.string().min(1, '栏目名称不能为空').max(50, '栏目名称不能超过50'),
  slug: z.string().min(1, '栏目别名不能为空').max(50, '栏目别名不能超过50'),
  pid: z.union([z.number(), z.string()]).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  path: z.string().max(200).nullable().optional(),
  url: z.string().max(500).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  aigeo: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  dataConfig: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  ext_data: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  page_ext_data: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  type: z.union([z.number(), z.string()]).nullable().optional(),
  target: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.union([z.number(), z.string()]).nullable().optional(),
  orderBy: z.union([z.number(), z.string()]).nullable().optional(),
  mid: z.union([z.number(), z.string()]).nullable().optional(),
  page_mid: z.union([z.number(), z.string()]).nullable().optional(),
  listView: z.string().max(100).nullable().optional(),
  articleView: z.string().max(100).nullable().optional(),
});

/**
 * 更新栏目 POST /cms/category/update
 * 原逻辑：body.id 必传
 * 注意：后台表单未填写字段会提交 null（非 undefined），字符串/对象字段必须 nullable，
 *       zod v4 的 .optional() 只接受 undefined、不接受 null，否则报 1006 expected string received null
 */
export const updateSchema = z.looseObject({
  id: idSchema,
  name: z.string().max(50).nullable().optional(),
  slug: z.string().max(50).nullable().optional(),
  pid: z.union([z.number(), z.string()]).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  path: z.string().max(200).nullable().optional(),
  url: z.string().max(500).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  aigeo: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  dataConfig: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  ext_data: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  page_ext_data: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  type: z.union([z.number(), z.string()]).nullable().optional(),
  target: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.union([z.number(), z.string()]).nullable().optional(),
  orderBy: z.union([z.number(), z.string()]).nullable().optional(),
  mid: z.union([z.number(), z.string()]).nullable().optional(),
  page_mid: z.union([z.number(), z.string()]).nullable().optional(),
  listView: z.string().max(100).nullable().optional(),
  articleView: z.string().max(100).nullable().optional(),
});

/**
 * 删除栏目 GET /cms/category/delete
 */
export const deleteSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 查询栏目详情 GET /cms/category/findId
 */
export const findIdSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 查询子栏目 GET /cms/category/findSubId
 */
export const findSubIdSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 搜索栏目 GET /cms/category/search
 */
export const searchSchema = z.object({
  q: z.string().max(50).optional(),
});

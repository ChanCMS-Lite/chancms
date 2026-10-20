import { z } from '../../../common/validate.js';

// 共享 id 必填 schema（字符串/数字，非 0）
const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '留言id不能为空' }
)


// 空串 / null / undefined 统一转为 undefined，便于 optional 字段「填了才校验、不填放行」
// （避免把空串当成字符串去走 min / email 规则而误拦截）
const clean = (v) => (v === '' || v === null || v === undefined ? undefined : v);

// 邮箱：可选；填了才校验格式，留空/null 放行
const emailSchema = z
  .preprocess(clean, z.string().max(100, '邮箱不能超过100个字符').email('邮箱格式不正确').optional());

/**
 * Message 模块参数校验规则（CMS 留言/评论管理）
 *
 * 对应 controller/Message.js
 * 校验失败 code 1006（参数无效）
 */

// ============ 各接口 schema ============

/**
 * 创建留言 POST /cms/message/create
 * 公开接口（鉴权之前），字段必须严格白名单收敛——
 *    默认 strip 未声明字段，防止匿名塞入 status/is_read 等管理端才应写的列
 * 必填：content；可选：姓名/手机号/类型/标题/微信/公司/邮箱
 */
export const createSchema = z.object({
  type: z.union([z.number(), z.string()]).nullable().optional(),
  title: z.string().max(255).nullable().optional(),
  // 姓名：选填；填了必须 ≥2 字
  name: z.preprocess(clean, z.string().min(2, '姓名长度不能少于2个字').max(100).optional()),
  // 联系手机号：选填；填了必须是 11 位数字
  tel: z.preprocess(clean, z.string().regex(/^\d{11}$/, '手机号必须是11位数字').max(50).optional()),
  wechat: z.string().max(50).nullable().optional(),
  // 公司名称：选填；填了必须 ≥5 字
  company: z.preprocess(clean, z.string().min(5, '公司名称不能少于5个字').max(100).optional()),
  content: z.string({ error: '留言内容不能为空' }).min(1, '留言内容不能为空').max(1000, '留言内容不能超过1000'),
  email: emailSchema,
  nickname: z.string().max(50).optional(),
  aid: z.union([z.number(), z.string()]).optional(),
  pid: z.union([z.number(), z.string()]).optional(),
});

/**
 * 更新留言 POST /cms/message/update
 */
export const updateSchema = z.looseObject({
  id: idSchema,
  type: z.union([z.number(), z.string()]).nullable().optional(),
  title: z.string().max(255).nullable().optional(),
  name: z.string().max(100).nullable().optional(),
  tel: z.string().max(50).nullable().optional(),
  wechat: z.string().max(50).nullable().optional(),
  company: z.string().max(100).nullable().optional(),
  content: z.string().max(1000).optional(),
  email: emailSchema,
  status: z.union([z.number(), z.string()]).optional(),
});

/**
 * 删除留言 GET /cms/message/delete
 */
export const deleteSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 留言详情 GET /cms/message/detail
 */
export const detailSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 搜索留言 GET /cms/message/search
 */
export const searchSchema = z.object({
  keyword: z.string().max(100).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

/**
 * 留言列表 GET /cms/message/list
 */
export const listSchema = z.object({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

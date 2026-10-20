import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '标签id不能为空' }
);

// 写入白名单见 service/Tag.js TAG_WRITE_FIELDS；表单 null 统一 .nullable()
export const createSchema = z.looseObject({
  // 标签名必传（搜索/展示主字段）
  name: z.string({ error: '标签名不能为空' }).min(1, '标签名不能为空').max(50, '标签名不能超过50'),
  path: z.string().max(200).nullable().optional(),
  count: z.union([z.number(), z.string()]).nullable().optional(),
  cid: z.union([z.number(), z.string()]).nullable().optional(),
});

export const updateSchema = z.looseObject({
  id: idSchema,
  name: z.string().max(50).nullable().optional(),
  path: z.string().max(200).nullable().optional(),
  count: z.union([z.number(), z.string()]).nullable().optional(),
  cid: z.union([z.number(), z.string()]).nullable().optional(),
});

export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
});
export const searchSchema = z.looseObject({
  keyword: z.string().max(100).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
});

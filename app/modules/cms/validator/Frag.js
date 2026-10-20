import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '碎片id不能为空' }
);

// cms_frag 可写字段（service FRAG_WRITE_FIELDS：name/mark/content/type/mid/ext_data/cid）
// mark 是模板取用标识（{{frag 'mark'}}），create 必填；name 后台列表展示用，也必填
const fields = {
  name: z.string().min(1, '碎片名称不能为空').max(100),
  mark: z.string().min(1, '碎片标识不能为空').max(100),
  content: z.string().optional(),
  type: z.union([z.number(), z.string()]).optional(),
  mid: z.union([z.number(), z.string()]).optional(),
  ext_data: z.any().optional(),
  cid: z.union([z.number(), z.string()]).optional().nullable(),
};

export const createSchema = z.looseObject(fields);
export const updateSchema = z.looseObject({
  id: idSchema,
  name: z.string().max(100).optional(),
  mark: z.string().max(100).optional(),
  content: z.string().optional(),
  type: z.union([z.number(), z.string()]).optional(),
  mid: z.union([z.number(), z.string()]).optional(),
  ext_data: z.any().optional(),
  cid: z.union([z.number(), z.string()]).optional().nullable(),
});
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
// 搜索 / 列表：keyword 筛选 + 分页
export const searchSchema = z.looseObject({
  keyword: z.string().max(50).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

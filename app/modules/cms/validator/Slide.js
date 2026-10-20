import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '轮播图id不能为空' }
);

// cms_slide 可写字段（service SLIDE_WRITE_FIELDS：title/imgUrl/linkUrl/content/mark/sort/status/mid/ext_data/cid）
const fields = {
  title: z.string().min(1, '轮播标题不能为空').max(200),
  imgUrl: z.string().max(500).optional(),
  linkUrl: z.string().max(500).optional(),
  content: z.string().optional(),
  mark: z.string().max(100).optional(),
  sort: z.union([z.number(), z.string()]).optional(),
  status: z.union([z.number(), z.string()]).optional(),
  mid: z.union([z.number(), z.string()]).optional(),
  ext_data: z.any().optional(),
  cid: z.union([z.number(), z.string()]).optional().nullable(),
};

// 创建：body 整体透传给 service，允许扩展字段
export const createSchema = z.looseObject(fields);
// 更新：title 放宽为可选（部分字段更新语义）
export const updateSchema = z.looseObject({
  id: idSchema,
  ...fields,
  title: z.string().max(200).optional(),
});
// 删除 / 详情：id 必传
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
// 列表 / 搜索：分页 + 筛选
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});
export const searchSchema = z.looseObject({
  keyword: z.string().max(50).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: 'id不能为空' }
);

// 各页面 handler 为 SSR 渲染，参数来自 req.query / req.params，下游 service 均有钳制；
// 此处只做宽松类型/长度约束（防异常超长 query 进入缓存 key / 日志），不拒绝额外字段
export const listSchema = z.looseObject({
  cid: z.union([z.number(), z.string()]).optional(),
  cate: z.union([z.number(), z.string()]).optional(),
  category: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  tagId: z.union([z.number(), z.string()]).optional(),
  keyword: z.string().max(100).optional(),
});

export const articleSchema = z.looseObject({ id: idSchema });

// 单页栏目：params.id 为路由解析后的文件名片段（如 page.html / page-2.html）
export const pageSchema = z.looseObject({
  id: z.string().max(200).optional(),
});

export const searchSchema = z.looseObject({
  keywords: z.string().max(100).optional(),
  keyword: z.string().max(100).optional(),
  cid: z.union([z.number(), z.string()]).optional(),
  type: z.string().max(20).optional(),
  page: z.union([z.number(), z.string()]).optional(),
});

// 标签页：params 由 tagParams 解析出 path / tag
export const tagSchema = z.looseObject({
  path: z.string().max(200).optional(),
  tag: z.string().max(100).optional(),
});

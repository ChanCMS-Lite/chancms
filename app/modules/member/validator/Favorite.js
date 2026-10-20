import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '收藏id不能为空' }
);

// 创建收藏：articleId 缺失由 controller 手动返回「参数不完整」，此处只做类型/长度约束
// 前端未填字段可能提交 null，统一 .nullable()
export const createSchema = z.looseObject({
  articleId: z.union([z.number(), z.string()]).nullable().optional(),
  articleTitle: z.string().max(255).nullable().optional(),
  articleCover: z.string().max(500).nullable().optional(),
  articleSummary: z.string().max(1000).nullable().optional(),
  articleUrl: z.string().max(500).nullable().optional(),
  // 内容域：article/product/book 等，缺省由 service 兜底 article
  type: z.string().max(20).nullable().optional(),
  categoryId: z.union([z.number(), z.string()]).nullable().optional(),
  categoryName: z.string().max(100).nullable().optional(),
});

// 会员删除：body.id 必传
export const deleteSchema = z.looseObject({ id: idSchema });

// 会员 / 后台列表
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  type: z.string().max(20).optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  keyword: z.string().max(100).optional(),
});

// 后台删除：body 或 query 的 id 均可，缺失由 controller 手动判断
export const favoriteDeleteSchema = z.looseObject({
  id: z.union([z.number(), z.string()]).optional(),
});

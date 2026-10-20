import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '评论id不能为空' }
);

// 创建评论：articleId/content 缺失由 controller 手动返回「参数不完整」，此处只做类型/长度约束
// parentId / replyToMemberId 前端未选时可能提交 null，统一 .nullable()
export const createSchema = z.looseObject({
  articleId: z.union([z.number(), z.string()]).nullable().optional(),
  content: z.string().max(2000, '评论内容不能超过2000').nullable().optional(),
  parentId: z.union([z.number(), z.string()]).nullable().optional(),
  replyToMemberId: z.union([z.number(), z.string()]).nullable().optional(),
});

// 后台删除：query.id 必传
export const deleteSchema = z.looseObject({ id: idSchema });

// 会员 / 后台列表
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  status: z.union([z.number(), z.string()]).optional(),
});

// 点赞：兼容前端 {id} 与 {commentId} 两种契约，缺失由 controller 手动判断
export const likeSchema = z.looseObject({
  id: z.union([z.number(), z.string()]).optional(),
  commentId: z.union([z.number(), z.string()]).optional(),
});

export const articleCommentsSchema = z.looseObject({
  articleId: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

// 审核：id/status 缺失由 controller 手动返回「参数不完整」
export const commentAuditSchema = z.looseObject({
  id: z.union([z.number(), z.string()]).optional(),
  status: z.union([z.number(), z.string()]).optional(),
  auditRemark: z.string().max(255).optional(),
});

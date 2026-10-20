import { z } from '../../../common/validate.js';

const idsSchema = z.union([z.undefined(), z.array(z.any()), z.string(), z.number()]).refine(
  (v) => !!v,
  { message: 'ids不能为空' }
);

// 列表：筛选 + 分页（controller 解构 cur/pageSize/title/oper_name/business_type/operator_type/status）
export const listSchema = z.looseObject({
  cur: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  title: z.string().max(100).optional(),
  oper_name: z.string().max(50).optional(),
  business_type: z.union([z.number(), z.string()]).optional(),
  operator_type: z.union([z.number(), z.string()]).optional(),
  status: z.union([z.number(), z.string()]).optional(),
});

// 批量删除：ids 必传（数组 / 逗号分隔字符串 / 单数字）
export const deleteSchema = z.looseObject({ ids: idsSchema });

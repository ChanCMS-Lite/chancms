import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '模型id不能为空' }
);

// 写入白名单见 service/Model.js MODEL_WRITE_FIELDS（settings 为 JSON 列，字符串/对象均可）
// 表单未填字段会提交 null，故统一 .nullable()（zod 的 .optional() 不接受 null）
const fieldsSchema = {
  model: z.string().max(50).nullable().optional(),
  model_code: z.string().max(50).nullable().optional(),
  status: z.union([z.number(), z.string()]).nullable().optional(),
  remark: z.string().max(255).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(200).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  settings: z.union([z.string(), z.record(z.any())]).nullable().optional(),
};

// 创建：model 必传（controller 用它做重名校验，缺失会让重复检查失效）
export const createSchema = z.looseObject({
  ...fieldsSchema,
  model: z.string({ error: '模型标识不能为空' }).min(1, '模型标识不能为空').max(50, '模型标识不能超过50'),
});

export const updateSchema = z.looseObject({ id: idSchema, ...fieldsSchema });
// 删除：body.id 必传（逗号分隔批量）
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});
export const searchSchema = z.looseObject({
  keyword: z.string().max(100).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

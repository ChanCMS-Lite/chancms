import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '字段id不能为空' }
);
const midSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v,
  { message: '模型mid不能为空' }
);

// 字段消费见 service/Field.js（mid+field_name 用于重名校验，field_config 为 JSON 列）
// 表单 null 统一 .nullable()
const fieldsSchema = {
  mid: midSchema.nullable().optional(),
  field_label: z.string().max(100).nullable().optional(),
  type: z.string().max(50).nullable().optional(),
  field_config: z.union([z.string(), z.record(z.any())]).nullable().optional(),
  is_required: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  is_searchable: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  is_listable: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  is_sortable: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  sort_order: z.union([z.number(), z.string()]).nullable().optional(),
  group_name: z.string().max(50).nullable().optional(),
};

// 创建：mid / field_name 必传（重名校验与插入主键依赖）
export const createSchema = z.looseObject({
  ...fieldsSchema,
  field_name: z.string({ error: '字段名不能为空' }).min(1, '字段名不能为空').max(50, '字段名不能超过50'),
});

export const updateSchema = z.looseObject({ id: idSchema, ...fieldsSchema });
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  mid: midSchema.optional(),
});
export const findByMidSchema = z.looseObject({ mid: midSchema });

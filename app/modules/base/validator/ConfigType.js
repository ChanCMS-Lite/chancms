import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '配置类型id不能为空' }
);

// sys_config_type 可写字段（service WRITE_FIELDS：type_code/type_name/status/remark）
const fields = {
  type_code: z.string().min(1, '类型编码不能为空').max(50),
  type_name: z.string().min(1, '类型名称不能为空').max(100),
  status: z.union([z.number(), z.string()]).optional(),
  remark: z.string().max(500).optional(),
};

export const createSchema = z.looseObject(fields);
export const updateSchema = z.looseObject({
  id: idSchema,
  type_code: z.string().max(50).optional(),
  type_name: z.string().max(100).optional(),
  status: z.union([z.number(), z.string()]).optional(),
  remark: z.string().max(500).optional(),
});
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

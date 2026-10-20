import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '接口权限id不能为空' }
);

// sys_perm_route 可写字段（service 消费：method/path/perm_code/remark）
const fields = {
  method: z.string().min(1, 'HTTP 方法不能为空').max(10),
  path: z.string().min(1, '接口路径不能为空').max(255),
  perm_code: z.string().min(1, '权限码不能为空').max(100),
  remark: z.string().max(255).optional(),
};

export const createSchema = z.looseObject(fields);
export const updateSchema = z.looseObject({
  id: idSchema,
  method: z.string().max(10).optional(),
  path: z.string().max(255).optional(),
  perm_code: z.string().max(100).optional(),
  remark: z.string().max(255).optional(),
});
export const deleteSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  keyword: z.string().max(50).optional(),
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '权限id不能为空' }
);

// sys_permission 可写字段（service 消费：menu_id/perm_key/perm_type/name）
const fields = {
  menu_id: z.union([z.undefined(), z.number(), z.string()]).refine((v) => !!v, { message: '所属菜单不能为空' }),
  perm_key: z.string().min(1, '权限标识不能为空').max(100),
  perm_type: z.string().max(20).optional(),
  name: z.string().min(1, '权限名称不能为空').max(100),
};

export const createSchema = z.looseObject(fields);
export const updateSchema = z.looseObject({
  id: idSchema,
  menu_id: z.union([z.number(), z.string()]).optional(),
  perm_key: z.string().max(100).optional(),
  perm_type: z.string().max(20).optional(),
  name: z.string().max(100).optional(),
});
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  menu_id: z.union([z.number(), z.string()]).optional(),
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

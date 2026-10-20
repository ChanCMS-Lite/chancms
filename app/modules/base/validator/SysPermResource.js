import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '资源id不能为空' }
);

// sys_perm_resource 可写字段（service.resourceSave 消费：module/resource_key/name/actions/menu_id/sort）
// actions 动作白名单与 service 一致（list/create/update/delete）
export const createSchema = z.looseObject({
  module: z.string().min(1, '模块不能为空').max(50),
  resource_key: z.string().min(1, '资源key不能为空').max(100),
  name: z.string().min(1, '资源名不能为空').max(100),
  actions: z.array(z.enum(['list', 'create', 'update', 'delete'])).max(10).optional(),
  menu_id: z.union([z.number(), z.string()]).optional(),
  sort: z.union([z.number(), z.string()]).optional(),
});

// 列表：keywords/module 筛选 + 分页
export const listSchema = z.looseObject({
  keywords: z.string().max(50).optional(),
  module: z.string().max(50).optional(),
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

// 删除：query.id 必传
export const deleteSchema = z.looseObject({ id: idSchema });

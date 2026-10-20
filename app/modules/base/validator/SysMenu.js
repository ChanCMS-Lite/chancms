import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '菜单id不能为空' }
);

// sys_menu 可写字段（service WRITE_FIELDS 白名单），type: M=目录 C=菜单 F=按钮
// 前端菜单弹窗同样整包回传 detail（views/base/menu/components/dialog.vue），
// zod 的 .optional() 不接受 null，故除 NOT NULL 的 title 外统一 .nullable()。
// 表结构依据 data/init.sql：仅 title 为 NOT NULL，其余列均允许 NULL。
const fields = {
  pid: z.union([z.number(), z.string()]).nullable().optional(),
  title: z.string().min(1, '菜单标题不能为空').max(50),
  name: z.string().max(50).nullable().optional(),
  order_num: z.union([z.number(), z.string()]).nullable().optional(),
  path: z.string().max(200).nullable().optional(),
  component: z.string().max(200).nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  query: z.string().max(500).nullable().optional(),
  perms: z.string().max(100).nullable().optional(),
  type: z.enum(['M', 'C', 'F'], { message: '菜单类型仅允许 M/C/F' }).nullable().optional(),
  is_frame: z.union([z.number(), z.string()]).nullable().optional(),
  is_cache: z.union([z.number(), z.string()]).nullable().optional(),
  is_show: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.union([z.number(), z.string()]).nullable().optional(),
  remark: z.string().max(255).nullable().optional(),
};

export const createSchema = z.looseObject(fields);
// 更新：title 由必填放宽为可选（部分字段更新语义）
export const updateSchema = z.looseObject({
  id: idSchema,
  ...fields,
  title: z.string().max(50).optional(),
});
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

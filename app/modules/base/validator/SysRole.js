import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '角色id不能为空' }
);

// roleData：sys_role 可写字段（name/key/status/sort；permCodes 嵌套字段由 service 剥离）
// 前端会把 detail 回显的整行数据原样回传（含 NULL 字段），zod 的 .optional() 不接受 null，
// 故 DB 可空列须额外 .nullable()（与 cms/validator/Model.js、member/validator/*.js 同一约定）。
// NOT NULL 列（name/key/status/sort）刻意不加 .nullable()：真传 null 时在校验层给出
//    「参数取值错误: roleData.xxx」，而不是落到 SQL 层报 not-null 约束。
const roleDataFields = {
  name: z.string().min(1, '角色名称不能为空').max(50),
  key: z.string().max(50).optional(),
  status: z.union([z.number(), z.string()]).optional(),
  sort: z.union([z.number(), z.string()]).optional(),
  // sys_role.remark 为 DEFAULT NULL（可空）——前端未填 remark 时回传 null，此处必须 nullable
  remark: z.string().max(255).nullable().optional(),
};
const menuIdsSchema = z.array(z.union([z.number(), z.string()])).max(500).optional();
const permCodesSchema = z.array(z.string().max(100)).max(1000).optional();

// 创建：{ roleData, menuIds, permCodes }
export const createSchema = z.looseObject({
  roleData: z.looseObject(roleDataFields),
  menuIds: menuIdsSchema,
  permCodes: permCodesSchema,
});

// 更新：{ roleId, roleData, menuIds, permCodes }，roleData 同样必传（改名/改状态等）
export const updateSchema = z.looseObject({
  roleId: idSchema,
  roleData: z.looseObject({
    ...roleDataFields,
    name: z.string().max(50).optional(),
  }),
  menuIds: menuIdsSchema,
  permCodes: permCodesSchema,
});

export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
export const listSchema = z.looseObject({
  keyword: z.string().max(50).optional(),
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

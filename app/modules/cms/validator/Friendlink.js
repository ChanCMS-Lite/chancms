import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '友情链接id不能为空' }
);

// 可写字段（admin 表单：title/link/orderBy；link 合法性由 service.assertSafeLink 深度校验）
const fields = {
  title: z.string().min(1, '链接名称不能为空').max(100),
  link: z.string().min(1, '链接地址不能为空').max(500),
  orderBy: z.union([z.number(), z.string()]).optional(),
};

// 创建：body 整体透传给 service，允许扩展字段
export const createSchema = z.looseObject(fields);
// 更新：title/link 放宽为可选（部分字段更新语义；service 对 link 仍有非空断言）
export const updateSchema = z.looseObject({
  id: idSchema,
  title: z.string().max(100).optional(),
  link: z.string().max(500).optional(),
  orderBy: z.union([z.number(), z.string()]).optional(),
});
// 删除 / 详情：id 必传
export const deleteSchema = z.looseObject({ id: idSchema });
export const detailSchema = z.looseObject({ id: idSchema });
// 列表：透传
export const listSchema = z.looseObject({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

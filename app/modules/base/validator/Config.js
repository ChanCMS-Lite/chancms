import { z } from '../../../common/validate.js';

const idSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: '配置id不能为空' }
);

// sys_config 可写字段（service create/update/updateMany 白名单对齐：type_code/config_key/config_value/status/remark）
const fields = {
  type_code: z.string().max(50).optional(),
  config_key: z.string().min(1, 'config_key 不能为空').max(100),
  config_value: z.any().optional(),
  status: z.union([z.number(), z.string()]).optional(),
  remark: z.string().max(500).optional(),
};

// 创建：config_key 是配置项标识，缺了这条记录无意义
export const createSchema = z.looseObject(fields);
// 更新：整包更新走同一套字段约束
export const updateSchema = z.looseObject({ id: idSchema, ...fields, config_key: z.string().max(100).optional() });
// 删除：id 必传（body 或 query）
export const deleteSchema = z.looseObject({ id: idSchema });
// 详情：id 必传
export const detailSchema = z.looseObject({ id: idSchema });
// 列表：query 会透传为 WHERE 条件（列名白名单由 Repository 兜底），仅约束分页字段
export const listSchema = z.looseObject({
  current: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});
// 批量更新：数组 [{query, data}]，与 service.updateMany 的白名单对齐
export const updateManySchema = z.array(
  z.object({
    query: z.any(),
    data: z.looseObject({
      type_code: z.string().max(50).optional(),
      config_key: z.string().max(100).optional(),
      config_value: z.any().optional(),
      status: z.union([z.number(), z.string()]).optional(),
      remark: z.string().max(500).optional(),
    }),
  })
);

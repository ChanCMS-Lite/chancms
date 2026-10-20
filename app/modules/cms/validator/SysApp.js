import { z } from '../../../common/validate.js';

// find 为只读（sys_config 全表），无强校验入参
export const findSchema = z.looseObject({});

// 更新：id 必传（service.updateById 依赖）；白名单字段见 service/SysApp.js allowedFields
// 表单未填字段可能提交 null，统一 .nullable()
export const updateSchema = z.looseObject({
  id: z.union([z.undefined(), z.number(), z.string()]).refine((v) => !!v && v !== '0', { message: '配置id不能为空' }),
  config_key: z.string().max(100).nullable().optional(),
  config_value: z.union([z.string(), z.number()]).nullable().optional(),
  type_code: z.string().max(50).nullable().optional(),
  status: z.union([z.number(), z.string()]).nullable().optional(),
  is_system: z.union([z.number(), z.string()]).nullable().optional(),
  remark: z.string().max(255).nullable().optional(),
});

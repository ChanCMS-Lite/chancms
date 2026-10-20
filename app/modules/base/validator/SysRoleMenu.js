import { z } from '../../../common/validate.js';

const roleIdSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v && v !== '0',
  { message: 'role_id不能为空' }
);

// 角色菜单列表：route.id 即为 role_id，必传
export const listSchema = z.looseObject({ id: roleIdSchema });

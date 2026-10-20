import { z } from '../../../common/validate.js';

const userIdSchema = z.union([z.undefined(), z.number(), z.string()]).refine(
  (v) => !!v,
  { message: 'user_id不能为空' }
);

// 查用户角色：user_id 必传
export const detailSchema = z.looseObject({ user_id: userIdSchema });

import { z } from '../../../common/validate.js';

// IP 查询：ip 可空（缺失时回退服务端 IP），最长 45（IPv6）
export const ipSchema = z.looseObject({
  ip: z.string().max(45).optional(),
});

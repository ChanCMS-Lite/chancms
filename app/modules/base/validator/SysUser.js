import { z } from '../../../common/validate.js';

/**
 * SysUser 模块参数校验规则（后台管理员）
 *
 * 对应 controller/SysUser.js
 * 校验失败 code 1006（参数无效）
 */

// ============ 公共规则 ============

const usernameField = z
  .string()
  .min(2, '用户名至少2位')
  .max(30, '用户名长度不能超过30')
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线、中文');

const passwordField = z
  .string()
  .min(6, '密码至少6位')
  .max(50, '密码长度不能超过50');

// ============ 各接口 schema ============

/**
 * 后台登录 POST /base/user/login
 * 原逻辑：username/password 必传，captcha/sessionId 走 verifyCaptcha
 */
export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50),
  password: z.string().min(1, '密码不能为空').max(50),
  f: z.string().max(64).optional(),
  // verifyCaptcha 需要的字段，宽松校验
  captcha: z.string().max(20).optional(),
  sessionId: z.string().max(100).optional(),
});

/**
 * 创建用户 POST /base/user/create
 */
export const createSchema = z.object({
  username: usernameField,
  password: passwordField,
  status: z.union([z.string(), z.number()]).optional(),
  role_ids: z.union([z.string(), z.array(z.string()), z.array(z.number())]).optional(),
});

/**
 * 更新用户 POST /base/user/update
 * 原逻辑：userId 必传，username/status/role_ids/password 可选
 */
export const updateSchema = z.object({
  userId: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'userId不能为空' }
  ),
  username: z.string().max(30).optional(),
  status: z.union([z.string(), z.number()]).optional(),
  role_ids: z.union([z.string(), z.array(z.string()), z.array(z.number())]).optional(),
  password: z.string().max(50).optional(),
});

/**
 * 用户详情 GET /base/user/detail
 * 原逻辑：id 可选，无则用 req.user.uid
 */
export const detailSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
});

/**
 * 删除用户 GET /base/user/delete
 * 原逻辑：id 必传
 */
export const deleteSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: 'id不能为空' }
  ),
});

/**
 * 用户列表 GET /base/user/list
 * 原逻辑：query 可空
 */
export const listSchema = z.object({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
  keyword: z.string().max(50).optional(),
}).catchall(z.unknown());

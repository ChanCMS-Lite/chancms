import { z } from '../../../common/validate.js';

/**
 * Member 模块参数校验规则
 *
 * 对应 controller/Member.js 的各个方法
 * 校验失败消息统一中文，code 1006（参数无效）
 */

// ============ 公共规则 ============

const emailField = z
  .string()
  .min(1, '邮箱不能为空')
  .email('邮箱格式错误')
  .max(100, '邮箱长度不能超过100');

const passwordField = z
  .string()
  .min(6, '密码至少6位')
  .max(50, '密码长度不能超过50');

const usernameField = z
  .string()
  .min(2, '用户名至少2位')
  .max(30, '用户名长度不能超过30')
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线、中文');

// ============ 各接口 schema ============

/**
 * 登录 POST /member/v1/login
 * captcha/sessionId 为必填（verifyCaptcha 强制校验），在 schema 层提前拦截给出明确提示
 */
export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名长度不能超过50'),
  password: z.string().min(1, '密码不能为空').max(50, '密码长度不能超过50'),
  fp: z.string().max(64).optional(),
  // 图形验证码必填（GET /member/v1/captcha 获取）
  captcha: z.string().min(1, '请输入图形验证码').max(20, '验证码长度不能超过20'),
  sessionId: z.string().min(1, '验证码会话不能为空，请刷新验证码').max(100),
  // 小程序标识，可选
  clientType: z.string().max(20).optional(),
});

/**
 * 注册 POST /member/v1/register
 * verifycode 中间件前置校验邮箱验证码，code 必填
 */
export const registerSchema = z.object({
  username: usernameField,
  password: passwordField,
  email: emailField,
  // 邮箱验证码（sendEmail 接口发送）
  code: z.string().min(1, '请输入邮箱验证码').max(10, '验证码长度不能超过10'),
});

/**
 * 发送邮件验证码 POST /member/v1/sendEmail
 */
export const sendEmailSchema = z.object({
  email: emailField,
  type: z.enum(['register', 'reset'], {
    message: 'type 只能是 register 或 reset',
  }),
});

/**
 * 重置密码 POST /member/v1/resetPass
 * verifycode 中间件前置校验邮箱验证码
 */
export const resetPassSchema = z.object({
  email: emailField,
  password: passwordField,
  // 邮箱验证码（sendEmail type=reset 发送）
  code: z.string().min(1, '请输入邮箱验证码').max(10),
});

/**
 * 修改密码 POST /member/v1/updatePass
 * 原逻辑：password/newPassword/email/code 必传，uid 来自 token
 * 安全：email + code 校验防绕过（见 controller 注释）
 */
export const updatePassSchema = z.object({
  password: z.string().min(1, '原密码不能为空').max(50, '原密码长度不能超过50'),
  newPassword: passwordField,
  email: emailField,
  code: z.string().min(1, '验证码不能为空').max(10, '验证码长度不能超过10'),
});

/**
 * 更新会员资料 POST /member/v1/updateUser
 * 原逻辑：会员端强制 uid，后台端需 id；可选字段众多
 */
export const updateUserSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  phone: z.string().max(20, '手机号长度不能超过20').nullable().optional(),
  remark: z.string().max(500, '备注长度不能超过500').nullable().optional(),
  sex: z.union([z.string(), z.number()]).nullable().optional(),
  wechat: z.string().max(50).nullable().optional(),
  username: z.string().max(30).nullable().optional(),
  nickname: z.string().max(30).nullable().optional(),
  email: z.string().max(100).nullable().optional(),
  status: z.union([z.boolean(), z.number(), z.string()]).nullable().optional(),
}).refine(
  // 至少传一个可更新字段
  (data) => Object.keys(data).some(k => !['id', 'status'].includes(k)),
  { message: '至少需要提供一个可更新字段' }
);

/**
 * 更新会员状态 POST /member/v1/updateStatus
 * 原逻辑：id/status 必传，且不能改自己
 * 注意：自己改自己的拦截在 controller 内（需要 uid 对比）
 */
export const updateStatusSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: '会员ID不能为空' }
  ),
  status: z.union([z.boolean(), z.number(), z.string()]),
});

/**
 * 会员详情 GET /member/v1/adminDetail
 * 原逻辑：id 必传（query）
 */
export const adminDetailSchema = z.object({
  id: z.union([z.undefined(), z.number(), z.string()]).refine(
    (v) => !!v && v !== '0',
    { message: '会员ID不能为空' }
  ),
});

/**
 * 会员列表 GET /member/v1/list
 * 原逻辑：page 可选默认1，pageSize 可选默认20
 */
export const listSchema = z.object({
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

/**
 * 搜索会员 GET /member/v1/search
 * 原逻辑：keyword 必传，page/pageSize 可选
 */
export const searchSchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空').max(50, '关键词长度不能超过50'),
  page: z.union([z.number(), z.string()]).optional(),
  pageSize: z.union([z.number(), z.string()]).optional(),
});

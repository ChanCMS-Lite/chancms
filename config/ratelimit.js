/**
 * 统一限流配置（所有接口的频次/限流阈值集中管理）
 * ------------------------------------------------------------------
 * 在 config/index.js 注册后，除框架 WAF 外，各业务限流点统一从这里读取，
 * 以后调整阈值只改本文件一处即可。
 *
 * 说明：
 *  - global：全局 WAF 限流（作用于所有请求，按 IP 维度），具体拦截逻辑在 chanjs waf 中间件。
 *            跟随环境切换：本地开发(dev)放宽到很高，避免频繁点击/压测被误伤；
 *            生产(prd)保持安全值。
 *  - search / verifyCode / sendEmail / message：业务接口限流。
 *  - loginFail：登录失败锁定（安全类，阈值保守，仅抽配置、不放大）。
 *
 * windowMs 支持 chanjs createRateLimitMiddleware 的字符串格式：
 *   '30s' / '1m' / '5m' / '2h' / '3d' 或纯毫秒数字。
 */

// 收口说明：本文件仅作为启动期兜底——WAF 初始化时 config.rateLimit 必须存在。
// 后台可在 sys_config.rate_limit_config（JSON，config_key=all）中覆盖任意字段，
// 由 base/service/remote-config.js 启动期注入后原地合并到 config.rateLimit，WAF 自动跟随；
// 因此生产环境的限流阈值建议在后台 sys_config 中配置，而非改本文件。
const isProd = process.env.NODE_ENV === 'prd';

export const rateLimit = {
  // 全局 WAF 限流（作用于所有请求，按 IP）
  // 当前 dev / prd 同值（2000 次/分钟）；如需按环境区分，
  // 建议在后台 sys_config.rate_limit_config 覆盖，而非改这里
  global: isProd
    ? { max: 2000, windowMs: '1m' }
    : { max: 2000, windowMs: '1m' },

  // 登录接口 IP 维度限流（防暴力撞库的第一道防线）
  // 说明：loginFail 中间件是「(IP, 账号) 猜错 N 次锁 1h」，
  //       本项是「单 IP 每分钟请求次数」，两者互补：
  //       本层防单 IP 高频扫描，中间件防定向爆破单账号。
  // 阈值参考 verifyCode（20 次/5min）——登录更敏感，收紧到 10 次/分钟。
  login: {
    max: 10,
    windowMs: '1m',
    message: '登录尝试过于频繁，请稍后再试',
  },

  // 搜索接口专属限流
  search: {
    max: 30,
    windowMs: '1m',
    message: '搜索访问过于频繁，请稍后再试',
  },

  // api 模块公开读接口限流（/api/v1 公开读统一挂载）
  // 这些接口无需登录、直接查库，必须限流防止爬虫/刷接口拖垮数据库。
  // 60 次/分钟 ≈ 1 次/秒，正常浏览足够；异常高频自动拦截。
  publicRead: {
    max: 60,
    windowMs: '1m',
    message: '访问过于频繁，请稍后再试',
  },

  // IP 归属地查询（GET /iplib/v1/ip，公开接口；原 proxy 模块已重命名为 iplib）
  // 该接口按设计对外公开（取访客自身 IP/属地），无鉴权 → 必须限流，
  // 否则会被当成免费的 IP 归属地查询服务刷（?ip= 可查任意 IP）
  ipQuery: {
    max: 60,
    windowMs: '1m',
  },

  // 邮箱验证码下发（checkEmail / resetPass 等校验类接口）
  verifyCode: {
    max: 20,
    windowMs: '5m',
  },

  // 邮箱验证码「校验失败」锁定（安全类，防 6 位码暴力猜解）
  // 说明：verifyCode 是「请求频次」限流，无法阻止对同一个码反复猜；
  //       本项是「猜错次数」限制——同一邮箱累计猜错 maxFail 次即锁定，
  //       期间即使码正确也拒绝（避免猜中），重新获取验证码会重置计数。
  verifyCodeFail: {
    maxFail: 5,                 // 最大连续猜错次数
    lockMs: 15 * 60 * 1000,     // 锁定时长 15 分钟
  },

  // 发邮件（注册/找回密码）：同邮箱最小发送间隔 + 每 IP 每日上限
  sendEmail: {
    intervalMs: 60 * 1000, // 同邮箱最小发送间隔（原 60s 硬编码）
    maxPerIpPerDay: 20, // 每 IP 每日上限（原 5，调大避免本地测试受限）
  },

  // 留言提交（IP + 设备指纹双维度，按天重置）
  message: {
    maxPerIpPerDay: 100, // 单 IP 每日上限（原 20）
    maxPerFpPerDay: 50, // 单设备每日上限（原 10）
  },

  // 登录失败锁定（安全类，保守阈值，仅抽配置不放大）
  loginFail: {
    maxFail: 5, // 最大失败次数
    lockMs: 60 * 60 * 1000, // 锁定时长 1 小时
  },
};

export default { rateLimit };

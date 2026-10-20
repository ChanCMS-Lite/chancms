// jwt 配置
const JWT_SECRET = process.env.JWT_SECRET || "";

// 弱密钥黑名单（拒绝众所周知的占位符）
const WEAK_SECRETS = ["", "ChanCMS", "chancms", "secret", "changeme", "your-secret"];

/**
 * 校验 JWT 密钥强度
 * - 长度 ≥ 32 字节
 * - 不在弱密钥黑名单中
 * @param {string} secret - 待校验密钥
 * @returns {boolean} 是否合格
 */
const isStrongSecret = (secret) => {
  if (!secret || typeof secret !== 'string') return false;
  if (WEAK_SECRETS.includes(secret)) return false;
  return secret.length >= 32;
};

// 开发环境：仅警告；生产环境：拒绝启动
if (!isStrongSecret(JWT_SECRET)) {
  const msg = `[安全警告] JWT_SECRET 弱密钥（当前长度 ${JWT_SECRET.length}），生产环境必须配置 ≥32 字节强随机密钥`;
  if (process.env.NODE_ENV === 'prd') {
    throw new Error(msg + '，已拒绝启动');
  }
  console.warn('\x1b[33m' + msg + '\x1b[0m');
}

/**
 * 把 JWT 过期时间字符串解析为毫秒数
 * 支持 jwt 库 expiresIn 的全部格式：
 *   - 纯数字：当作秒处理（如 3600 → 1 小时）
 *   - 数字+单位：s/m/h/d/w（如 "1d" → 1 天、"7d" → 7 天、"12h" → 12 小时）
 * 解析失败时回退到 1 天，与 JWT_EXPIRES_IN 默认值一致
 * @param {string|number} expiresIn
 * @returns {number} 毫秒
 */
const parseExpiresInToMs = (expiresIn) => {
  const FALLBACK = 24 * 60 * 60 * 1000; // 1 天
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    return Math.max(0, expiresIn * 1000); // 数字按秒处理
  }
  if (typeof expiresIn !== 'string') return FALLBACK;
  const m = expiresIn.trim().match(/^(\d+(?:\.\d+)?)\s*([smhdw])?$/i);
  if (!m) return FALLBACK;
  const num = parseFloat(m[1]);
  const unit = (m[2] || 's').toLowerCase();
  const factor = { s: 1000, m: 60 * 1000, h: 3600 * 1000, d: 86400 * 1000, w: 7 * 86400 * 1000 }[unit];
  return Math.max(0, num * factor);
};

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  JWT_REFRESH: process.env.JWT_REFRESH || false, //是否开启刷新token
  // 从 JWT_EXPIRES_IN 派生：登录 cookie（ut / loggedIn / un / _f）的 maxAge 必须与 JWT 同步，
  // 否则 JWT 过期后 cookie 仍存活，前端判登录态（loggedIn）失真，按钮可点但请求 1001 失败
  JWT_COOKIE_MAXAGE_MS: parseExpiresInToMs(process.env.JWT_EXPIRES_IN || "1d"),
};

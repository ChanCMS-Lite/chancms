/**
 * 登录失败次数限制（IP + 账号 复合维度）
 *
 * 策略：
 *   - 失败 5 次后锁定 1 小时
 *   - 锁定期间直接拒绝登录
 *   - 登录成功清空对应 key
 *
 * 复合维度说明：
 *   单账号限流无法防御"用同一密码撞多个账号"的撞库攻击；
 *   单 IP 限流可能误伤 NAT 后的多用户。
 *   故采用 (ip, username) 复合 key，同一 IP 对同一账号的失败累积锁定，
 *   不影响该 IP 访问其他账号，也不影响其他 IP 访问该账号。
 *
 * 存储：
 *   - login:fail:${ip}:${username}  失败计数（TTL 1 小时）
 *   - login:lock:${ip}:${username}  锁定标记（TTL 1 小时）
 */
import { store } from "chanjs/storage/index.js";
import { rateLimit } from "../../config/ratelimit.js";

export const MAX_FAIL_COUNT = rateLimit.loginFail.maxFail;        // 最大失败次数
const LOCK_DURATION = rateLimit.loginFail.lockMs;          // 锁定时长

/**
 * 构造复合 key
 * ip / username 任一为空时仍以另一维度限流（防止攻击者通过不传 username 绕过）
 * @param {string} ip
 * @param {string} username
 * @returns {string} 复合 key 后缀
 */
function compositeKey(ip, username) {
  return `${ip || ""}:${username || ""}`;
}

/**
 * 检查 (ip, username) 是否已被锁定
 * @param {string} ip - 客户端 IP
 * @param {string} username - 用户名/邮箱
 * @returns {Promise<{locked: boolean, retryAfter?: number}>}
 */
export async function checkLoginLocked(ip, username) {
  if (!ip && !username) return { locked: false };

  const lockInfo = await store.get(`login:lock:${compositeKey(ip, username)}`);
  if (lockInfo) {
    const retryAfter = Math.ceil((lockInfo.expireAt - Date.now()) / 60000);
    return { locked: true, retryAfter: Math.max(1, retryAfter) };
  }
  return { locked: false };
}

/**
 * 记录一次登录失败
 * 达到阈值时自动锁定
 * @param {string} ip - 客户端 IP
 * @param {string} username - 用户名/邮箱
 * @returns {Promise<{failCount: number, locked: boolean}>}
 */
export async function recordLoginFail(ip, username) {
  if (!ip && !username) return { failCount: 0, locked: false };

  const suffix = compositeKey(ip, username);
  const failCount = await store.incrAndExpire(`login:fail:${suffix}`, LOCK_DURATION);

  // 达到阈值，写入锁定标记
  if (failCount >= MAX_FAIL_COUNT) {
    await store.set(
      `login:lock:${suffix}`,
      { expireAt: Date.now() + LOCK_DURATION },
      LOCK_DURATION
    );
    return { failCount, locked: true };
  }

  return { failCount, locked: false };
}

/**
 * 登录成功时清空对应 (ip, username) 的失败计数与锁定标记
 * @param {string} ip - 客户端 IP
 * @param {string} username - 用户名/邮箱
 */
export async function clearLoginFail(ip, username) {
  if (!ip && !username) return;

  const suffix = compositeKey(ip, username);
  await store.del(`login:fail:${suffix}`);
  await store.del(`login:lock:${suffix}`);
}

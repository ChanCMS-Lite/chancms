/**
 * 邮箱验证码「校验失败」锁定（按邮箱维度）
 *
 * 背景：`/register`、`/resetPass` 走 verifycode 中间件校验 6 位邮箱验证码，
 *   原先没有任何失败计数 → 同一个码可在 5 分钟有效期内无限次猜（6 位仅 90 万种，
 *   高并发下可爆破成功，配合 resetPass 即账号接管）。
 *
 * 策略：
 *   - 同一邮箱累计猜错 maxFail 次 → 锁定 lockMs，期间校验一律拒绝（含正确的码）
 *   - 重新获取验证码（VerificationCode.generateAndSave）会清空计数 → 用户可自助解锁
 *   - 校验成功清空计数
 *
 * 维度选择：按 email 而非 (ip,email)。
 *   验证码归属邮箱，换 IP 不能获得新的猜测次数；
 *   代价是攻击者可恶意锁定他人邮箱，但重新获取验证码即解锁（自愈），且
 *   发码本身受 sendEmail 的同邮箱 60s 间隔 + 每 IP 每日上限约束，无法无限续猜。
 *
 * 存储：
 *   - vcode:fail:${email}  猜错计数（TTL = lockMs）
 *   - vcode:lock:${email}  锁定标记（TTL = lockMs）
 */
import { store } from "chanjs/storage/index.js";
// ratelimit.js 在仓库根 config/（非 app/config/）；本文件位于 app/modules/member/common/，需 4 级上溯
import { rateLimit } from "../../../../config/ratelimit.js";

export const MAX_VCODE_FAIL = rateLimit.verifyCodeFail.maxFail;
const LOCK_DURATION = rateLimit.verifyCodeFail.lockMs;

const failKey = (email) => `vcode:fail:${email}`;
const lockKey = (email) => `vcode:lock:${email}`;

/**
 * 该邮箱是否处于验证码校验锁定期
 * @param {string} email
 * @returns {Promise<{locked: boolean, retryAfter?: number}>} retryAfter 单位分钟
 */
export async function checkVcodeLocked(email) {
  if (!email) return { locked: false };
  const lockInfo = await store.get(lockKey(email));
  if (!lockInfo) return { locked: false };
  const retryAfter = Math.ceil((lockInfo.expireAt - Date.now()) / 60000);
  return { locked: true, retryAfter: Math.max(1, retryAfter) };
}

/**
 * 记录一次验证码校验失败；达到阈值自动锁定
 * @param {string} email
 * @returns {Promise<{failCount: number, locked: boolean, remain: number}>} remain 为剩余可尝试次数
 */
export async function recordVcodeFail(email) {
  if (!email) return { failCount: 0, locked: false, remain: MAX_VCODE_FAIL };
  const failCount = await store.incrAndExpire(failKey(email), LOCK_DURATION);
  if (failCount >= MAX_VCODE_FAIL) {
    await store.set(lockKey(email), { expireAt: Date.now() + LOCK_DURATION }, LOCK_DURATION);
    return { failCount, locked: true, remain: 0 };
  }
  return { failCount, locked: false, remain: MAX_VCODE_FAIL - failCount };
}

/**
 * 清空该邮箱的失败计数与锁定标记（校验成功 / 重新发码时调用）
 * @param {string} email
 */
export async function clearVcodeFail(email) {
  if (!email) return;
  await store.del(failKey(email));
  await store.del(lockKey(email));
}
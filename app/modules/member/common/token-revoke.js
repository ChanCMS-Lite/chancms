/**
 * 用户级 token 吊销（跨设备强制下线）
 *
 * 背景：框架的 revokeToken 只能吊销「单个 token 字符串」（jwt:revoked:<token>），
 *   无法回答"这个用户改密前签发的所有 token 是否还有效"。
 *   改密/重置密码后，攻击者此前拿到的会话依然可用 → 需要用户级吊销。
 *
 * 方案（零改表、零改框架）：
 *   1. 改密成功后写入「吊销水位线」：auth:revoke_before:<uid> = 时间戳(ms)
 *   2. 鉴权中间件解析 token 后比对 payload.iat：
 *      签发时间早于水位线 → 视为已吊销
 *   3. 水位线 TTL = token 最大存活时长，保证能覆盖所有在途旧 token
 *
 * 说明：新登录签发的 token 的 iat 必然晚于水位线，因此不受影响，无需在登录时清理。
 */
import { store } from "chanjs/storage/index.js";

const key = (uid) => `auth:revoke_before:${uid}`;

/**
 * 吊销某用户「此刻之前」签发的全部 token
 * @param {number|string} uid
 * @param {number} ttlMs 水位线存活时长（应 ≥ token 最大存活时长）
 */
export async function revokeUserTokensBefore(uid, ttlMs) {
  if (!uid) return false;
  const ttl = Number(ttlMs) > 0 ? Number(ttlMs) : 24 * 60 * 60 * 1000;
  await store.set(key(uid), Date.now(), ttl);
  return true;
}

/**
 * 判断该 token 是否在水位线之前签发（即已被吊销）
 * @param {number|string} uid
 * @param {number} iat token 的签发时间（秒，JWT 标准 payload.iat）
 * @returns {Promise<boolean>}
 */
export async function isUserTokenRevoked(uid, iat) {
  if (!uid || !iat) return false;
  const revokedAt = await store.get(key(uid));
  if (!revokedAt) return false;
  return iat * 1000 < revokedAt;
}
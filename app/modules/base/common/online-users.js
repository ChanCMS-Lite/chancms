/**
 * 在线用户追踪（零建表，基于 chanjs store 统一存储）
 * ---------------------------------------------------------------
 * 背景：框架 store 仅暴露 get/set/del（无 Redis Set 的 SADD/SREM），
 *   故用单个 JSON 键 `online:users` 存「token → 会话信息」映射，
 *   登录时写入、登出/强退时移除，列表读取时按 exp 惰性清理过期项。
 *
 * 降级语义：store 本身已内置「Redis 不可用 → 内存 LRU」降级与熔断，
 *   这里不再重复 try/catch 吞错；任何异常都返回空数组/空操作，
 *   保证在线用户页在缓存基础设施故障时不崩（仅展示为空）。
 *
 * 键设计：
 *   online:users  → JSON: { [token]: { uid, username, ip, loginTime(ms), exp(s) } }
 */
import { store } from "chanjs/storage/index.js";
import { logger } from "chanjs";

const MAP_KEY = "online:users";
// 映射键本身的 TTL：取最长可能会话（24h），过期自动整体清空，避免长期残留
const MAP_TTL = 24 * 60 * 60 * 1000;

/** 从 JWT 串解析 payload.exp（秒）；解析失败返回 0 */
function readJwtExp(token) {
  try {
    const parts = String(token).split(".");
    if (parts.length < 2) return 0;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return Number(payload.exp) || 0;
  } catch {
    return 0;
  }
}

async function readMap() {
  try {
    const raw = await store.get(MAP_KEY);
    if (!raw) return {};
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    logger.warn("[online-users] 读取在线映射失败:", e.message);
    return {};
  }
}

async function writeMap(map) {
  try {
    await store.set(MAP_KEY, JSON.stringify(map), MAP_TTL);
  } catch (e) {
    logger.warn("[online-users] 写入在线映射失败:", e.message);
  }
}

/**
 * 登录成功后登记一个在线会话
 * @param {string} token 登录签发的 token
 * @param {{uid:number|string, username:string, ip:string}} info
 */
export async function trackOnline(token, info) {
  if (!token) return;
  const map = await readMap();
  map[token] = {
    uid: info.uid,
    username: info.username,
    ip: info.ip || "",
    loginTime: Date.now(),
    exp: readJwtExp(token),
  };
  await writeMap(map);
}

/**
 * 登出时移除一个在线会话
 * @param {string} token
 */
export async function untrackOnline(token) {
  if (!token) return;
  const map = await readMap();
  if (map[token]) {
    delete map[token];
    await writeMap(map);
  }
}

/**
 * 列出当前在线会话（惰性清理已过期项）
 * @returns {Promise<Array<{token,uid,username,ip,loginTime,exp}>>}
 */
export async function listOnline() {
  const map = await readMap();
  const nowSec = Math.floor(Date.now() / 1000);
  const list = [];
  let changed = false;
  for (const [token, sess] of Object.entries(map)) {
    if (sess.exp && sess.exp < nowSec) {
      delete map[token];
      changed = true;
      continue;
    }
    list.push({ token, ...sess });
  }
  if (changed) await writeMap(map);
  // 按登录时间倒序（最新在前）
  list.sort((a, b) => (b.loginTime || 0) - (a.loginTime || 0));
  return list;
}

/**
 * 按 token 移除会话（强退后调用）
 * @param {string[]} tokens
 */
export async function removeTokens(tokens) {
  const set = new Set(tokens.filter(Boolean));
  if (set.size === 0) return;
  const map = await readMap();
  let changed = false;
  for (const token of set) {
    if (map[token]) {
      delete map[token];
      changed = true;
    }
  }
  if (changed) await writeMap(map);
}

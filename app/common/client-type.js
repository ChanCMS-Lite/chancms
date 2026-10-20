/**
 * 客户端类型统一判定
 *
 * 前端通过标准 header `x-client-type` 声明自身类型，后端据此决定 token 下发方式：
 *   - miniprogram：小程序（不支持 cookie，token 走 body 返回由前端存 Storage）
 *   - app：原生 App（同 miniprogram，走 body）
 *   - h5：浏览器/H5（token 经非 HttpOnly cookie 下发，前端 axios withCredentials 自动携带）
 *
 * 以 header 为准，不做 UA 分支。
 *    仅保留一处最小 UA 兜底，兼容尚未升级、未带 header 的旧小程序客户端；
 *    新客户端一律带 x-client-type，该兜底后续可删除。
 */

const VALID = new Set(["miniprogram", "app", "h5"]);

/**
 * 判定客户端类型
 * @param {Object} req - Express 请求对象
 * @returns {"miniprogram"|"app"|"h5"}
 */
export function getClientType(req) {
  const header = String(req?.headers?.["x-client-type"] || "")
    .toLowerCase()
    .trim();
  if (VALID.has(header)) return header;

  // 遗留兼容：旧小程序客户端未带 header，靠 UA 兜底（仅兼容，非主路径）
  const ua = String(req?.headers?.["user-agent"] || "").toLowerCase();
  if (/miniProgram/i.test(ua)) return "miniprogram";

  return "h5"; // 默认 Web/H5：cookie 下发
}

export default getClientType;

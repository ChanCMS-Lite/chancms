import { getApp, logger } from "chanjs";
import { store } from "chanjs/storage/index.js";
import { listOnline, removeTokens } from "../common/online-users.js";

/**
 * 在线用户服务（只读 + 强退）
 * ---------------------------------------------------------------
 * 不建表：在线会话来自 common/online-users.js 维护的内存/Redis 映射。
 * 强退 = 把目标 token 写入黑名单（blacklist:${token}，TTL 取 token 剩余有效期），
 *        与 logout/改密同一套机制，auth 中间件下一步鉴权即拒绝。
 */
class SysOnlineService {
  /**
   * 在线用户列表
   * @returns {Promise<{success:boolean,code:number,msg:string,data:{list:Array,total:number,mode:string}}>}
   */
  async list() {
    try {
      const rows = await listOnline();
      const list = rows.map((r) => ({
        token: r.token,
        uid: r.uid,
        username: r.username,
        ip: r.ip,
        loginTime: r.loginTime ? new Date(r.loginTime).toISOString() : null,
        exp: r.exp ? new Date(r.exp * 1000).toISOString() : null,
      }));
      return {
        success: true,
        code: 0,
        msg: "查询成功",
        data: { list, total: list.length, mode: store.getInfo().mode },
      };
    } catch (e) {
      logger.error("[SysOnline.list] 查询出错:", e.message);
      return { success: false, code: 5001, msg: "查询失败", data: { list: [], total: 0, mode: "unknown" } };
    }
  }

  /**
   * 强退：按 token 或 userId 吊销会话
   * @param {{token?:string, userId?:number|string}} param
   * @returns {Promise<{success:boolean,code:number,msg:string,data?:object}>}
   */
  async kick({ token, userId } = {}) {
    try {
      const rows = await listOnline();
      let targets = rows;
      if (token) {
        targets = rows.filter((r) => r.token === token);
      } else if (userId !== undefined && userId !== null && userId !== "") {
        targets = rows.filter((r) => String(r.uid) === String(userId));
      } else {
        return { success: false, code: 1007, msg: "token 与 userId 至少传一个" };
      }

      if (targets.length === 0) {
        return { success: false, code: 1008, msg: "未找到在线会话（可能已过期或已退出）" };
      }

      const secret = getApp()?.config?.JWT_SECRET;
      const nowSec = Math.floor(Date.now() / 1000);
      const kicked = [];
      for (const r of targets) {
        // 写黑名单（TTL 取 token 剩余有效期；过期项直接跳过）
        if (r.exp && r.exp > nowSec && secret) {
          const ttl = (r.exp - nowSec) * 1000;
          try {
            await store.set(`blacklist:${r.token}`, "1", ttl);
          } catch (e) {
            logger.warn("[SysOnline.kick] 写黑名单失败:", e.message);
          }
        }
        kicked.push(r.token);
      }
      // 从在线映射移除
      await removeTokens(kicked);

      return { success: true, code: 0, msg: `已强制下线 ${targets.length} 个会话`, data: { count: targets.length } };
    } catch (e) {
      logger.error("[SysOnline.kick] 失败:", e.message);
      throw e;
    }
  }
}

export default new SysOnlineService();

/**
 * 邮箱验证码 Service
 * 基于 member_verification_codes 表，替代旧的 genCode + cookie 方案
 *
 * 表结构：
 *   id, email(唯一), code(6位), status(1未使用/2已使用/3已过期),
 *   created_at, updated_at, expires_at
 *
 * 安全特性：
 *   1. 服务端 crypto.randomInt 生成，不可预测
 *   2. 数据库存储，客户端无法伪造
 *   3. 5分钟过期，用完即焚（status=2）
 *   4. email 唯一索引，同邮箱新码覆盖旧码
 */
import { Repository } from "chanjs";
import crypto from "crypto";
import { clearVcodeFail } from "../common/verifycode-limit.js";

// 验证码有效期 5 分钟
const CODE_TTL_MINUTES = 5;

// 常量时间字符串比较，防止验证码时序攻击
// 长度不一致直接返回 false，长度一致时用 crypto.timingSafeEqual 比较
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

class VerificationCodeService extends Repository {
  constructor() {
    super("member_verification_codes");
  }

  /**
   * 生成并保存验证码
   * @param {string} email - 邮箱
   * @returns {Promise<string>} 6位随机验证码
   */
  async generateAndSave(email) {
    const code = String(crypto.randomInt(100000, 1000000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000);

    // email 唯一索引（udx_email_scene）：存在则更新，不存在则插入（upsert）
    // 注意：Knex 原生不支持 .onDuplicateUpdate()，MySQL 下用 .onConflict('email').merge() 生成 ON DUPLICATE KEY UPDATE
    await this.db(this.tableName)
      .insert({ email, code, status: 1, created_at: now, expires_at: expiresAt })
      .onConflict('email')
      .merge({
        code,
        status: 1,
        created_at: now,
        expires_at: expiresAt,
      });

    // 新码下发即重置猜错计数：用户"重新获取验证码"可自助解除 15 分钟锁定
    // （续猜漏洞由 sendEmail 的同邮箱 60s 间隔 + 每 IP 每日上限兜住，无法无限续猜）
    await clearVcodeFail(email);

    return code;
  }

  /**
   * 匹配有效验证码（未使用且未过期且码值正确），不做任何消费
   * @param {string} email - 邮箱
   * @param {string} code - 待校验的验证码
   * @returns {Promise<{ok: boolean, msg: string, record?: Object}>}
   */
  async #match(email, code) {
    if (!email || !code) {
      return { ok: false, msg: "邮箱或验证码不能为空" };
    }

    // 取最新一条未使用且未过期的验证码
    const record = await this.db(this.tableName)
      .where({ email, status: 1 })
      .where("expires_at", ">", new Date())
      .orderBy("created_at", "desc")
      .first();

    if (!record) {
      return { ok: false, msg: "验证码不存在或已过期" };
    }

    if (!safeEqual(record.code, code)) {
      return { ok: false, msg: "验证码错误" };
    }

    return { ok: true, msg: "验证码正确", record };
  }

  /**
   * 校验验证码（校验成功后自动置为已使用）
   * @param {string} email - 邮箱
   * @param {string} code - 待校验的验证码
   * @returns {Promise<{valid: boolean, msg: string}>}
   */
  async verify(email, code) {
    const r = await this.#match(email, code);
    if (!r.ok) {
      return { valid: false, msg: r.msg };
    }

    // 校验成功，置为已使用
    await this.db(this.tableName)
      .where({ id: r.record.id })
      .update({ status: 2 });

    return { valid: true, msg: r.msg };
  }

  /**
   * 校验验证码（仅校验，不消费）
   * 用于 checkEmail 步骤的“预校验”：确认验证码正确但不置为已使用，
   * 真正的消费（status=2）留给后续 resetPass 的 verifycode 中间件，
   * 避免 checkEmail 消费后 resetPass 再校验时报“验证码不存在或已过期”(1008)。
   * @param {string} email - 邮箱
   * @param {string} code - 待校验的验证码
   * @returns {Promise<{valid: boolean, msg: string}>}
   */
  async verifyPeek(email, code) {
    const r = await this.#match(email, code);
    return { valid: r.ok, msg: r.msg };
  }

  /**
   * 惰性清理过期验证码（status=1 但已过期 → status=3）
   * 可在 sendEmail 时顺带调用，避免定时任务
   */
  async cleanExpired() {
    await this.db(this.tableName)
      .where({ status: 1 })
      .where("expires_at", "<", new Date())
      .update({ status: 3 });
  }
}

export default new VerificationCodeService();

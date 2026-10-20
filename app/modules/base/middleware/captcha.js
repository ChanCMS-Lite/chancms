/**
 * 图形验证码中间件
 *
 * 提供：
 *   - generateCaptcha：生成验证码接口 handler（GET /base/captcha、GET /member/captcha）
 *   - verifyCaptcha：校验工具函数（在登录 controller 内调用，避免中间件顺序耦合）
 *
 * 存储：
 *   key: captcha:<sessionId>  TTL 5 分钟
 *   一次性消费：只要请求带了 sessionId，无论校验通过与否都立即删除，防止重放
 *
 * key 不拼客户端 IP，只用 sessionId：IP 会因换网/切 4G/IPv6 轮换/开关代理而抖动，
 *    拼 IP 会导致「取码」与「提交」两次请求 key 不一致 → 验证码频繁误报过期；
 *    而 sessionId 是 crypto.randomUUID()（122bit 随机），不可枚举也不可猜测，
 *    再拼 IP 不增加安全性、只损失可用性。`captcha:passed:` 标记同样不带 IP。
 *
 * 安全：
 *   - 使用 crypto.timingSafeEqual 常量时间比较，防时序爆破
 *   - ignoreChars 排除易混字符 0/o/1/i/l/I
 */
import svgCaptcha from "svg-captcha";
import crypto from "node:crypto";
import { store } from "chanjs/storage/index.js";
import { fail, success, logger } from "chanjs";


// helper.fail/success 是函数式响应（response/index.js），与 Controller.this.fail 对齐

// 验证码有效期 5 分钟
const CAPTCHA_TTL = 5 * 60 * 1000;

/**
 * 生成图形验证码
 * 路由：GET /base/captcha、GET /member/captcha
 * 返回：{ success, code, data: { sessionId, data: svgXml } }
 */
export async function generateCaptcha(req, res) {
  try {
    const sessionId = crypto.randomUUID();

    // 生成 svg 验证码
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: "0o1ilI",
      noise: 2,
      color: true,
      background: "#f0f0f0",
    });

    // 文本存 store，统一转小写，便于后续不区分大小写比较
    await store.set(
      `captcha:${sessionId}`,
      String(captcha.text).toLowerCase(),
      CAPTCHA_TTL
    );

    res.json(
      success({
        data: { sessionId, data: captcha.data },
      })
    );
  } catch (err) {
    logger.error("[captcha.generateCaptcha]", err.message);
    res.json(fail({ msg: "验证码生成失败" }));
  }
}

/**
 * 校验验证码（供登录 controller 调用）
 *
 * 一次性语义：**只要请求带了 sessionId 就立即销毁该 key** ——
 *   不论验证码是否还在（已过期 / 已被用过）、是否填了、校验是否通过。
 *   这样任何一次提交都不会在 store 里留下可重放的条目。
 *
 * @param {Object} req - Express 请求对象
 * @returns {Promise<{ok: boolean, msg: string}>}
 */
export async function verifyCaptcha(req) {
  const { sessionId, captcha } = req.body || {};

  if (!sessionId) {
    return { ok: false, msg: "请输入验证码" };
  }

  const key = `captcha:${sessionId}`;
  const serverText = await store.get(key);

  // 一次性消费：先销毁再比对，杜绝任何失败路径上的重放窗口
  if (serverText) await store.del(key);

  if (!serverText) {
    return { ok: false, msg: "验证码已过期，请刷新" };
  }

  if (!captcha) {
    return { ok: false, msg: "请输入验证码" };
  }

  // 常量时间比较，防时序攻击
  const a = String(serverText).toLowerCase();
  const b = String(captcha).toLowerCase();
  const equal =
    a.length > 0 &&
    a.length === b.length &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

  if (!equal) {
    return { ok: false, msg: "验证码错误" };
  }

  return { ok: true, msg: "" };
}

/**
 * 前端登录前置：预校验图形验证码（消费式，防重放/爆破）
 * 校验通过后写入一次性 passed 标记（与验证码等时长），供 login 跳过二次比对；
 * login 自身仍保留 verifyCaptcha 兜底，直接调用登录接口时同样需要验证码。
 */
export async function preCheckCaptcha(req) {
  const result = await verifyCaptcha(req); // 消费验证码 key（不论对错都删）
  if (!result.ok) return result;
  const { sessionId } = req.body || {};
  if (sessionId) {
    await store.set(`captcha:passed:${sessionId}`, "1", CAPTCHA_TTL);
  }
  return { ok: true, msg: "" };
}

/**
 * 读取并消费「预校验通过」标记（供 login 使用）
 * 存在则返回 true 并删除，login 据此跳过图形验证码二次比对；
 * 不存在（直接调用 / 旧前端 / 标记过期）返回 false，login 将自行校验验证码。
 */
export async function consumeCaptchaPassed(req) {
  const { sessionId } = req.body || {};
  if (!sessionId) return false;
  const key = `captcha:passed:${sessionId}`;
  const v = await store.get(key);
  if (v) {
    await store.del(key);
    return true;
  }
  return false;
}

export default {
  generateCaptcha,
  verifyCaptcha,
  preCheckCaptcha,
  consumeCaptchaPassed,
};

/**
 * 邮箱验证码校验中间件
 * 从数据库校验验证码（替代旧的 genCode + cookie _c 方案）
 *
 * 前端需在 body 中传 email + code
 * 校验通过后验证码自动失效（status=2），防止重放
 *
 * 安全：叠加「猜错次数」锁定（见 common/verifycode-limit.js），
 *       同一邮箱累计猜错 5 次锁 15 分钟，防止 6 位码被暴力猜解。
 */
import { logger } from "chanjs";
import VerificationCode from "../service/VerificationCode.js";
import { rateLimit } from "../../../../config/ratelimit.js";
import {
  checkVcodeLocked,
  recordVcodeFail,
  clearVcodeFail,
} from "../common/verifycode-limit.js";

// 锁定时长（分钟），用于提示文案
const LOCK_MINUTES = Math.ceil(rateLimit.verifyCodeFail.lockMs / 60000);

export default async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.json({ code: 1006, success: false, msg: "邮箱和验证码不能为空", data: {} });
    }

    // 0. 锁定期间直接拒绝（即使码正确也拒绝，避免"猜中就赢"）
    const lock = await checkVcodeLocked(email);
    if (lock.locked) {
      return res.json({
        code: 1008,
        success: false,
        msg: `验证码错误次数过多，请 ${lock.retryAfter} 分钟后重试，或重新获取验证码`,
        data: { code: "VCODE_LOCKED" },
      });
    }

    const result = await VerificationCode.verify(email, code);
    if (!result.valid) {
      // 猜错计数：达阈值则锁定
      const fail = await recordVcodeFail(email);
      return res.json({
        code: 1008,
        success: false,
        msg: fail.locked
          ? `验证码错误次数过多，请 ${LOCK_MINUTES} 分钟后重试，或重新获取验证码`
          : `${result.msg}（还可尝试 ${fail.remain} 次）`,
        data: fail.locked ? { code: "VCODE_LOCKED" } : {},
      });
    }

    // 校验成功：清空猜错计数
    await clearVcodeFail(email);
    next();
  } catch (err) {
    logger.error("[verifycode middleware]", err);
    return res.json({ code: 5001, success: false, msg: "验证码校验异常", data: {} });
  }
};

import { Controller, getToken, revokeToken, logger, getApp } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { getIp, formatDateFields } from "chanjs/utils/index.js";
import { store } from "chanjs/storage/index.js";
import { rateLimit } from "../../../../config/ratelimit.js";
import bcrypt from "bcrypt";
import { verifyCaptcha, consumeCaptchaPassed } from "../../base/middleware/captcha.js";
import { checkLoginLocked, recordLoginFail, clearLoginFail, MAX_FAIL_COUNT } from "../../../common/login-limit.js";
import {
  checkVcodeLocked,
  recordVcodeFail,
  clearVcodeFail,
} from "../common/verifycode-limit.js";
import { validated } from "../../../common/validate.js";
import { issueMemberSession } from "../../../common/auth-cookie.js";
import { getClientType } from "../../../common/client-type.js";
import { revokeUserTokensBefore } from "../common/token-revoke.js";
import {
  sendMail,
  genRegEmailHtml,
  genResetPasswordEmail,
  genEmailTakenNotice,
  genEmailNotRegisteredNotice,
} from "../../../common/email.js";
import {
  loginSchema,
  registerSchema,
  sendEmailSchema,
  resetPassSchema,
  updatePassSchema,
  updateUserSchema,
  updateStatusSchema,
  adminDetailSchema,
  listSchema,
  searchSchema,
} from "../validator/Member.js";


// 判断是否小程序客户端（小程序不支持 cookie，需通过 body 返回 token）
// 统一用 x-client-type header 判定，详见 common/client-type.js
const isMiniProgram = (req) => getClientType(req) === "miniprogram";

// 防时序枚举用的哑 bcrypt 哈希（"password" 的合法哈希）：
// 用户不存在时也做一次等价 bcrypt.compare，使响应时间与「密码错误」路径一致
const DUMMY_BCRYPT_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

class MemberController extends Controller {
  constructor() {
    super();
    this.Member = this.get("member", "Member", "service");   // 一次性预取，方法内 await 复用
    this.VerificationCode = this.get("member", "VerificationCode", "service");   // 一次性预取，方法内 await 复用
  }


  /**
   * @description 发送邮件验证码
   *   安全策略：
   *     1. 同邮箱 60s 发送间隔（防邮件轰炸）
   *     2. 单 IP 每日最多 5 次
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async sendEmail(req, res, next) {
    try {
      const Member = await this.Member;
      const VerificationCode = await this.VerificationCode;
      const data = validated(sendEmailSchema, req.body, res, this);
      if (data === undefined) return;
      const { email, type } = data;

      // 1. 同邮箱发送间隔限制（阈值在 config/ratelimit.js 的 sendEmail.intervalMs）
      const emailKey = `email:interval:${email}`;
      const lastSent = await store.get(emailKey);
      if (lastSent) {
        return res.json(this.fail({ msg: "发送太频繁，请60秒后再试" }));
      }

      // 2. IP 维度限流：每日上限（阈值在 config/ratelimit.js 的 sendEmail.maxPerIpPerDay）
      const ip = getIp(req);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const limitKey = `email:limit:${ip}:${today}`;
      const count = await store.incrAndExpire(limitKey, 24 * 60 * 60 * 1000);
      if (count > rateLimit.sendEmail.maxPerIpPerDay) {
        return res.json(this.fail({
          msg: `今日邮件发送次数已达上限（${rateLimit.sendEmail.maxPerIpPerDay}次），请明天再试`,
        }));
      }

      // 3. 邮箱状态判定（register 查是否已注册 / reset 查是否已注册）
      //
      //    安全口径：判定结果**绝不回显到接口响应里**——若直接返回「该邮箱已被注册」/
      //    「该邮箱未注册」，攻击者用邮箱字典批量试探即可拿到真实注册用户名单（邮箱枚举）。
      //    因此不论邮箱处于哪种状态，响应文案完全一致；
      //    差异只写进「只有邮箱主人本人能收到」的那封提示邮件里。
      let noticeHtml = "";
      if (type === "register" || type === "reset") {
        const existing = await Member.findUserByField(email, "email");
        const registered = !!(existing.success && existing.data?.id);
        if (type === "register" && registered) noticeHtml = genEmailTakenNotice();
        if (type === "reset" && !registered) noticeHtml = genEmailNotRegisteredNotice();
      }

      const { EMAIL } = getApp()?.config || {};

      // 4. 邮箱状态与场景不符 → 只发状态提示邮件，不生成验证码
      //    （已注册邮箱去注册、未注册邮箱去重置，都不存在可校验的验证码）
      if (noticeHtml) {
        await sendMail(email, EMAIL?.SUBJECT_NOTICE || "账户状态提示", noticeHtml);
        // 同样占用发送间隔，避免被用来刷发信额度
        await store.set(emailKey, "1", rateLimit.sendEmail.intervalMs);
        return res.json(this.success({ data: "邮件发送成功，请查收" }));
      }

      // 5. 生成随机验证码并入库（5分钟过期，email唯一索引保证同邮箱新码覆盖旧码）
      const code = await VerificationCode.generateAndSave(email);

      // 惰性清理过期验证码
      VerificationCode.cleanExpired().catch((err) =>
        logger.error("[VerificationCode.cleanExpired]", err.message)
      );

      // 6. 发送邮件
      if (type === "register") {
        await sendMail(email, EMAIL?.SUBJECT_REG || "注册验证码", genRegEmailHtml(code));
      } else {
        await sendMail(email, EMAIL?.SUBJECT_RESET || "修改密码验证码", genResetPasswordEmail(code));
      }

      // 7. 设置发送间隔标记（时长与 config/ratelimit.js 的 sendEmail.intervalMs 一致）
      await store.set(emailKey, '1', rateLimit.sendEmail.intervalMs);

      res.json(this.success({ data: "邮件发送成功，请查收" }));
    } catch (err) {
      logger.error("[Member.sendEmail]", err);
      next(err);
    }
  }

  /**
   * @description 登录
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async login(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(loginSchema, req.body, res, this);
      if (data === undefined) return;
      const { username, password } = data;
      const ip = getIp(req);

      // 1. 校验图形验证码（req.body.sessionId + req.body.captcha）
      //     优先消费前端预校验 passed 标记（前端已先行校验，避免无谓登录请求）；
      //     无标记（直接调用 / 旧前端 / 标记过期）则自行校验，保证接口独立安全。
      const captchaPassed = await consumeCaptchaPassed(req);
      if (!captchaPassed) {
        const captchaResult = await verifyCaptcha(req);
        if (!captchaResult.ok) {
          return res.json(this.fail({ msg: captchaResult.msg, code: 1006 }));
        }
      }

      // 2. 登录失败锁定检查（IP + 账号 复合维度）
      const lockStatus = await checkLoginLocked(ip, username);
      if (lockStatus.locked) {
        return res.json(this.fail({
          msg: `账号已被锁定，请${lockStatus.retryAfter}分钟后重试`,
        }));
      }

      let queryField = "username";
      if (username && username.includes("@")) {
        queryField = "email";
      }

      const result = await Member.findUserByField(username, queryField);
      if (result.success && result.data) {
        let user = result.data;
        if (!user.id) {
          const { failCount } = await recordLoginFail(ip, username);
          // 防枚举：统一文案，不区分「用户不存在/密码错误」
          return res.json(this.fail({
            msg: `用户名或密码错误，剩余尝试次数 ${Math.max(0, MAX_FAIL_COUNT - failCount)}`,
          }));
        }
        const match = await bcrypt.compare(password, user.password);
        if (user && match) {
          // 注意：不能解构 username，会遮蔽外层用于限流的 username（可能是 email）
          const { id, status, avatar, nickname } = user;

          // status 为 varchar，库里存的是字符串 "1"；统一 String() 比较，避免数字/字符串类型不一致误判禁用
          if (String(status) !== "1") {
            return res.json(this.fail({ msg: "账号已被禁用，请联系管理员" }));
          }

          // 3. 登录成功，清空对应 (ip, username) 的失败计数
          // 使用外层 username（登录输入值，可能是 email），与 recordLoginFail 的 key 保持一致
          await clearLoginFail(ip, username);

          const minApp = isMiniProgram(req);

          // token 签发 + cookie 下发收敛（fp 兜底 → setToken → cookie，见 common/auth-cookie.js）
          // Web 端：token 经非 HttpOnly cookie 下发（统一登录态方案）
          // 小程序端：不支持 cookie，token 经 body 返回由前端存 Storage
          const { token } = issueMemberSession({
            req,
            res,
            config: this.config,
            uid: id,
            username: user.username,
            ip,
            setCookies: !minApp,
          });

          res.json(this.success({
            data: minApp
              ? { id, username: user.username, status, avatar, nickname, token }
              : { id, username: user.username, status, avatar, nickname }
          }));
        } else {
          const { failCount, locked } = await recordLoginFail(ip, username);
          if (locked) {
            return res.json(this.fail({ msg: "密码错误次数过多，账号已被锁定1小时" }));
          }
          // 防枚举：与「用户不存在」同文案
          return res.json(this.fail({
            msg: `用户名或密码错误，剩余尝试次数 ${Math.max(0, MAX_FAIL_COUNT - failCount)}`,
          }));
        }
      } else {
        const { failCount } = await recordLoginFail(ip, username);
        // 防时序：用户不存在也做一次等价 bcrypt 比较，抹平时序差
        await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
        res.json(this.fail({
          msg: `用户名或密码错误，剩余尝试次数 ${Math.max(0, MAX_FAIL_COUNT - failCount)}`,
        }));
      }
    } catch (err) {
      logger.error("MemberController.login-->", err);
      next(err);
    }
  }

  /**
   * @description 注册
   *   流程优化：
   *     1. 用户名/邮箱重复预检（友好提示，而非 DB 报错）
   *     2. 注册成功后自动登录（下发 token + cookie，减少用户操作）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async register(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(registerSchema, req.body, res, this);
      if (data === undefined) return;
      const { username, password, email } = data;

      // 1. 用户名重复检查
      const existUser = await Member.findUserByField(username, "username");
      if (existUser.success && existUser.data?.id) {
        return res.json(this.fail({ msg: "该用户名已被使用，请换一个" }));
      }

      // 2. 邮箱重复检查
      //    注意：本分支挂在 verifycode 中间件之后，必须先持有有效验证码才能到达；
      //    而已注册邮箱在 sendEmail 阶段收到的是「邮箱已注册」提示邮件（不含验证码），
      //    因此攻击者无法走到这里 → 不构成邮箱枚举通道，文案保持对真实用户友好。
      //    （sendEmail / resetPass 里的同类判定不满足此前提，故已改为不回显。）
      const existEmail = await Member.findUserByField(email, "email");
      if (existEmail.success && existEmail.data?.id) {
        return res.json(this.fail({ msg: "该邮箱已被注册，请直接登录" }));
      }

      // 3. 创建用户
      const _password = await bcrypt.hash(password, parseInt(this.config.BCRYPT_SALT));
      const result = await Member.create({ username, password: _password, email, status: "1" });

      if (!result.success) {
        return res.json(this.fail({ msg: result.msg || "注册失败，请稍后重试" }));
      }

      // 4. 注册成功，自动登录（减少用户操作步骤）
      const userId = result.data?.insertId || result.data?.id;
      const ip = getIp(req);
      const minApp = isMiniProgram(req);

      // token 签发 + cookie 下发收敛（fp 兜底 → setToken → cookie，见 common/auth-cookie.js）
      const { token } = issueMemberSession({
        req,
        res,
        config: this.config,
        uid: userId,
        username,
        ip,
        setCookies: !minApp,
      });

      res.json(this.success({
        msg: "注册成功",
        data: minApp
          ? { id: userId, username, email, token }
          : { id: userId, username, email }
      }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 校验邮件验证码（找回密码流程中的预校验步骤）
   *   流程：sendEmail(reset) → checkEmail → resetPass
   *   优化：同时校验邮箱是否已注册，避免用户输完验证码才发现账号不存在
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async checkEmail(req, res, next) {
    try {
      const Member = await this.Member;
      const VerificationCode = await this.VerificationCode;
      const { email, code } = req.body;
      if (!email || !code) {
        return res.json(this.fail({ msg: "邮箱和验证码不能为空", code: 1006 }));
      }

      // 1. 预校验验证码：仅校验不消费（消费留给 resetPass 的 verifycode 中间件）
      //    安全：不再单独返回「该邮箱未注册」——那是一个邮箱枚举通道；
      //    未注册邮箱必然没有验证码记录，这里统一按验证码错误返回，不暴露邮箱是否存在。
      //    同时叠加「猜错次数」锁定：verifyPeek 不消费验证码，若不计数则可被反复猜。
      const lock = await checkVcodeLocked(email);
      if (lock.locked) {
        return res.json(this.fail({
          msg: `验证码错误次数过多，请 ${lock.retryAfter} 分钟后重试，或重新获取验证码`,
          code: 1008,
        }));
      }

      const result = await VerificationCode.verifyPeek(email, code);
      if (!result.valid) {
        const fail = await recordVcodeFail(email);
        return res.json(this.fail({
          msg: fail.locked
            ? `验证码错误次数过多，请 ${Math.ceil(rateLimit.verifyCodeFail.lockMs / 60000)} 分钟后重试，或重新获取验证码`
            : "邮箱或验证码有误，请重新获取验证码",
          code: 1008,
        }));
      }
      await clearVcodeFail(email);

      res.json(this.success({ data: "验证通过，请设置新密码" }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取会员详情
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async detail(req, res, next) {
    try {
      const Member = await this.Member;
      const { uid } = req.user;
      const result = await Member.detail(uid);
      if (result.success && result.data) {
        res.json(this.success({ data: result.data }));
      } else {
        res.json(this.fail({ msg: result.msg || "获取会员信息失败" }));
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 重置密码
   *   前置：verifycode 中间件已校验并消费邮箱验证码
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async resetPass(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(resetPassSchema, req.body, res, this);
      if (data === undefined) return;
      const { email, password } = data;

      // 判断邮箱是否已注册
      // 安全：此处不可返回「该邮箱未注册」——那是邮箱枚举通道（口径同 sendEmail）。
      // 能走到这里说明验证码校验已通过，而未注册邮箱根本收不到验证码，
      // 因此该分支实际不可达；文案统一为「验证码无效」以防万一被触达时泄露邮箱存在性。
      const user = await Member.find(email);
      if (!user.success || !user.data?.list?.length) {
        return res.json(this.fail({ msg: "验证码无效或已过期，请重新获取" }));
      }

      const _password = await bcrypt.hash(password, parseInt(this.config.BCRYPT_SALT));
      const updateResult = await Member.update({
        query: { email },
        data: { password: _password },
      });

      // 安全：改密后吊销该用户「此刻之前」签发的全部 token（跨设备强制下线）
      // 否则密码已重置，但攻击者/旧设备手里的旧会话仍然有效（无法靠单 token 黑名单覆盖）
      const targetUid = user.data.list[0]?.id;
      try {
        await revokeUserTokensBefore(targetUid, this.config.JWT_COOKIE_MAXAGE_MS);
      } catch (e) {
        logger.error("[resetPass] 吊销旧会话失败:", e.message);
      }
      // 同时清掉当前浏览器上的登录态 cookie，让用户以新密码重新登录
      res.clearCookie("ut");
      res.clearCookie("un");

      res.json(this.success({ ...updateResult, msg: "密码重置成功，请使用新密码登录" }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 更新会员信息（会员自助更新 / 后台管理员更新共用）
   *   会员端（userauth）：强制使用 req.user.uid，防止越权改他人资料
   *   后台端（auth）：req.user.perms 非空数组时允许指定 id + 改 status
   */
  async updateUser(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(updateUserSchema, req.body, res, this);
      if (data === undefined) return;
      let { id, phone, remark, sex, wechat, username, nickname, email, status } = data;
      // 权限判断：必须持有通配权限 *:*:* 或具体的 member:user:update 权限才视为管理员
      //（不能只凭 perms 非空——那样任意低权用户均可改他人资料）
      // member:user:update 须与 SysPermRoute.classify 路由归类产出的权限串一致
      const perms = req.user?.perms;
      const isAdmin = Array.isArray(perms) && perms.some(
        p => p === '*:*:*' || p === 'member:user:update'
      );
      // 会员端强制使用自身 uid，防止越权
      const targetId = isAdmin ? id : req.user.uid;
      let query = { id: targetId };
      let updateData = { phone, remark, sex, wechat, username, nickname, email };
      // status 仅管理员可修改；归一化：前端可能传数字 1 / 布尔 true / 字符串 "1" 都视为启用，
      // 其余（含字符串 "0"）统一置 '0'（varchar 列，与登录校验 String(status)!=='1' 口径一致）
      if (status !== undefined && isAdmin) {
        updateData.status = (status == 1 || status === true || status === '1') ? '1' : '0';
      }
      const result = await Member.update({ query, data: updateData });
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 修改密码
   *   安全策略：
   *     1. uid 来自 token（不信任前端），用 uid 查库获取真实 email
   *     2. 前端传的 email 必须与库中 email 一致（防止伪造他人邮箱）
   *     3. 校验邮箱验证码（防绕过），验证码校验成功即焚
   *     4. 校验原密码
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async updatePass(req, res, next) {
    try {
      const Member = await this.Member;
      const VerificationCode = await this.VerificationCode;
      let { uid } = req.user;
      const data = validated(updatePassSchema, req.body, res, this);
      if (data === undefined) return;
      let { password, newPassword, email, code } = data;

      // 1. 越权防护：用 uid 查库获取真实 email，与前端传的 email 比对
      //    防止用户 A 用用户 B 的邮箱 + 验证码尝试操作
      const detailResult = await Member.detail(uid);
      if (!detailResult.success || !detailResult.data) {
        return res.json(this.fail({ msg: "用户信息不存在" }));
      }
      const userDetail = detailResult.data;
      if (!userDetail.email || userDetail.email !== email) {
        return res.json(this.fail({ msg: "邮箱与当前账号不匹配" }));
      }

      // 3. 校验邮箱验证码（防绕过：未传 code 直接拒绝）
      const verifyResult = await VerificationCode.verify(email, code);
      if (!verifyResult.valid) {
        return res.json(this.fail({ msg: verifyResult.msg }));
      }

      // 4. 校验原密码
      const result = await Member.queryPass(uid);
      if (result.success && result.data) {
        let user = result.data;
        const match = await bcrypt.compare(password, user.password);
        if (user && match) {
          let _password = await bcrypt.hash(newPassword, parseInt(this.config.BCRYPT_SALT));
          let query = { id: uid };
          let data = { password: _password };
          const result = await Member.update({ query, data });
            // 密码修改成功：吊销旧 token（防止旧会话继续可用），并签发新 token 保持登录
            // 复用框架 revokeToken + issueMemberSession，不重复实现令牌逻辑
            try {
              const oldToken =
                req.cookies?.ut ||
                req.headers.token ||
                (req.headers.authorization || "").replace(/^Bearer\s+/, "");
              if (oldToken) {
                const decoded = await getToken(oldToken, this.config.JWT_SECRET);
                const ttl = decoded?.exp
                  ? (decoded.exp - Math.floor(Date.now() / 1000)) * 1000
                  : 0;
                await revokeToken(oldToken, ttl);
              }
              const { token: newToken } = issueMemberSession({
                req,
                res,
                config: this.config,
                uid,
                username: req.user.username,
                ip: getIp(req),
                unCookie: false,
              });
              return res.json(this.success({ ...result, token: newToken, msg: "密码修改成功，已自动续期登录" }));
          } catch (e) {
            logger.error("updatePass 续期失败:", e.message);
            return res.json(this.success({ ...result, msg: "密码修改成功" }));
          }
        } else {
          res.json(this.fail({ msg: "原密码错误！" }));
        }
      } else {
        res.json(this.fail({ msg: "用户名或密码错误！" }));
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 退出登录
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async logout(req, res, next) {
    try {
      // 先清 cookie：无论 token 是否有效都执行，避免过期 token 解码抛错导致清不掉（旧实现会 500 且不清 cookie）
      res.clearCookie('ut');
      res.clearCookie('un');
      // 再将 token 加入黑名单使其主动失效；解码失败（如已过期）则忽略，不阻断登出
      const token = req.cookies?.ut || req.headers.token || "";
      if (token) {
        try {
          const decoded = await getToken(token, this.config.JWT_SECRET);
          if (decoded?.exp) {
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
              await store.set(`blacklist:${token}`, '1', ttl * 1000);
            }
          }
        } catch (e) {
          logger.warn("MemberController.logout 解码token失败(可能已过期):", e.message);
        }
      }
      // 重定向仅允许相对路径，防开放重定向
      const redirect = req.query.redirect || '/';
      const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
      res.redirect(safeRedirect);
    } catch (err) {
      logger.error("MemberController.logout-->", err);
      next(err);
    }
  }

  /**
   * @description 获取会员列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async list(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(listSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, pageSize = 20 } = data;
      pageSize = capPageSize(pageSize);
      let result = await Member.list(parseInt(page) || 1, parseInt(pageSize) || 20);
      result.data.list = formatDateFields(result.data.list);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 搜索会员
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async search(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(searchSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, keyword, pageSize = 20 } = data;
      pageSize = capPageSize(pageSize);
      let result = await Member.search(keyword, parseInt(page) || 1, parseInt(pageSize) || 20);
      result.data.list = formatDateFields(result.data.list);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取会员详情
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */
  async adminDetail(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(adminDetailSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await Member.detail(id);
      if (result.success && result.data) {
        let data = result.data;
        data = formatDateFields(data, ['created_at', 'updated_at', 'loginDate']);
        res.json(this.success({ data }));
      } else {
        res.json(this.fail({ msg: result.msg || "会员不存在" }));
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 后台删除会员（支持批量，逗号分隔 id）
   *   级联清理：该会员的评论、收藏一并删除
   */
  async delete(req, res, next) {
    try {
      const Member = await this.Member;
      const { id } = req.body;
      if (!id) return res.json(this.fail({ msg: "请选择要删除的会员", code: 1007 }));
      // 防自删：批量（"1,2,3"）或单个 id 中包含当前登录账号均拒绝
      const selfUid = req.user?.uid;
      const idList = String(id).split(",").map(Number).filter(Boolean);
      if (selfUid != null && idList.includes(Number(selfUid))) {
        return res.json(this.fail({ msg: "不能删除当前登录账号", code: 1007 }));
      }
      const result = await Member.delete(id);
      res.json(result);
    } catch (err) {
      logger.error("[MemberController.delete] 错误:", err.message);
      next(err);
    }
  }

  /**
   * @description 更新会员状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件函数
   */ 
  async updateStatus(req, res, next) {
    try {
      const Member = await this.Member;
      const data = validated(updateStatusSchema, req.body, res, this);
      if (data === undefined) return;
      const { id, status } = data;
      const { uid } = req.user;

      if (parseInt(id) === parseInt(uid)) {
        return res.json(this.fail({ msg: "不能修改自己的状态" }));
      }

      const result = await Member.updateStatus(id, status);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }
}

export default new MemberController();
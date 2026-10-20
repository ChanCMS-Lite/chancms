import { Controller, setToken, getToken, logger } from "chanjs";
import { getIp } from "chanjs/utils/index.js";
import { store } from "chanjs/storage/index.js";

import bcrypt from "bcrypt";
import { parseIpRegion } from "../../../common/ip2region.js";
import { verifyCaptcha, consumeCaptchaPassed } from "../middleware/captcha.js";
import { checkLoginLocked, recordLoginFail, clearLoginFail, MAX_FAIL_COUNT } from "../../../common/login-limit.js";
import { validated } from "../../../common/validate.js";
import { permMatches } from "../../../common/permission-utils.js";
import { loginCookieOptions } from "../../../common/auth-cookie.js";
import { trackOnline, untrackOnline } from "../common/online-users.js";
import {
  loginSchema,
  createSchema,
  updateSchema,
  detailSchema,
  deleteSchema,
  listSchema,
} from "../validator/SysUser.js";

class SysUserController extends Controller {
  constructor(...args) {
    super(...args);
    this.SysUser = this.get("base", "SysUser", "service");
    this.SysMenu = this.get("base", "SysMenu", "service");
    this.OperLog = this.get("base", "OperLog", "service");
  }

  async login(req, res, next) {
    let username = "";
    let ip = "";
    try {
  const SysUser = await this.SysUser;
  const SysMenu = await this.SysMenu;
      const data = validated(loginSchema, req.body, res, this);
      if (data === undefined) return;
      const { username: uname, password } = data;
      username = uname || "";
      ip = getIp(req);

      // 1. 校验图形验证码（req.body.sessionId + req.body.captcha）
      //     优先消费前端预校验 passed 标记（前端已先行校验，避免无谓登录请求）；
      //     无标记（直接调用 / 旧前端 / 标记过期）则自行校验，保证接口独立安全。
      const captchaPassed = await consumeCaptchaPassed(req);
      if (!captchaPassed) {
        const captchaResult = await verifyCaptcha(req);
        if (!captchaResult.ok) {
          // 验证码错误不计入账号失败次数，避免无验证码时反推账号存在
          return res.json(this.fail({ msg: captchaResult.msg, code: 1006 }));
        }
      }

      // 2. 登录失败锁定检查（IP + 账号 复合维度）
      const lockStatus = await checkLoginLocked(ip, username);
      if (lockStatus.locked) {
        return res.json(this.fail({
          msg: `账号已被锁定，请${lockStatus.retryAfter}分钟后重试`,
          code: 1008,
        }));
      }

      const userResult = await SysUser.find(username);
      if (!userResult.success || !userResult.data) {
        await this.recordLoginLog({ username, ip, status: 0, result: "用户不存在" });
        const { failCount } = await recordLoginFail(ip, username);
        return res.json(this.fail({
          msg: `用户不存在，剩余尝试次数 ${Math.max(0, MAX_FAIL_COUNT - failCount)}`,
          code: 1004,
        }));
      }
      const user = userResult.data;
      // 统一为字符串比较，避免数据库驱动返回数字 1 时误判（与 member 登录一致）
      if (String(user.status) !== '1') {
        await this.recordLoginLog({ userId: user.id, username, ip, status: 0, result: "用户账号已停用" });
        return res.json(this.fail({ msg: "用户账号已停用，请联系管理员", code: 1008 }));
      }
      // 3. 验证密码
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        await this.recordLoginLog({ userId: user.id, username, ip, status: 0, result: "密码错误" });
        const { failCount, locked } = await recordLoginFail(ip, username);
        if (locked) {
          return res.json(this.fail({ msg: "密码错误次数过多，账号已被锁定1小时", code: 1008 }));
        }
        return res.json(this.fail({
          msg: `密码错误，剩余尝试次数 ${Math.max(0, MAX_FAIL_COUNT - failCount)}`,
          code: 1001,
        }));
      }

      // 4. 登录成功，清空对应 (ip, username) 的失败计数
      await clearLoginFail(ip, username);

      // 生成token，包含IP信息
      const token = setToken(
        { uid: user.id, username, i: ip, scope: 'admin' },
        this.config.JWT_SECRET,
        this.config.JWT_EXPIRES_IN
      );

      // 登记在线会话（供「在线用户」页展示与强退；失败不阻断登录）
      await trackOnline(token, { uid: user.id, username, ip });

      // 获取用户菜单
      const menuResult = await SysMenu.allRouter(user.id);
      const menus = (menuResult.success && menuResult.data) ? menuResult.data.routers || [] : [];

      // 获取用户角色key，给前端 v-permission 指令用
      const roleKeys = await SysUser.getRoleKeys(user.id);

      await this.recordLoginLog({ userId: user.id, username, ip, status: 1, result: "登录成功" });

      // 登录态统一方案：token 经非 HttpOnly cookie 下发（细节见 common/auth-cookie.js 头注释）
      res.cookie('token', token, loginCookieOptions(this.config));

      res.json({
        success: true,
        code: 0,
        msg: "登录成功",
        data: {
          status: user.status,
          username,
          ip: ip,
          region: parseIpRegion(ip),
          menus,
          roleKeys
        }
      });
    } catch (err) {
      logger.error("[SysUserController.login] 错误:", err.message);
      next(err);
    }
  }

  /**
   * 退出登录：token 加入黑名单，清除 cookie
   */
  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : (req.headers.token || req.cookies?.token || "");
      if (token) {
        const decoded = await getToken(token, this.config.JWT_SECRET);
        if (decoded?.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await store.set(`blacklist:${token}`, '1', ttl * 1000);
          }
        }
        // 从在线用户映射移除
        await untrackOnline(token);
      }
      res.clearCookie('token');
      res.clearCookie('perms');
      res.json(this.success({ msg: '退出成功' }));
    } catch (err) {
      next(err);
    }
  }

  async recordLoginLog({ userId, username, ip, status, result }) {
    try {
      // 解析 IP 归属地（内网返回占位，外网走 ip2region）
  const OperLog = await this.OperLog;
      const geo = parseIpRegion(ip);
      await OperLog.insert({
        title: "用户登录",
        business_type: 0,
        request_method: "POST",
        operator_type: 3,
        user_id: userId || null,
        oper_name: username,
        oper_url: "/base/user/login",
        oper_ip: ip,
        oper_param: JSON.stringify({ userId, username, ip }),
        json_result: result,
        status,
        oper_time: new Date(),
        // IP 归属地（对齐 sys_oper_log 表字段）
        country: geo.country,
        prov: geo.prov,
        city: geo.city,
        district: geo.district,
        isp: geo.isp,
      });
    } catch (err) {
      logger.error("[recordLoginLog] 记录登录日志失败:", err.message);
    }
  }

  async list(req, res, next) {
    try {
  const SysUser = await this.SysUser;
      const data = validated(listSchema, req.query, res, this);
      if (data === undefined) return;
      const query = data || {};
      // auth 中间件已解析 token 并设置 req.user，直接复用
      const { uid } = req.user;
      const isSuperAdmin = await SysUser.hasRole(uid, 'super');
      // 行级权限：非超管只返回自己（service SQL 层过滤）
      const result = await SysUser.list(query, isSuperAdmin, uid);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }
  // 增
  async create(req, res, next) {
    try {
  const SysUser = await this.SysUser;
      const data = validated(createSchema, req.body, res, this);
      if (data === undefined) return;
      const body = data;

      // 安全（P0）：禁止非超级管理员分配 super 角色，防垂直提权（新建超管账号）
      const { uid } = req.user;
      const isSuperAdmin = await SysUser.hasRole(uid, 'super');
      if (body.role_ids && body.role_ids.length) {
        const assignsSuper = await SysUser.roleIdsContainSuper(body.role_ids);
        if (assignsSuper && !isSuperAdmin) {
          return res.json(this.fail({ msg: "无权分配超级管理员角色" }));
        }
      }

      body.password = await bcrypt.hash(body.password, parseInt(this.config.BCRYPT_SALT));
      const result = await SysUser.create(body);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async detail(req, res, next) {
    try {
  const SysUser = await this.SysUser;
      const data = validated(detailSchema, req.query, res, this);
      if (data === undefined) return;
      let { id } = data;
      // 自我保护：本接口在 SKIP_PATHS 白名单（登录初始化必调），
      // 无 base:user:list 权限（用户管理）的调用者只能查自己，防止越权查任意用户。
      if (id && id != req.user.uid) {
        const canManage = (req.user.perms || []).some((p) => permMatches("base:user:list", p));
        if (!canManage) id = req.user.uid;
      }
      if (!id) {
        // auth 中间件已设置 req.user
        id = req.user.uid;
      }
      const result = await SysUser.detail(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
  const SysUser = await this.SysUser;
      const data = validated(deleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const { uid } = req.user;
      const isSuperAdmin = await SysUser.hasRole(uid, 'super');

      // 行级权限：仅超级管理员可删除账号（非超管不能删除任何账号，含其他普通用户）
      if (!isSuperAdmin) {
        return res.json(this.fail({ msg: "仅超级管理员可删除账号" }));
      }

      const targetUserIsSuper = await SysUser.hasRole(id, 'super');

      if (targetUserIsSuper && !isSuperAdmin) {
        return res.json(this.fail({ msg: "无权删除超级管理员" }));
      }
      if (uid == id) {
        return res.json(this.fail({ msg: "不能删除自己" }));
      }
      // 删除前失效目标用户启用状态缓存，使被删账号旧 token 立即失效
      SysUser.clearUserStatusCache(id);
      const result = await SysUser.delete(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
  const SysUser = await this.SysUser;
      const data = validated(updateSchema, req.body, res, this);
      if (data === undefined) return;
      const { userId, username, status, role_ids, password } = data;

      const { uid } = req.user;
      const isSuperAdmin = await SysUser.hasRole(uid, 'super');

      // 安全（P0）：禁止非超级管理员分配 super 角色，防垂直提权（含改自己提权）
      if (role_ids && role_ids.length) {
        const assignsSuper = await SysUser.roleIdsContainSuper(role_ids);
        if (assignsSuper && !isSuperAdmin) {
          return res.json(this.fail({ msg: "无权分配超级管理员角色" }));
        }
      }

      // 行级权限：只能修改自己的信息，超级管理员可以修改任何用户
      if (uid != userId) {
        if (!isSuperAdmin) {
          return res.json(this.fail({ msg: "无权修改其他用户信息" }));
        }
        // 非super用户不能修改super用户
        const targetUserIsSuper = await SysUser.hasRole(userId, 'super');
        if (targetUserIsSuper && !isSuperAdmin) {
          return res.json(this.fail({ msg: "无权修改超级管理员" }));
        }
      }

      // 非超管：只能修改自己的密码（username/status/角色一律不允许改，防改角色/状态提权）
      let params;
      if (!isSuperAdmin) {
        params = { userId };
        if (password) {
          params.password = await bcrypt.hash(password, parseInt(this.config.BCRYPT_SALT));
        }
      } else {
        params = { userId, username, status, role_ids };
        if (password) {
          params.password = await bcrypt.hash(password, parseInt(this.config.BCRYPT_SALT));
        }
      }

      const result = await SysUser.update(params);

      // 修改/停用/删除后立即失效目标用户的启用状态缓存，保证 auth 中间件下一次鉴权即反映最新状态
      if (params.userId) {
        SysUser.clearUserStatusCache(params.userId);
      }

      // 修改自己的密码后：旧的登录 token 立即失效（服务端强制吊销），
      // 不再只依赖前端 passwordChanged 标记引导重登 —— 否则旧 token 在 JWT 自然过期前一直有效，
      // 密码泄露换密后旧会话仍可被利用。
      // 与 logout() 同一套黑名单机制（blacklist:${token}，TTL 取 token 剩余有效期）。
      if (password && uid == userId) {
        await this.#blacklistCurrentToken(req);
        result.data = { ...result.data, passwordChanged: true };
      }

      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * 将当前请求携带的 token 加入黑名单，立即吊销其有效期
   * @param {import("express").Request} req
   */
  async #blacklistCurrentToken(req) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : (req.headers.token || req.cookies?.token || "");
      if (!token) return;
      const decoded = await getToken(token, this.config.JWT_SECRET);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await store.set(`blacklist:${token}`, '1', ttl * 1000);
        }
      }
    } catch (err) {
      // 吊销失败不阻断改密主流程：保守兜底，仅告警，避免用户改密却被误报失败
      logger.error("[SysUserController.changePassword] token吊销失败:", err.message);
    }
  }
}

export default new SysUserController();

import { Controller, logger, getApp } from "chanjs";
import { capPageSize } from "../../../common/pagination.js";
import { formatDateFields, getIp } from "chanjs/utils/index.js";
import { store } from "chanjs/storage/index.js";
import crypto from "node:crypto";
import { rateLimit } from "../../../../config/ratelimit.js";

import { sendMail, genMessageNotificationEmail } from "../../../common/email.js";
import { parseIpRegion } from "../../../common/ip2region.js";
import { validated } from "../../../common/validate.js";
import {
  createSchema,
  updateSchema,
  deleteSchema,
  detailSchema,
  searchSchema,
  listSchema,
} from "../validator/Message.js";

// ===== 留言频次限制（IP + 设备指纹 cookie 双维度，按天重置）=====
// 阈值统一在 config/ratelimit.js 的 message 段配置；复用框架 store.incrAndExpire（原子自增 + 过期）
const MSG_RATE_TTL = 24 * 60 * 60 * 1000; // 1 天窗口

class MessageController extends Controller {
  constructor() {
    super();
    this.message = this.get("cms","Message","service");
  }
  // 增
  async create(req, res, next) {
    try {
      const message = await this.message;
      // ===== 频次限制：IP + 设备指纹 cookie 双维度，按天重置 =====
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const clientIp = getIp(req) || "unknown";
      // 访客标识：使用项目私有 cookie `_msg_fp`（不复用后台设备指纹 `_f`，避免跨项目 cookie 踩踏）
      let fp = req.cookies?._msg_fp;
      if (!fp) {
        fp = crypto.randomUUID();
        res.cookie("_msg_fp", fp, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: false,
          path: "/",
        });
      }
      const ipKey = `ratelimit:msg:ip:${clientIp}:${today}`;
      const fpKey = `ratelimit:msg:fp:${fp}:${today}`;
      const [ipCount, fpCount] = await Promise.all([
        store.incrAndExpire(ipKey, MSG_RATE_TTL),
        store.incrAndExpire(fpKey, MSG_RATE_TTL),
      ]);
      if (ipCount > rateLimit.message.maxPerIpPerDay || fpCount > rateLimit.message.maxPerFpPerDay) {
        logger.warn(`[留言限流] ip:${clientIp} ipCnt:${ipCount}/${rateLimit.message.maxPerIpPerDay} fpCnt:${fpCount}/${rateLimit.message.maxPerFpPerDay} fp:${fp}`);
        res.json(this.fail({ msg: "您提交过于频繁，请明天再试", code: 429 }));
        return;
      }

      const data = validated(createSchema, req.body, res, this);
      if (data === undefined) return;
      const result = await message.create(data);

      // ===== 留言邮件通知（失败不影响用户提交，仅记日志）=====
      try {
        const { EMAIL } = getApp()?.config || {};
        const to = Array.isArray(EMAIL?.TO) ? EMAIL.TO : EMAIL?.TO;
        if (to && EMAIL?.HOST) {
          const adminLink = `${req.protocol}://${req.get("host")}/admin/message`;
          // 归属地拼接对齐 stat/service/Stat.js L345 口径：country prov city 过滤"内网"后空格相连
          // ip2region 不提供区县（district 恒为 null），故只到市一级
          const notifyIp = getIp(req);
          const geo = parseIpRegion(notifyIp);
          const region = [geo.country, geo.prov, geo.city]
            .filter((x) => x && x !== "内网")
            .join(" ") || "内网";
          const html = genMessageNotificationEmail({
            name: data.name,
            company: data.company,
            tel: data.tel,
            email: data.email,
            content: data.content,
            ip: notifyIp,
            region,
            adminLink,
          });
          const subject = EMAIL?.SUBJECT_MESSAGE || "收到新网站留言";
          await sendMail(to, subject, subject, html);
        } else {
          logger.warn("[留言通知] 邮件未配置(EMAIL.TO/HOST 缺失)，跳过发送");
        }
      } catch (mailErr) {
        logger.error("[留言通知] 邮件发送失败(不影响提交):", mailErr.message);
      }

      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const message = await this.message;
      const data = validated(deleteSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      const result = await message.delete(id);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const message = await this.message;
      const data = validated(updateSchema, req.body, res, this);
      if (data === undefined) return;
      const result = await message.update(data);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const message = await this.message;
      const data = validated(detailSchema, req.query, res, this);
      if (data === undefined) return;
      const { id } = data;
      let result = await message.detail(id);
      result = formatDateFields(result);
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 搜索
  async search(req, res, next) {
    try {
      const message = await this.message;
      const data = validated(searchSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, keyword, pageSize = 20 } = data;
      pageSize = capPageSize(pageSize);
      let result = await message.search(keyword, parseInt(page) || 1, parseInt(pageSize) || 20);
      // service 返回结构 { data: { list, total } }，日期格式化要落在 result.data.list（与 list() 口径一致）
      if (result?.data?.list) {
        result.data.list = formatDateFields(result.data.list);
      }
      res.json(this.success(result));
    } catch (err) {
      next(err);
    }
  }

  // 列表
  async list(req, res, next) {
    try {
      const message = await this.message;
      const data = validated(listSchema, req.query, res, this);
      if (data === undefined) return;
      let { page, pageSize = 20 } = data;
      pageSize = capPageSize(pageSize);
      let result = await message.list(parseInt(page) || 1, parseInt(pageSize) || 20);
      result.data.list = formatDateFields(result.data.list);
      res.json(this.success({data:result.data}));
    } catch (err) {
      next(err);
    }
  }
}

export default new MessageController();
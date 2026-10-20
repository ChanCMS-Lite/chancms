import nodemailer from "nodemailer";
import { getApp, logger } from "chanjs";

/**
 * 邮件发送（transporter 管理 + sendMail + 收件人规范化）
 * 从原 app/common/email.js 拆出；模板相关见同目录 templates.js / template-shell.js
 */

/**
 * 邮箱地址正则（基础校验，防注入和拼写错误）
 */
export const EMAIL_REGEX = /^[^\s@<>'"`]+@[^\s@<>'"`]+\.[^\s@<>'"`]+$/;

/**
 * 模块级 transporter 缓存（避免每次发邮件都创建连接池）
 * 配置不变时复用同一个 transporter，提升性能
 */
let _transporter = null;
let _transporterKey = '';

/**
 * 校验收件人邮箱格式（基础规则，拒绝含特殊字符的非法地址）
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否合法
 */
function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email) && email.length <= 254;
}

/**
 * 将收件人入参规范化为邮箱数组。
 * 支持：单个邮箱字符串、逗号/分号分隔的多收件人字符串、邮箱字符串数组。
 * 返回去空白、去空项后的数组；无法识别的格式返回空数组。
 * @param {string|string[]} to - 收件人（来自入参或 sys_config 的 EMAIL.TO）
 * @returns {string[]} 规范化后的收件人数组
 */
export function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof to === 'string') {
    const s = to.trim();
    if (!s) return [];
    if (s.includes(',') || s.includes(';')) {
      return s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    }
    return [s];
  }
  return [];
}

/**
 * 获取或创建 transporter（带缓存）
 * @param {Object} EMAIL - 邮件配置
 * @returns {Object} nodemailer transporter
 */
function getTransporter(EMAIL) {
  // 用 host+port+user 作为缓存 key，配置变化时自动重建
  const key = `${EMAIL.HOST}:${EMAIL.PORT}:${EMAIL.USER}`;
  if (_transporter && _transporterKey === key) {
    return _transporter;
  }

  _transporter = nodemailer.createTransport({
    host: EMAIL.HOST,
    port: parseInt(EMAIL.PORT),
    secure: EMAIL.SECURE === "true",
    auth: {
      user: EMAIL.USER,
      pass: EMAIL.PASS,
    },
    // 连接池配置：避免每次发邮件都握手，降低 SMTP 服务器压力
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // 超时控制，避免 SMTP 卡死拖垮业务
    connectionTimeout: 10 * 1000,
    greetingTimeout: 10 * 1000,
    socketTimeout: 30 * 1000,
  });
  _transporterKey = key;
  return _transporter;
}

/**
 * 重置 transporter 缓存（后台修改 SMTP 配置后调用）
 * 清空模块级缓存，下次发信会用新配置重建连接池
 */
export const resetTransporter = () => {
  _transporter = null;
  _transporterKey = '';
};

/**
 * 发送邮件
 * @param {string|string[]} to - 收件人邮箱；支持单个邮箱、逗号/分号分隔的多收件人字符串，或直接传邮箱数组
 * @param {string} subject - 邮件主题
 * @param {string} text - 邮件文本内容
 * @param {string|null} html - 邮件HTML内容，默认为null
 * @returns {Promise<Object>} 发送结果
 * @throws {Error} 邮件服务未配置、收件人为空或格式非法、发送失败时抛出异常
 * @description
 * - 收件人支持多收件人（数组 / 逗号 / 分号分隔），逐个校验后原样交给 nodemailer
 * - transporter 模块级缓存，避免每次创建连接池
 */
export const sendMail = async (to, subject, text, html = null) => {
  // 收件人规范化（支持单个邮箱 / 逗号或分号分隔串 / 邮箱数组），并逐个校验格式
  const recipients = normalizeRecipients(to);
  if (recipients.length === 0 || !recipients.every(isValidEmail)) {
    throw new Error(`[email] 收件人邮箱格式非法: ${JSON.stringify(to)}`);
  }

  const { EMAIL, APP_NAME } = getApp()?.config || {};

  const transporter = getTransporter(EMAIL);

  let res = await transporter.verify();
  if (!res) {
    throw new Error("邮件服务未配置");
  }

  const mailOptions = {
    from: EMAIL.FROM,
    to: recipients,
    subject,
    text,
    html: html || text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    logger.error("❌ 邮件发送失败:", error.message);
    throw error;
  }
};

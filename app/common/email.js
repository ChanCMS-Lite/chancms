/**
 * 邮件发送工具（业务层）—— 兼容入口
 *
 * 实现已拆分到 app/common/email/ 目录：
 *   - sender.js：transporter 管理 + sendMail + normalizeRecipients + resetTransporter
 *   - template-shell.js：mailShell 外壳、共享 CSS、escapeHtml / renderEmailTemplate
 *   - templates.js：三个业务模板（注册验证码 / 重置密码验证码 / 留言通知）
 *
 * 本文件仅 re-export 全部原有导出，调用方（base/Config、member/Member、cms/Message、
 * common/remote-config）无需改动；导出名保持不变。
 */

export { normalizeRecipients, resetTransporter, sendMail } from "./email/sender.js";
export { renderEmailTemplate } from "./email/template-shell.js";
export {
  genRegEmailHtml,
  genResetPasswordEmail,
  genMessageNotificationEmail,
  genEmailTakenNotice,
  genEmailNotRegisteredNotice,
} from "./email/templates.js";

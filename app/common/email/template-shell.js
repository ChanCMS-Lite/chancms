/**
 * 邮件 HTML 公共外壳与共享样式
 * 从原 app/common/email.js 拆出；验证码模板与留言通知模板共用同一套 CSS 基础
 */

/**
 * HTML 特殊字符转义，防止邮件模板注入
 * @param {string} str - 待转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 邮件模板占位符渲染（用于 sys_config email_config.TEMPLATE_* 可配置模板）
 * 语法：{{KEY}}，KEY 为大写字母/数字/下划线；值统一经 escapeHtml 转义防注入。
 * 未提供的占位符渲染为空字符串（不报错）。
 * @param {string} tpl - 含占位符的模板字符串
 * @param {Object} vars - 变量映射（KEY -> 值）
 * @returns {string}
 */
export const renderEmailTemplate = (tpl, vars = {}) => {
  if (typeof tpl !== "string") return "";
  return tpl.replace(/\{\{\s*([A-Z_][A-Z0-9_]*)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : escapeHtml(String(v));
  });
};

/**
 * 共享 CSS 基础（验证码邮件外壳与留言通知邮件的重复部分抽到这里）
 * 页面背景 / 卡片 / 头部 / 页脚，两套模板渲染规则完全一致
 */
export const shellCss = `        *{margin:0;padding:0;box-sizing:border-box;}
        body{
            background-color:#f1f5f9;
            font-family:'Helvetica Neue','PingFang SC','Microsoft YaHei',Arial,sans-serif;
            padding:40px 16px;
        }
        .mail-card{
            max-width:600px;
            margin:0 auto;
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 4px 16px rgba(15,23,42,0.06);
            color:#0f172a;
        }
        .mail-header{
            padding:32px 40px 20px;
            display:flex;
            align-items:flex-start;
            gap:16px;
        }
        .header-icon{
            width:48px;
            height:48px;
            background:#eff6ff;
            border-radius:10px;
            display:flex;
            align-items:center;
            justify-content:center;
        }
        .header-title h1{
            font-size:20px;
            font-weight:700;
            line-height:1.4;
            margin-bottom:6px;
        }
        .header-title p{
            font-size:14px;
            color:#64748b;
            line-height:1.6;
        }
        .mail-footer{
            background:#f8fafc;
            padding:14px 40px;
            border-top:1px solid #e2e8f0;
            text-align:center;
            font-size:12px;
            color:#94a3b8;
        }`;

/**
 * 验证码邮件公共外壳（注册 / 重置密码共用）
 * 与留言通知邮件保持同一套 div+css 视觉规范；入参需为已转义的安全 HTML
 * @param {Object} opts
 * @param {string} opts.icon - 头部 SVG 图标 HTML（静态常量）
 * @param {string} opts.title - 头部标题（静态文案）
 * @param {string} opts.subtitle - 头部副标题（含已转义动态值）
 * @param {string} opts.bodyHtml - 主体内容（tip 行 + 验证码块）
 * @param {string} opts.footerApp - 页脚应用名（已经 escapeHtml 转义）
 * @returns {string} 完整 HTML 字符串
 */
export function mailShell({ icon, title, subtitle, bodyHtml, footerApp }) {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <style type="text/css">
${shellCss}
    </style>
</head>
<body>
    <div class="mail-card">
        <div class="mail-header">
            <div class="header-icon">${icon}</div>
            <div class="header-title">
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
        </div>

        <div class="main-wrap">
${bodyHtml}
        </div>

        <div class="mail-footer">
            &copy; ${year} ${footerApp}. 保留所有权利。
        </div>
    </div>
</body>
</html>
`;
}

/**
 * 验证码展示块（注册 / 重置密码共用）
 * @param {string} safeCode - 已经 escapeHtml 转义的验证码
 * @returns {string} HTML 字符串
 */
export const codeBoxHtml = (safeCode) => `
            <div class="code-box">
                <div class="code-text">${safeCode}</div>
            </div>`;

/**
 * 将 Date 格式化为 yyyy-MM-dd HH:mm:ss
 * @param {Date} d
 * @returns {string}
 */
export function formatDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) +
    ':' + pad(d.getMinutes()) +
    ':' + pad(d.getSeconds())
  );
}

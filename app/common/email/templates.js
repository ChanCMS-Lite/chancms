import { getApp } from "chanjs";
import { EMAIL_REGEX } from "./sender.js";
import {
  escapeHtml,
  renderEmailTemplate,
  shellCss,
  mailShell,
  codeBoxHtml,
  formatDateTime,
} from "./template-shell.js";

/**
 * 邮件业务模板（注册验证码 / 重置密码验证码 / 留言通知）
 * 从原 app/common/email.js 拆出；外壳与共享 CSS 见 template-shell.js
 */

/**
 * 生成注册验证码邮件HTML模板
 * @param {string} code - 验证码
 * @param {number} minutes - 有效期（分钟），默认10分钟
 * @returns {string} HTML字符串
 * @description
 * 安全改进：所有动态内容（code、APP_NAME）都经 escapeHtml 转义，防止 HTML 注入
 * UI 统一：注册/重置密码共用 mailShell 外壳，和留言通知邮件同一套 div+css 视觉规范
 */
export const genRegEmailHtml = (code, minutes = 10) => {
  const { EMAIL, APP_NAME } = getApp()?.config || {};
  // 配置化模板优先：sys_config email_config.TEMPLATE_REG（占位符 {{CODE}} {{MIN}} {{APP_NAME}}）
  if (EMAIL?.TEMPLATE_REG) {
    return renderEmailTemplate(EMAIL.TEMPLATE_REG, { CODE: code, MIN: minutes, APP_NAME });
  }
  // 转义防止 HTML 注入
  const safeCode = escapeHtml(code);
  const safeAppName = escapeHtml(APP_NAME);
  const safeMin = escapeHtml(String(minutes));

  // 用户 SVG 图标，全局图标色 #2563eb
  const iconUser = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>`;

  return mailShell({
    icon: iconUser,
    title: "账户注册验证",
    subtitle: `欢迎加入 ${safeAppName}，请完成邮箱校验`,
    footerApp: safeAppName,
    bodyHtml: `
            <div class="tip-row">您好，感谢您注册我们的服务！</div>
            <div class="tip-row">您的注册验证码如下：</div>
${codeBoxHtml(safeCode)}
            <div class="tip-row">请在 <strong>${safeMin} 分钟</strong>之内填写验证码，完成账号注册校验。</div>
            <div class="tip-row">如果不是本人发起注册，可以直接忽略该邮件。</div>
            <div class="tip-row">祝您使用愉快！</div>`,
  });
};

/**
 * 生成重置密码邮件HTML模板
 * @param {string} code - 验证码
 * @param {number} minutes - 有效期（分钟），默认10分钟
 * @returns {string} HTML字符串
 * @description
 * 安全改进：所有动态内容（code、APP_NAME）都经 escapeHtml 转义，防止 HTML 注入
 * UI 统一：注册/重置密码共用 mailShell 外壳，和留言通知邮件同一套 div+css 视觉规范
 */
export const genResetPasswordEmail = (code, minutes = 10) => {
  const { EMAIL, APP_NAME } = getApp()?.config || {};
  // 配置化模板优先：sys_config email_config.TEMPLATE_RESET（占位符 {{CODE}} {{MIN}} {{APP_NAME}}）
  if (EMAIL?.TEMPLATE_RESET) {
    return renderEmailTemplate(EMAIL.TEMPLATE_RESET, { CODE: code, MIN: minutes, APP_NAME });
  }
  // 转义防止 HTML 注入
  const safeCode = escapeHtml(code);
  const safeAppName = escapeHtml(APP_NAME);
  const safeMin = escapeHtml(String(minutes));

  // 锁图标SVG，和整套图标配色统一 #2563eb
  const iconLock = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>`;

  return mailShell({
    icon: iconLock,
    title: "账户密码重置",
    subtitle: `来自 ${safeAppName} 的账户安全验证码`,
    footerApp: safeAppName,
    bodyHtml: `
            <div class="tip-row">您好，我们收到了您的账户重置密码请求。</div>
            <div class="tip-row">请使用下方验证码完成身份校验：</div>
${codeBoxHtml(safeCode)}
            <div class="tip-row">验证码有效期为 <strong>${safeMin} 分钟</strong>，过期之后需要重新发起重置。</div>
            <div class="tip-row">如果并不是您本人进行的操作，可以直接忽略本条邮件，您的账户不会受到影响。</div>
            <div class="tip-row">祝您使用愉快！</div>`,
  });
};

/**
 * 留言通知邮件的模板专属 CSS（叠加在共享 shellCss 之上）
 */
const messageCss = `        /*双栏容器*/
        .fields-wrap{
            padding:8px 40px;
            display:grid;
            grid-template-columns: 1fr 1fr;
            gap:12px;
        }
        .field-item{
            display:flex;
            align-items:flex-start;
            gap:12px;
            padding:10px 0;
        }
        .field-icon{
            width:36px;
            height:36px;
            background:#eff6ff;
            border-radius:8px;
            display:flex;
            align-items:center;
            justify-content:center;
        }
        .field-label{
            font-size:12px;
            color:#94a3b8;
            line-height:1.4;
        }
        .field-value{
            margin-top:4px;
            font-size:14px;
            font-weight:600;
            line-height:1.5;
        }
        /*留言内容区块*/
        .content-wrap{
            padding:16px 40px 8px;
        }
        .content-title{
            font-size:12px;
            color:#94a3b8;
            margin-bottom:8px;
        }
        .content-box{
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-left:3px solid #3b82f6;
            border-radius:6px;
            padding:14px 16px;
            font-size:14px;
            color:#334155;
            line-height:1.7;
            white-space:pre-wrap;
            word-break:break-word;
        }
        /*渐变按钮*/
        .btn-wrap{
            padding:22px 40px 10px;
            text-align:center;
        }
        .admin-btn{
            display:inline-block;
            min-width:200px;
            text-decoration:none;
            background:linear-gradient(135deg,#165DFF,#722ED1);
            color:#ffffff;
            padding:13px 16px;
            border-radius:8px;
            font-weight:500;
            font-size:15px;
            box-shadow:0 4px 12px rgba(22,93,255,0.25);
            transition:all 0.25s ease;
        }
        .admin-btn:hover{
            transform:translateY(-2px);
            box-shadow:0 8px 20px rgba(114, 46, 209, 0.35);
        }
        /*底部时间IP*/
        .bottom-info{
            padding:16px 40px 24px;
            border-top:1px dashed #e2e8f0;
            margin-top:10px;
            font-size:12px;
            color:#94a3b8;
            line-height:1.8;
        }
        .ip-row{margin-top:2px;}`;

/**
 * 生成「网站收到新留言」管理员通知邮件 HTML 模板
 * @param {Object} data - 留言数据
 * @param {string} data.name      - 姓名（必填）
 * @param {string} [data.company] - 公司名称（可选）
 * @param {string} data.tel       - 联系电话（必填）
 * @param {string} data.email     - 电子邮箱（必填）
 * @param {string} data.content   - 需求描述（必填，可多行）
 * @param {string|Date} [data.createdAt] - 提交时间，缺省为当前时间
 * @param {string} [data.ip]      - 提交者 IP（可选，缺则不展示该行）
 * @param {string} [data.region]  - 提交者 IP 归属地（国家 省 市，口径对齐后台统计；可选）
 * @returns {string} HTML 字符串
 * @description
 * - 风格对齐前台「联系页 / 在线留言」：浅灰页面背景、白色卡片、阴影 + 细边框、纯色标题、浅蓝SVG图标方块
 * - 头部不使用渐变，纯色 + SVG图标块（避免 Gmail/Outlook 对 background-image 兼容差异）
 * - 纯 div+css 布局；头部style管理样式，现代邮箱支持交互，老旧客户端自动降级
 * - 所有动态内容经 escapeHtml 转义，防止 HTML 注入
 * - 字段缺值统一显示 "—"，不出现空白行
 * - 邮箱字段渲染为 mailto: 链接（管理员可一键回复）
 * - 需求描述保留用户原始换行（white-space: pre-wrap）
 */
export const genMessageNotificationEmail = (data = {}) => {
  const { EMAIL, APP_NAME } = getApp()?.config || {};

  // 配置化模板优先：sys_config email_config.TEMPLATE_MESSAGE
  // 占位符：{{NAME}} {{COMPANY}} {{TEL}} {{EMAIL}} {{CONTENT}} {{TIME}} {{IP}} {{ADMIN_LINK}} {{APP_NAME}}
  if (EMAIL?.TEMPLATE_MESSAGE) {
    const rawTel = (data.tel || "").toString().trim();
    const rawEmail = (data.email || "").toString().trim();
    let createdAtStr = "";
    if (data.createdAt) {
      const d = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
      if (!isNaN(d.getTime())) createdAtStr = formatDateTime(d);
    }
    if (!createdAtStr) createdAtStr = formatDateTime(new Date());
    return renderEmailTemplate(EMAIL.TEMPLATE_MESSAGE, {
      NAME: (data.name || "").toString().trim(),
      COMPANY: (data.company || "").toString().trim(),
      TEL: rawTel,
      EMAIL: rawEmail,
      CONTENT: (data.content || "").toString(),
      TIME: createdAtStr,
      IP: (data.ip || "").toString().trim(),
      REGION: (data.region || "").toString().trim(),
      ADMIN_LINK: (data.adminLink || "").toString().trim(),
      APP_NAME: APP_NAME,
    });
  }

  const safeAppName = escapeHtml(APP_NAME);

  // 字段统一兜底：缺值显示 "—"
  const dash = '<span style="color:#9ca3af;">—</span>';
  const name = escapeHtml(data.name) || dash;
  const company = escapeHtml(data.company) || dash;
  const rawTel = (data.tel || '').toString().trim();
  const telCell = rawTel ? escapeHtml(rawTel) : dash;
  const rawEmail = (data.email || '').trim();
  const emailValue = rawEmail ? escapeHtml(rawEmail) : dash;
  const rawContent = (data.content || '').toString();
  const content = rawContent.trim() ? escapeHtml(rawContent) : dash;

  // 邮箱字段：合法时渲染为 mailto: 链接
  const emailCell = rawEmail && EMAIL_REGEX.test(rawEmail)
    ? `<a href="mailto:${escapeHtml(rawEmail)}" style="color:#2563eb; text-decoration:none;">${emailValue}</a>`
    : emailValue;

  // 提交时间：缺省当前，格式 yyyy-MM-dd HH:mm:ss
  let createdAtStr = '';
  if (data.createdAt) {
    const d = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    if (!isNaN(d.getTime())) createdAtStr = formatDateTime(d);
  }
  if (!createdAtStr) createdAtStr = formatDateTime(new Date());
  const safeCreatedAt = escapeHtml(createdAtStr);

  // 来源行：IP 后直接跟归属地，格式对齐 sys_config TEMPLATE_MESSAGE（"来源IP：{{IP}} {{REGION}}"）
  const ipStr = (data.ip || '').toString().trim();
  const regionStr = (data.region || '').toString().trim();
  const ipLine = ipStr
    ? `<div class="ip-row">来源IP：${escapeHtml(ipStr)}${regionStr ? ` ${escapeHtml(regionStr)}` : ''}</div>`
    : '';

  const year = new Date().getFullYear();
  const adminLink = escapeHtml(data.adminLink || "");

  // SVG矢量图标
  const svgIcon = (path) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb"><path d="${path}"/></svg>`;
  const iconUser = svgIcon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z");
  const iconCompany = svgIcon("M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z");
  const iconPhone = svgIcon("M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z");
  const iconMail = svgIcon("M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z");

  // 单行字段组件
  const renderField = (svgHtml, label, valueHtml) => `
    <div class="field-item">
      <div class="field-icon">${svgHtml}</div>
      <div class="field-body">
        <div class="field-label">${escapeHtml(label)}</div>
        <div class="field-value">${valueHtml}</div>
      </div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <style type="text/css">
${shellCss}
${messageCss}
    </style>
</head>
<body>
    <div class="mail-card">
        <!--头部-->
        <div class="mail-header">
            <div class="header-icon">${iconMail}</div>
            <div class="header-title">
                <h1>收到新网站留言</h1>
                <p>客户通过「在线留言」提交了一条信息，建议 24 小时内与客户联系</p>
            </div>
        </div>

        <!--双栏表单字段-->
        <div class="fields-wrap">
            ${renderField(iconUser, '姓名', name)}
            ${renderField(iconCompany, '公司名称', company)}
            ${renderField(iconPhone, '联系电话', telCell)}
            ${renderField(iconMail, '电子邮箱', emailCell)}
        </div>

        <!--留言内容-->
        <div class="content-wrap">
            <div class="content-title">需求描述</div>
            <div class="content-box">${content}</div>
        </div>

        <!--跳转按钮-->
        <div class="btn-wrap">
            <a class="admin-btn" href="${adminLink}" target="_blank">前往后台查看留言</a>
        </div>

        <!--时间、IP-->
        <div class="bottom-info">
            <div>提交时间：<span style="color:#475569;">${safeCreatedAt}</span></div>
            ${ipLine}
        </div>

        <!--页脚版权-->
        <div class="mail-footer">
            本邮件由系统自动发出，请勿直接回复 · © ${year} ${safeAppName}
        </div>
    </div>
</body>
</html>
`;
};

/**
 * 生成「该邮箱已注册」状态提示邮件 HTML
 *
 * 场景：`/member/v1/sendEmail` 的 type=register 分支，用户填了一个**已注册**的邮箱索取注册验证码。
 *
 * 为什么不能直接返回错误文案：
 *   接口响应里出现「该邮箱已被注册」= 一条邮箱枚举通道。任何人可用邮箱字典批量试探，
 *   逐个判定哪些邮箱在本站注册过（为后续撞库/钓鱼/骚扰提供精确目标名单）。
 *   因此接口响应必须与「邮箱可用」时**完全一致**，把事实只告诉邮箱主人 —— 也就是这封邮件。
 *
 * @returns {string} HTML 字符串
 */
export const genEmailTakenNotice = () => {
  const { APP_NAME } = getApp()?.config || {};
  const safeAppName = escapeHtml(APP_NAME);

  const iconInfo = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>`;

  return mailShell({
    icon: iconInfo,
    title: "邮箱已注册",
    subtitle: `该邮箱已是 ${safeAppName} 的账号`,
    footerApp: safeAppName,
    bodyHtml: `
            <div class="tip-row">您好，我们收到了使用该邮箱注册新账号的请求。</div>
            <div class="tip-row">不过这个邮箱<strong>已经注册过 ${safeAppName} 账号</strong>，无需重复注册。</div>
            <div class="tip-row">如需继续使用，请直接前往登录页登录；如果忘记了密码，可在登录页选择「忘记密码」重新设置。</div>
            <div class="tip-row">如果并不是您本人的操作，忽略本邮件即可，您的账号不会受到影响。</div>`,
  });
};

/**
 * 生成「该邮箱未注册」状态提示邮件 HTML
 *
 * 场景：`/member/v1/sendEmail` 的 type=reset 分支，用户填了一个**从未注册过**的邮箱去申请重置密码。
 *
 * 与 genEmailTakenNotice 同理：接口响应不可回显「该邮箱未注册」（同样是枚举通道），
 * 差异只写进这封只有邮箱主人能收到的邮件里。
 *
 * @returns {string} HTML 字符串
 */
export const genEmailNotRegisteredNotice = () => {
  const { APP_NAME } = getApp()?.config || {};
  const safeAppName = escapeHtml(APP_NAME);

  const iconInfo = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>`;

  return mailShell({
    icon: iconInfo,
    title: "邮箱尚未注册",
    subtitle: `该邮箱还不是 ${safeAppName} 的账号`,
    footerApp: safeAppName,
    bodyHtml: `
            <div class="tip-row">您好，我们收到了使用该邮箱重置密码的请求。</div>
            <div class="tip-row">不过这个邮箱<strong>尚未注册过 ${safeAppName} 账号</strong>，因此没有可重置的密码。</div>
            <div class="tip-row">如果您想使用它，请先前往注册页完成注册。</div>
            <div class="tip-row">如果并不是您本人的操作，忽略本邮件即可。</div>`,
  });
};

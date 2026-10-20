/**
 * 富文本 XSS 过滤（宽松白名单策略）
 * 针对文章 content 字段：内容仅由后台登录管理员撰写，因此白名单尽量宽，
 * 保留编辑器产出的全部排版能力（style/class/id/iframe 视频等），
 * 白名单外的属性/标签由 xss 库默认处理，仅额外拦截 on* 事件属性。
 */
import xss from "xss";

// 以 xss 库默认白名单为底（已覆盖 a/img/table/video/audio/source/figure/section 等常规标签）
const whiteList = xss.getDefaultWhiteList();

// 全量放行 style / class / id：编辑器对齐、居中、代码高亮等排版依赖这些属性
for (const tag of Object.keys(whiteList)) {
  for (const attr of ["style", "class", "id"]) {
    if (!whiteList[tag].includes(attr)) whiteList[tag].push(attr);
  }
}

// 视频外链 iframe（B站/腾讯视频等嵌入）
whiteList.iframe = [
  "src", "style", "class", "id", "width", "height",
  "allow", "allowfullscreen", "frameborder", "scrolling", "title", "loading",
];

const xssOptions = {
  whiteList,
  onTagAttr: (tag, name, value, isWhiteAttr) => {
    // 拦截所有 on* 事件属性
    if (name.startsWith("on")) {
      return "";
    }
  },
  // 允许注释
  allowCommentTag: false,
  // 白名单外标签原样输出：是啥就是啥，不转义、不删除
  onIgnoreTag: (tag, html) => html,
  // 不转义
  escapeHtml: false,
};

const myXss = new xss.FilterXSS(xssOptions);

/**
 * 过滤富文本 XSS
 * @param {string} html - 富文本 HTML
 * @returns {string} 过滤后的安全 HTML
 */
export function sanitizeRichText(html) {
  if (!html || typeof html !== "string") return html;
  return myXss.process(html);
}

export default sanitizeRichText;

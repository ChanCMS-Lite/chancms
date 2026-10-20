// 采集清洗逻辑（前端版）
// 把后端 app/middleware/clearhtml.js 的 cleanHtml 用浏览器原生 DOMParser 移植过来，
// 使「解析 + 清洗」真正在前端完成（后端只负责抓取原始 HTML，绕过 CORS）。

/**
 * 通用 HTML 清洗函数（适用于新闻/文章采集）
 * @param {string} html - 原始 HTML 片段
 * @param {Object} inputOptions - 配置项（与后端 cleanHtml 一致）
 * @returns {string} 清洗后的 HTML
 */
export function cleanHtml(html, inputOptions = {}) {
  const defaultOptions = {
    imagePrefix: null,
    // 危险标签全量清理
    removeSelectors: "script, style, iframe, object, embed, form, input, button, textarea, select, option",
    removeTextPatterns: [
      /^来源：/,
      /^作者：/,
      /^编辑：/,
      /^【?责任编辑[：:]?/,
      /^发布时间：/,
      /^时间：/,
      /^阅读量：/,
      /^点击下载/,
      /^点击查看原文/,
      /^分享到：/,
      /^相关新闻：/,
      /^推荐阅读：/,
      /^广告：/,
      /^赞助商：/,
      /^【?纠错】?/,
    ],
    keepStyles: ["text-align"],
    removeAttributes: [
      "class",
      "id",
      "onclick",
      "onload",
      "alt",
      "title",
      "border",
      "width",
      "height",
      "data-*",
    ],
    removeEmptyTags: ["span", "p", "div", "li"],
    unwrapLinks: true,
    collapseWhitespace: true,
    removeHtmlComments: true,
    sanitizeUrls: true,
  };

  const options = { ...defaultOptions, ...inputOptions };

  // removeTextPatterns 支持两种写法：
  //  - 正则对象（后端默认值）
  //  - JSON 配置里的字符串，形如 "/^来源：/"（带分隔符）或普通子串
  const textPatterns = (options.removeTextPatterns || [])
    .map((p) => {
      if (p instanceof RegExp) return p;
      if (typeof p === "string") {
        const m = p.match(/^\/(.*)\/([gimsuy]*)$/);
        if (m) {
          try {
            return new RegExp(m[1], m[2]);
          } catch {
            return null;
          }
        }
        // 普通字符串：转义后按字面量子串匹配
        return new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      }
      return null;
    })
    .filter(Boolean);

  try {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    const root = doc.body;

    // 1. 补全图片域名
    if (options.imagePrefix) {
      root.querySelectorAll("img").forEach((img) => {
        let src = img.getAttribute("src");
        if (!src) return;
        src = src.trim();
        if (/^https?:\/\//i.test(src)) return;
        if (src.startsWith("//")) src = "https:" + src;
        else if (src.startsWith("/"))
          src = options.imagePrefix.replace(/\/+$/, "") + "/" + src.replace(/^\/+/, "");
        else src = options.imagePrefix.replace(/\/+$/, "") + "/" + src;
        img.setAttribute("src", src);
      });
    }

    // 2. 删除指定选择器的元素
    if (options.removeSelectors) {
      root.querySelectorAll(options.removeSelectors).forEach((el) => el.remove());
    }

    // 3. 删除包含干扰文本的元素
    root.querySelectorAll("p, div, span, li").forEach((el) => {
      const text = (el.textContent || "").trim();
      if (
        textPatterns.some((re) => re.test(text)) &&
        el.children.length === 0 &&
        text.length < 100
      ) {
        el.remove();
      }
    });

    // 4. 清理 style 属性
    // keepStyles 按 CSS 属性名匹配（不强制值相等），例如 "margin-left: auto;"
    // 会保留元素上任何 margin-left 声明，解决配置值与实际值不一致时样式丢失。
    const keepPropSet = new Set(
      (options.keepStyles || [])
        .filter((k) => typeof k === "string" && k.trim())
        .map((k) => k.split(":")[0].trim().replace(/\s+/g, "").toLowerCase())
        .filter(Boolean)
    );
    root.querySelectorAll("*").forEach((el) => {
      const style = el.getAttribute("style");
      if (!style || keepPropSet.size === 0) {
        el.removeAttribute("style");
        return;
      }
      const kept = [];
      style.split(";").forEach((decl) => {
        const trimmed = decl.trim();
        if (!trimmed) return;
        const prop = trimmed
          .split(":")[0]
          .trim()
          .replace(/\s+/g, "")
          .toLowerCase();
        if (keepPropSet.has(prop)) kept.push(trimmed);
      });
      if (kept.length) el.setAttribute("style", kept.join("; ") + ";");
      else el.removeAttribute("style");
    });

    // 5. 移除指定属性
    // 支持精确属性名，也支持 `data-*` / `on*` 等前缀通配写法。
    // 不用 querySelectorAll(`[attr]`)，避免属性名含连字符、特殊字符或空字符串时 CSS 选择器语法错误。
    const attrPatterns = (options.removeAttributes || []).map((attr) => {
      const s = String(attr || '').trim();
      if (!s) return null;
      if (s.endsWith('*')) {
        const prefix = s.slice(0, -1).toLowerCase();
        return { type: 'prefix', prefix };
      }
      return { type: 'exact', name: s.toLowerCase() };
    }).filter(Boolean);

    if (attrPatterns.length) {
      root.querySelectorAll('*').forEach((el) => {
        Array.from(el.attributes).forEach(({ name }) => {
          const lower = name.toLowerCase();
          const matched = attrPatterns.some((p) => {
            if (p.type === 'exact') return lower === p.name;
            return lower.startsWith(p.prefix);
          });
          if (matched) el.removeAttribute(name);
        });
      });
    }

    // 6. 去掉 a 标签，保留文本
    if (options.unwrapLinks) {
      root.querySelectorAll("a").forEach((a) => {
        const parent = a.parentNode;
        if (!parent) return;
        while (a.firstChild) parent.insertBefore(a.firstChild, a);
        parent.removeChild(a);
      });
    }

    // 7. 清理 javascript: 协议
    if (options.sanitizeUrls) {
      root.querySelectorAll("a, img, [href], [src]").forEach((el) => {
        ["href", "src"].forEach((attr) => {
          const val = el.getAttribute(attr);
          if (val && val.trim().toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr);
          }
        });
      });
    }

    // 8. 拆掉冗余 span 包裹层：span 是纯内联样式钩子、无语义，
    // 凡是含「元素子节点」的 span 一律拆掉（如 <span><p>...</p><p>...</p></span> -> 多个 <p>），
    // 只保留「纯文字」span（如 <p><span>图注</span></p>），避免内联标签包块级元素。
    unwrapRedundantSpans(root);

    // 9. 迭代清理残留：空标签 + 干扰文本（含嵌套级联，
    // 如 <div>【纠错】 <div></div> <span>【责任编辑】</span></div> 需先拆内层再拆外层）。
    let cruftChanged = true;
    while (cruftChanged) {
      cruftChanged = false;
      if (Array.isArray(options.removeEmptyTags)) {
        options.removeEmptyTags.forEach((tag) => {
          root.querySelectorAll(tag).forEach((el) => {
            if ((el.textContent || "").trim() === "" && el.children.length === 0) {
              el.remove();
              cruftChanged = true;
            }
          });
        });
      }
      root.querySelectorAll("p, div, span, li").forEach((el) => {
        const text = (el.textContent || "").trim();
        if (
          textPatterns.some((re) => re.test(text)) &&
          el.children.length === 0 &&
          text.length < 100
        ) {
          el.remove();
          cruftChanged = true;
        }
      });
    }

    // 10. 拆掉无意义的包裹层：只有一个元素子节点、本身不承载文字的 div/section，
    // 递归拆到稳定（如 <div><div><p>x</p></div></div> -> <p>x</p>），压平源站冗余嵌套。
    flattenWrappers(root, options.flattenTags || ["div", "section", "article", "main", "span"]);

    // 9. 获取最终 HTML
    let resultHtml = root.innerHTML || "";

    // 10. 删除 HTML 注释（最后处理）
    if (options.removeHtmlComments) {
      resultHtml = resultHtml.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 11. 合并空白（最后处理）
    if (options.collapseWhitespace) {
      resultHtml = resultHtml.replace(/\s+/g, " ").trim();
    }

    return resultHtml;
  } catch (error) {
    console.error("cleanHtml error:", error);
    return "";
  }
}

/**
 * 拆掉冗余的 span 包裹层：span 是纯内联样式钩子、无语义价值，
 * 只要它包含「至少一个元素子节点」就原地拆开（把子节点上提、删掉 span）。
 * 仅保留「纯文字」span（如 <p><span>图注</span></p>），避免误删带样式的行内文字。
 * 反复扫描直到稳定（处理 <span><span><p>...</p></span></span> 这类连续嵌套）。
 * @param {Element} root - 根元素（DOMParser 的 body）
 */
function unwrapRedundantSpans(root) {
  let changed = true;
  while (changed) {
    changed = false;
    root.querySelectorAll("span").forEach((span) => {
      if (span.children.length === 0) return; // 纯文字 span 保留
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      changed = true;
    });
  }
}

/**
 * 递归拆掉“纯包裹层”：仅含一个元素子节点、且自身不承载可见文字的标签。
 * 只压平冗余结构壳，不影响真正承载内容的节点。
 * @param {Element} root - 根元素（DOMParser 的 body）
 * @param {string[]} tags - 需要处理的目标标签名
 */
function flattenWrappers(root, tags = ["div", "section", "article", "main", "span"]) {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  let changed = true;
  // 反复扫描直到没有可拆节点（处理连续多层包裹）
  while (changed) {
    changed = false;
    root.querySelectorAll("*").forEach((el) => {
      if (!tagSet.has(el.tagName.toLowerCase())) return;
      // 恰好一个元素子节点（忽略文字，只压平纯结构包裹层）
      if (el.children.length !== 1) return;
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      changed = true;
    });
  }
}

/**
 * 在前端完成「提取标题 + 提取内容 + 清洗」
 * @param {string} html - 抓取到的原始 HTML（整页）
 * @param {Object} opts - { titleTag, articleTag, parseData }
 * @returns {Object} { title, article }
 */
export function extractArticle(html, { titleTag, articleTag, parseData } = {}) {
  let options = {};
  if (typeof parseData === "string") {
    try {
      options = JSON.parse(parseData) || {};
    } catch {
      options = {};
    }
  } else if (parseData && typeof parseData === "object") {
    options = parseData;
  }

  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const title = titleTag ? (doc.querySelector(titleTag)?.textContent || "").trim() : "";
  const articleEl = articleTag ? doc.querySelector(articleTag) : null;
  let article = articleEl ? articleEl.innerHTML : "";
  article = cleanHtml(article, options);

  return { title, article };
}

/**
 * 在前端完成「按 CSS 选择器提取列表链接」并补全相对地址。
 * 替代后端 getPages（cheerio），使采集列表解析也纯前端完成。
 * @param {string} html - 抓取到的列表页原始 HTML
 * @param {string} selector - CSS 选择器（如 ".news-list li a"）
 * @param {string} baseUrl - 列表页完整 URL，用于补全相对链接
 * @returns {string[]} 补全后的绝对链接数组（去重，已过滤空值/非法）
 */
export function extractLinks(html, selector, baseUrl = "") {
  if (!selector) return [];
  try {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    const nodes = doc.querySelectorAll(selector);
    const seen = new Set();
    const result = [];
    nodes.forEach((el) => {
      const href = el.getAttribute("href");
      if (!href) return;
      const raw = href.trim();
      if (!raw || raw.startsWith("javascript:") || raw === "#") return;
      let abs = raw;
      if (raw.startsWith("//")) {
        abs = "https:" + raw;
      } else if (baseUrl && !/^https?:\/\//i.test(raw)) {
        try {
          abs = new URL(raw, baseUrl).href;
        } catch {
          abs = raw;
        }
      }
      if (seen.has(abs)) return;
      seen.add(abs);
      result.push(abs);
    });
    return result;
  } catch (error) {
    console.error("extractLinks error:", error);
    return [];
  }
}

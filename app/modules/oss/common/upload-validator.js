import { getApp, Paths } from "chanjs";
import { isFilenameSafe } from "../../../helper/path.js";

// 内置兜底白名单（当 sys_config.upload_allow_config 缺失/解析失败时使用）
// 安全：移除 text/html、text/javascript、application/javascript 等可执行类型
// 防止上传 HTML/JS 到 public 目录导致存储型 XSS；模板编辑请走 template/CodeFile.save（已加 auth）
// 安全：SVG 可内嵌 <script>（存储型 XSS 面），已从白名单移除；如需矢量图请用 PNG/WebP 或自行消毒
const FALLBACK_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "application/pdf", "audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a", "text/css", "font/ttf", "font/otf", "font/woff", "font/woff2", "application/x-font-ttf", "application/x-font-otf", "application/font-woff", "application/font-woff2", "application/zip", "application/x-zip-compressed", "application/x-rar-compressed", "application/x-7z-compressed", "application/x-tar", "application/gzip", "text/plain"];

/**
 * 运行时读取允许上传的 MIME 类型白名单。
 * 优先取 sys_config.upload_allow_config 合并进 config.upload.allowedTypes（后台可配），
 * 缺失或非法时回退内置 FALLBACK_ALLOWED_TYPES。
 */
const getAllowedTypes = () => {
  const allowed = getApp()?.config?.upload?.allowedTypes;
  return Array.isArray(allowed) && allowed.length > 0 ? allowed : FALLBACK_ALLOWED_TYPES;
};

// 允许的文件扩展名
// 安全：移除 html、htm、js 等可执行扩展名；svg 可内嵌脚本，同样移除（存储型 XSS 面）
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "mkv", "pdf", "mp3", "wav", "ogg", "m4a", "css", "ttf", "otf", "woff", "woff2", "eot", "zip", "rar", "7z", "tar", "gz", "txt"];

/**
 * 获取文件大小限制
 * 注：html/js 在黑名单内，无对应大小分支
 *
 * 唯一来源：sys_config.upload_config（后台以 MB 为单位配置，启动期由 remote-config
 *           ×1024×1024 换算为字节注入 config.upload，后台保存后即时 reload）。
 * 安全网：config/upload.js 无任何 *Size 兜底常量，故 DB 未配置该类型时取值为
 *          undefined/0，此处统一回落 1MB 保守值（fail-closed），避免放开上传限制。
 */
const getFileSizeLimit = (mimetype) => {
  const c = getApp()?.config?.upload || {};
  // 仅按「图片 / 视频 / 音频 / 通用文件」四类分派（后台 upload_config 也只有这四项）。
  // PDF、压缩包、字体、CSS、JS、HTML、TXT 等统一归入 fileSize，不再细分。
  let maxSize;
  if (mimetype.startsWith("image/")) maxSize = c.imgSize;
  else if (mimetype.startsWith("video/")) maxSize = c.videoSize;
  else if (mimetype.startsWith("audio/")) maxSize = c.musicSize;
  else maxSize = c.fileSize;
  // 安全网：config.upload 异常未取到合法上限时回落保守值，避免校验放开限制（非业务默认值）
  if (!Number.isFinite(maxSize) || maxSize <= 0) maxSize = 1 * 1024 * 1024;
  return maxSize;
};

/**
 * 验证文件
 *   mimetype 和 ext 必须同时通过白名单（AND 逻辑）：若为 OR，攻击者伪造
 *   Content-Type: image/jpeg 上传 shell.html 即可绕过；ext=html 不在白名单则直接拒绝。
 */
export const validateFile = (file) => {
  const { mimetype, size, originalname } = file;
  if (!isFilenameSafe(originalname)) throw new Error(`文件名不安全: ${originalname}`);
  const ext = originalname.split(".").pop().toLowerCase();
  // mimetype 和 ext 必须同时在白名单内
  if (!getAllowedTypes().includes(mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`不支持的文件类型: ${mimetype || ext}`);
  }
  const maxSize = getFileSizeLimit(mimetype);
  if (size > maxSize) throw new Error(`文件大小超出限制: 当前 ${(size / 1024 / 1024).toFixed(2)}MB，最大 ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
  return true;
};

/**
 * SVG 消毒（存储型 XSS 防护）
 * SVG 可内嵌 <script>/事件属性/外链实体，静态直达 = 存储型 XSS。
 * 策略：落盘前移除脚本类内容，保留正常矢量图形能力。
 * @param {string} text - SVG 原文
 * @returns {string} 消毒后的 SVG 文本
 */
const sanitizeSvgContent = (text) =>
  String(text)
    // DOCTYPE 内可携带外部实体（XXE/含远端内容），一并移除
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    // <script> 及其内容
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    // 自闭合/无内容 script
    .replace(/<script[^>]*\/?>/gi, "")
    // 事件属性 on*（onclick/onload/...）
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // javascript:/data:text/html 伪协议
    .replace(/(href|xlink:href|src)\s*=\s*("|')\s*(javascript:|data:text\/html)[^"']*\2/gi, '$1="#"')
    // foreignObject 可承载任意 HTML
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "");

/**
 * 对磁盘上的 SVG 文件做消毒（读原文→清洗→覆盖写回）
 * @param {string} filePath - SVG 文件绝对路径
 */
export const sanitizeSvgFile = async (filePath) => {
  const fs = await import("fs/promises");
  const text = await fs.readFile(filePath, "utf8");
  const clean = sanitizeSvgContent(text);
  if (clean !== text) {
    await fs.writeFile(filePath, clean, "utf8");
  }
};

/**
 * 处理上传响应
 */
export const handleResponse = (req, files) => {
  const isArray = Array.isArray(files);
  const result = (isArray ? files : [files]).map((file) => {
    let filePath = file.path.replace(/\\/g, "/");
    if (filePath.startsWith(Paths.rootPath)) filePath = filePath.replace(Paths.rootPath, "");
    if (!filePath.startsWith("/")) filePath = "/" + filePath;
    return { originalname: file.originalname, filename: file.filename, path: filePath, url: `${req.protocol}://${req.get("host")}${filePath}`, size: file.size, mimetype: file.mimetype };
  });
  return isArray ? result : result[0];
};
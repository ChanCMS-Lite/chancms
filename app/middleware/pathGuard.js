import path from "path";
import { Paths, getApp } from "chanjs";

// 允许文件操作的根目录白名单
// OSS 文件管理界面（/oss）的目录面板根目录 = /public，因此整个 public 都应可管理
const ALLOWED = [
  path.join(Paths.rootPath, "view"),
  path.join(Paths.rootPath, "public"),
];

/**
 * 检查路径是否在允许目录下
 * @param {string} raw - 用户输入的路径
 * @param {string} [baseDir] - 相对路径的解析基准（绝对路径）；缺省按项目根解析
 * @returns {string|null} 安全绝对路径，不安全返回 null
 * @description
 * 支持三种输入形式：
 * 1. 绝对路径且在允许目录内：直接校验
 * 2. 相对 baseDir 的路径（如 OSS 的 /blince/xxx 相对 public/uploads）：拼到 baseDir 下校验
 * 3. 相对项目根的路径（如 /public/uploads/xxx）：拼到 rootPath 下校验
 */
export const isAllowed = (raw, baseDir) => {
  if (!raw) return null;
  let normalized = raw;
  // 防御：去掉可能的 http(s)://host 前缀
  // 上传接口返回的 url 有时带完整域名（如 http://localhost:3000/public/cover/x.jpg），
  // 这里归一化为纯路径，避免 pathGuard 误判为越权而拒绝。
  const originMatch = /^https?:\/\/[^/]+(\/.*)$/.exec(normalized);
  if (originMatch) normalized = originMatch[1];
  // 绝对路径：直接校验；相对路径：/public/ 开头按项目根解析，其余拼 baseDir（缺省拼项目根）
  // 注：封面图（/public/cover/x.webp）与文件管理器的文件（/public/uploads/x.jpg）都是「相对项目根」路径，
  // 不能按 uploads 基准拼接，否则解析成 public/uploads/public/... 导致删除报「文件不存在」。
  const candidate = normalized.startsWith(Paths.rootPath)
    ? normalized
    : /^[/\\]public([/\\]|$)/.test(normalized)
      ? path.join(Paths.rootPath, normalized.replace(/^[\\/]+/, ""))
      : baseDir
        ? path.join(baseDir, normalized.replace(/^[\\/]+/, ""))
        : path.join(Paths.rootPath, normalized.replace(/^[\\/]+/, ""));
  const target = path.resolve(candidate);
  const ok = ALLOWED.some((base) => target === base || target.startsWith(base + path.sep));
  return ok ? target : null;
};

/**
 * 路径安全中间件
 * @param {string} paramName - 参数名，默认 "path"
 * @param {string} [baseDir] - 相对路径的解析基准（绝对路径），OSS 等传 uploads 根
 */
export const pathGuard = (paramName = "path", baseDir) => (req, res, next) => {
  const raw = req.body?.[paramName] ?? req.query?.[paramName];
  const safe = isAllowed(raw, baseDir);
  if (!safe) return res.status(403).json({ success: false, msg: raw ? "路径不允许" : "文件路径不能为空" });
  req.safePath = safe;
  next();
};
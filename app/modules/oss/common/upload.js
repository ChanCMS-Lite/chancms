import { getApp, Paths } from "chanjs";
import multer from "multer";
import dayjs from "dayjs";
import fsp from "fs/promises";
import path from "path";
import { isAllowed } from "../../../middleware/pathGuard.js";
import { validateFile, sanitizeSvgFile } from "./upload-validator.js";

/**
 * 根据文件扩展名和 mimetype 判断文件类型目录
 * 注：html/js 在黑名单内，无对应目录分支
 */
const getFileTypeDir = (filename, mimetype) => {
  const ext = filename.split(".").pop().toLowerCase();

  if (ext === "pdf" || mimetype === "application/pdf") return "pdf";
  if (["mp4", "mov", "avi", "mkv"].includes(ext) || mimetype?.startsWith("video/")) return "video";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) || mimetype?.startsWith("image/")) return "image";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext) || mimetype?.startsWith("audio")) return "audio";
  if (ext === "css" || mimetype === "text/css") return "css";
  if (["ttf", "otf", "woff", "woff2"].includes(ext) || mimetype?.includes("font")) return "font";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (ext === "txt" || mimetype === "text/plain") return "txt";

  return "other";
};

/**
 * 创建 multer 磁盘存储引擎
 * @param {string} dir - 上传根目录（如 "uploads"）
 * @param {boolean} changeDir - 是否按文件类型+日期分子目录
 * @param {string|null} customDir - 自定义目录（必须位于 view/ 或 public/ 下）
 */
function createStorage(dir = getApp()?.config?.upload?.uploadDir || "uploads", changeDir = true, customDir = null) {
  // 安全收敛：上传根目录只允许单个相对段，禁止路径穿越（..、前导斜杠等）
  const safeDir = String(dir || "uploads")
    .replace(/^[\\/]+/, "")
    .replace(/[\\/]+$/, "")
    .split(/[\\/]+/)
    .filter((seg) => seg && seg !== "..")
    .pop() || "uploads";
  return multer.diskStorage({
    destination: async function (req, file, cb) {
      const template = getApp()?.config?.template || "default";
      let destinationDir = "";

      if (customDir) {
        // 自定义目录安全校验：只允许 view/ 或 public/ 下的相对路径
        const cleanDir = customDir.replace(/^[\\/]+/, "").replace(/[\\/]+$/, "");

        let basePath;
        let relativeDir;
        const lowerDir = cleanDir.toLowerCase();

        if (lowerDir === "view" || lowerDir.startsWith("view/")) {
          basePath = Paths.rootPath;
          relativeDir = cleanDir;
        } else if (lowerDir === "public" || lowerDir.startsWith("public/")) {
          basePath = path.join(Paths.rootPath, "public");
          relativeDir = cleanDir.slice("public/".length);
        } else {
          throw new Error("自定义目录必须在 view/ 或 public/ 下");
        }

        destinationDir = isAllowed(path.join(basePath, relativeDir));
      } else if (changeDir) {
        const fileType = getFileTypeDir(file.originalname, file.mimetype);
        const date = dayjs(Date.now()).format("YYYY/MM/DD");
        destinationDir = path.join(`public/`, safeDir, template, fileType, date);
      } else {
        destinationDir = path.join(`public/`, safeDir, template);
      }

      await fsp.mkdir(destinationDir, { recursive: true });
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `${Date.now()}.${ext}`);
    },
  });
}

/**
 * 创建 multer 上传中间件（延迟到请求时才实例化 multer）。
 *
 * 为什么不在这里（路由注册时）直接创建 multer 实例？
 * - 路由注册（loadModuleRouter）发生在 #loadRoutes，早于 beforeStart 钩子执行；
 * - 而 config.upload.imgSize / fileSize / logoSize 由 loadRemoteConfig（beforeStart）
 *   从 sys_config 注入。若在路由注册时就把 size 固化进 multer 的 limits.fileSize，
 *   则永远使用默认值（imgSize=200KB），后台配置的 500000 永远不会生效。
 * - 改为「每次请求时」实时读取 config.upload.*：后台改完配置经 loadRemoteConfig 重载后即时生效。
 *
 * @param {Object} opts
 * @param {number} [opts.max=20] 最大文件数
 * @param {string} [opts.sizeKey] 从 config.upload[sizeKey] 读取大小限制（优先级高于 imageOnly 自动判定）
 * @param {number} [opts.size] 显式硬编码大小限制（最高优先；通常无需传，留空走动态读取）
 * @param {boolean} [opts.imageOnly=false] 仅允许图片（按 mimetype 前缀判断）
 * @param {string[]} [opts.allowedTypes] 白名单 MIME（与 imageOnly 二选一）
 * @param {'array'|'single'} [opts.mode='array'] 单文件/多文件
 * @param {string|null} [opts.customDir] 自定义目录（必须 view/ 或 public/ 下）
 * @param {boolean} [opts.changeDir=true] 是否按类型+日期分子目录
 */
function makeUploadMiddleware({ max = 20, sizeKey = null, size = null, imageOnly = false, allowedTypes = null, mode = "array", customDir = null, changeDir = true } = {}) {
  return (req, res, next) => {
    // 请求时实时取值（此时 beforeStart 早已注入 config.upload.*）
    let uploadSize;
    if (size != null) {
      uploadSize = size;
    } else if (sizeKey) {
      uploadSize = getApp()?.config?.upload?.[sizeKey];
    } else if (imageOnly) {
      uploadSize = getApp()?.config?.upload?.imgSize;
    } else {
      uploadSize = getApp()?.config?.upload?.fileSize;
    }
    // 安全网：大小限制唯一来源为 sys_config.upload_config（后台以 MB 配置）。
    // DB 未配置该类型时取值为 undefined/0，回落 1MB 保守值（fail-closed），
    // 避免 multer 因 limits.fileSize 为 undefined 而放开大小限制（非业务默认值）。
    if (!Number.isFinite(uploadSize) || uploadSize <= 0) {
      console.warn("[upload] config.upload 未取到合法大小上限，回落 1MB 安全兜底");
      uploadSize = 1 * 1024 * 1024;
    }

    const upload = multer({
      storage: createStorage(undefined, changeDir, customDir),
      limits: { fileSize: uploadSize, files: max },
      fileFilter: (req, file, cb) => {
        try {
          // 安全收口：一律拒绝 SVG（存储型 XSS 风险），所有上传入口生效
          if (file.mimetype === "image/svg+xml" || /\.svg$/i.test(String(file.originalname || ""))) {
            return cb(new Error("不允许上传 SVG 文件"));
          }
          if (imageOnly && !file.mimetype.startsWith("image/")) {
            return cb(new Error("仅允许上传图片文件"));
          }
          if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
            return cb(new Error("不支持的文件类型"));
          }
          validateFile(file);
          cb(null, true);
        } catch (err) {
          cb(err);
        }
      },
    });

    const runMulter = mode === "single"
      ? upload.single("file")
      : upload.array("file", max);

    // SVG 已在 fileFilter 硬拒绝，落盘后无需再消毒
    return runMulter(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

/**
 * Logo 上传（仅允许图片格式，单文件）
 * 大小限制实时读取 config.upload.imgSize（来自 sys_config，后台以 MB 配置；未配置回落 1MB）
 * upload_config 为「图片/视频/音频/通用文件」四类，Logo 归入图片类，不单独配置。
 */
export const logo = () =>
  makeUploadMiddleware({
    max: 1,
    mode: "single",
    sizeKey: "imgSize",
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    changeDir: false,
  });

/**
 * 封面图上传（仅图片，扁平存入 public/cover，不分日期目录）
 * 大小限制实时读取 config.upload.imgSize（来自 sys_config，后台以 MB 配置；未配置回落 1MB）
 */
export const coverUpload = () =>
  makeUploadMiddleware({
    imageOnly: true,
    sizeKey: "imgSize",
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    customDir: "public/cover",
    changeDir: false,
  });

/**
 * 统一多文件上传中间件（请求时动态实例化）。
 * @param {Object} options
 * @param {number} options.max - 最大文件数（默认 20，前端可通过 query.max 覆盖）
 * @param {number} [options.size] - 单文件最大字节数（通常不传，按 imageOnly 自动取 imgSize / fileSize，来自 sys_config.upload_config）
 * @param {boolean} options.imageOnly - 是否仅允许图片
 *
 * 注：size 不在此固化——multer 在请求时才创建，届时实时读取后台配置的 imgSize / fileSize。
 */
export const multiUpload = ({ max = 20, size, imageOnly = false, changeDir = true, customDir = null } = {}) =>
  makeUploadMiddleware({ max, size, imageOnly, changeDir, customDir });
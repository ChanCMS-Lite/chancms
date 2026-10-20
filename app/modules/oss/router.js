import path from "path";
import { loader, getApp, Paths } from "chanjs";
import auth from "../../middleware/auth.js";
import { multiUpload, logo, coverUpload } from "./common/upload.js";
import init from "../web/middleware/init.js";
import { pathGuard } from "../../middleware/pathGuard.js";

/**
 * OSS 模块路由
 *
 * 路由前缀：/oss
 * 认证方式：auth() 中间件
 *
 * 上传接口统一为多文件模式（multiUpload），通过 query.max 控制最大文件数：
 *   - max=1 表示单文件
 *   - max=N 表示多文件（默认 20）
 *
 * 每种存储后端提供两个上传接口：
 *   /imgs  - 仅图片（imageOnly: true）
 *   /files - 所有文件类型（含 PDF/视频/压缩包等）
 *
 * Lite 精简版仅支持本地（local）存储后端：
 *   /oss/local/imgs | /oss/local/files | /oss/local/logo | /oss/local/cover ...
 * 云存储（七牛/阿里/腾讯）已裁剪，详见下方路由注释。
 */
export default async (app, router, config) => {
  let controller = await loader.loadController("oss");

  router.use(init());

  // ==================== 本地存储 ====================
  // 图片上传（多图，max 参数控制）
  router.post("/local/imgs", auth(), multiUpload({ imageOnly: true }), controller.Upload.uploadImgs);
  // 文件上传（多文件，max 参数控制）
  router.post("/local/files", auth(), multiUpload({ }), controller.Upload.uploadFiles);
  // Logo 专用（单图，不分日期目录）
  router.post("/local/logo", auth(), logo(), controller.Upload.uploadImgs);
  // 封面图（扁平存到 public/cover）
  router.post("/local/cover", auth(), coverUpload(), controller.Upload.uploadCover);
  // 封面图列表（枚举 public/cover 根目录）
  router.get("/local/cover/list", auth(), controller.Upload.listCover);
  // 文件管理
  // 注：OSS 管理页（/oss）传入的 url/folderPath 是「相对 public/uploads 根」的路径（如 /blince/xxx），
  // 因此 pathGuard 需以 uploads 目录为基准解析相对路径（绝对路径不受影响）
  const uploadsRoot = path.join(Paths.rootPath, "public", getApp()?.config?.upload?.uploadDir || "uploads");
  router.post("/local/delete", auth(), pathGuard("url", uploadsRoot), controller.Upload.deleteFile);
  router.get("/local/extract", auth(), pathGuard("url", uploadsRoot), controller.Upload.extractArchive);
  router.post("/local/copy", auth(), controller.Upload.copyFile);
  router.post("/local/move", auth(), controller.Upload.moveFile);
  router.post("/local/rename", auth(), controller.Upload.renameFile);
  router.get("/local/relativePath", auth(), pathGuard("url", uploadsRoot), controller.Upload.getRelativePath);
  router.post("/local/createFolder", auth(), pathGuard("folderPath", uploadsRoot), controller.Upload.createFolder);
  router.post("/local/compress", auth(), controller.Upload.compressFiles);

  // ==================== 云存储（七牛/阿里/腾讯）已裁剪 ====================
  // Lite 精简版仅保留本地上传，云存储后端代码（controller/service）+ 前端直传 + 种子配置均已移除。
  // 如需云存储，请从 Pro 同步对应模块并在此处恢复路由。

  // ==================== multer 错误处理中间件 ====================
  // 捕获 multer fileFilter/limits 抛出的错误（如"仅允许上传图片文件"、"文件大小超出限制"）
  // 转换为业务错误格式，避免返回 5001 系统错误
  router.use((err, req, res, next) => {
    if (err && (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' || err.message)) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? '文件大小超出限制'
        : err.code === 'LIMIT_FILE_COUNT' ? '文件数量超出限制'
        : err.code === 'LIMIT_UNEXPECTED_FILE' ? '未收到预期的文件字段'
        : err.message || '上传失败';
      return res.json({ success: false, code: 1007, msg, data: null });
    }
    next(err);
  });

  app.use("/oss", router);
};

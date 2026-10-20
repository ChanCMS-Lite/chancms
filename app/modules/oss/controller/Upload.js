import { isAllowed } from "../../../middleware/pathGuard.js";
import { validateFile, handleResponse } from "../common/upload-validator.js";
import { existsAsync } from "../../../helper/file.js";
import path from "path";
import fsp from "fs/promises";
import AdmZip from "adm-zip";
import { Paths, logger, getApp } from "chanjs";

import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import {
  deleteFileSchema,
  extractArchiveSchema,
  getRelativePathSchema,
  createFolderSchema,
  copyFileSchema,
  moveFileSchema,
  renameFileSchema,
  compressFilesSchema,
} from "../validator/Upload.js";

// 上传校验类业务错误（message 含这些关键词时按 200 + fail 返回，而非交给全局 500 处理）
const UPLOAD_ERROR_KEYWORDS = ["文件大小超出限制", "不支持的文件类型", "文件名不安全", "仅允许上传图片文件"];
const isUploadValidationError = (err) => UPLOAD_ERROR_KEYWORDS.some((k) => err.message.includes(k));

// OSS 管理页传入的相对路径（/blince/xxx）基准 = public/uploads；绝对路径不受影响
const uploadsRoot = () => path.join(Paths.rootPath, "public", getApp()?.config?.upload?.uploadDir || "uploads");

class UploadController extends Controller {
  // 多文件上传（图片/文件通用）
  // 路由层已用 multiUpload({ imageOnly }) 区分图片/文件
  async uploadFiles(req, res, next) {
    try {
      const files = req.file ? [req.file] : req.files;
      if (!files?.length) throw new Error("未收到文件");
      for (const file of files) validateFile(file);
      res.json(this.success({ data: handleResponse(req, files) }));
    } catch (err) {
      if (isUploadValidationError(err)) return res.json(this.fail({ msg: err.message }));
      next(err);
    }
  }

  // 图片上传（多图统一入口，max=1 即单图）
  async uploadImgs(req, res, next) {
    try {
      const files = req.file ? [req.file] : req.files;
      if (!files?.length) throw new Error("未收到图片文件");
      const data = handleResponse(req, files).map((item) => ({ ...item, thumbnail: `${item.url}?width=200` }));
      res.json(this.success({ data }));
    } catch (err) {
      if (isUploadValidationError(err)) return res.json(this.fail({ msg: err.message }));
      next(err);
    }
  }

  // 封面图上传（扁平存到 public/cover，复用 uploadImgs 的响应结构）
  async uploadCover(req, res, next) {
    try {
      const files = req.file ? [req.file] : req.files;
      if (!files?.length) throw new Error("未收到图片文件");
      // 统一返回相对路径（/public/cover/xxx.jpg），与 listCover 保持一致，
      // 便于前端选中/删除以及文章封面字段存储相对路径。
      const data = handleResponse(req, files).map((item) => ({
        ...item,
        url: item.path,
        thumbnail: `${item.path}?width=200`,
      }));
      res.json(this.success({ data }));
    } catch (err) {
      if (isUploadValidationError(err)) return res.json(this.fail({ msg: err.message }));
      next(err);
    }
  }

  // 列举 public/cover 根目录下的封面图（安全：固定目录、不接收用户输入、不递归子目录）
  async listCover(req, res, next) {
    try {
      const dir = path.join(Paths.rootPath, "public", "cover");
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const allowedExt = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
      const list = [];
      for (const e of entries) {
        if (!e.isFile()) continue; // 只列文件，不进入 sea 等子目录
        const ext = e.name.split(".").pop().toLowerCase();
        if (!allowedExt.includes(ext)) continue;
        const stat = await fsp.stat(path.join(dir, e.name));
        list.push({
          name: e.name,
          url: `/public/cover/${e.name}`,
          size: stat.size,
          mtime: stat.mtimeMs,
        });
      }
      list.sort((a, b) => b.mtime - a.mtime);
      res.json(this.success({ data: { list } }));
    } catch (error) {
      logger.error("List cover error:", error);
      res.json(this.fail({ msg: error.message || "读取封面目录失败" }));
    }
  }

  async deleteFile(req, res, next) {
    try {
      // POST 路由：url 在请求体（封面弹窗/文件管理均发 body）；兼容旧版 GET query 传参
      const vdata = validated(deleteFileSchema, req.body?.url != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const filePath = req.safePath;
      if (!filePath) return res.json(this.fail({ msg: "文件路径不能为空" }));
      if (!(await existsAsync(filePath))) return res.json(this.fail({ msg: "文件不存在: " + vdata.url }));
      const stats = await fsp.stat(filePath);
      if (stats.isDirectory()) await fsp.rm(filePath, { recursive: true, force: true });
      else await fsp.unlink(filePath);
      res.json(this.success({ msg: "删除成功" }));
    } catch (error) {
      logger.error("Delete file error:", error);
      res.json(this.fail({ msg: error.message || "删除失败" }));
    }
  }

  async extractArchive(req, res, next) {
    try {
      const vdata = validated(extractArchiveSchema, req.query, res, this);
      if (vdata === undefined) return;
      const filePath = req.safePath;
      if (!filePath) return res.json(this.fail({ msg: "文件路径不能为空" }));
      if (!(await existsAsync(filePath))) return res.json(this.fail({ msg: "文件不存在" }));
      const stats = await fsp.stat(filePath);
      if (stats.isDirectory()) return res.json(this.fail({ msg: "不是压缩包文件" }));
      const ext = path.extname(filePath).toLowerCase();
      if (![".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) return res.json(this.fail({ msg: "不支持的压缩包格式" }));
      if (ext !== ".zip") return res.json(this.fail({ msg: "当前仅支持 ZIP 格式解压" }));
      const extractDirName = path.basename(filePath, ext);
      const extractPath = path.join(path.dirname(filePath), extractDirName);
      const safeExtractPath = isAllowed(extractPath);
      if (!safeExtractPath) return res.json(this.fail({ msg: "解压路径不安全" }));
      if (await existsAsync(safeExtractPath)) await fsp.rm(safeExtractPath, { recursive: true, force: true });
      await fsp.mkdir(safeExtractPath, { recursive: true });
      const zip = new AdmZip(filePath);
      // Zip Slip 防护：逐个校验 entry 路径，防止 .. 路径穿越
      const dangerousEntries = [];
      for (const entry of zip.getEntries()) {
        const targetEntryPath = path.resolve(safeExtractPath, entry.entryName);
        if (!targetEntryPath.startsWith(safeExtractPath + path.sep) && targetEntryPath !== safeExtractPath) {
          dangerousEntries.push(entry.entryName);
        }
      }
      if (dangerousEntries.length > 0) {
        await fsp.rm(safeExtractPath, { recursive: true, force: true });
        return res.json(this.fail({ msg: `压缩包含不安全路径: ${dangerousEntries.join(", ")}` }));
      }
      zip.extractAllTo(safeExtractPath, true);
      const extractRelativePath = path.relative(Paths.rootPath, safeExtractPath).replace(/\\/g, "/");
      const extractedFiles = [];
      const walkDir = async (dir, relativePath = "") => {
        const files = await fsp.readdir(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const relativeFilePath = path.join(relativePath, file);
          const fileStats = await fsp.stat(fullPath);
          if (fileStats.isDirectory()) await walkDir(fullPath, relativeFilePath);
          else extractedFiles.push({ filename: file, path: `/${extractRelativePath}/${relativeFilePath}`.replace(/\\/g, "/"), size: fileStats.size });
        }
      };
      await walkDir(safeExtractPath);
      res.json(this.success({ msg: "解压成功", data: { extractPath: `/${extractRelativePath}`, fileCount: extractedFiles.length, files: extractedFiles } }));
    } catch (error) {
      logger.error("Extract archive error:", error);
      res.json(this.fail({ msg: error.message || "解压失败" }));
    }
  }

  async copyFile(req, res, next) {
    try {
      const vdata = validated(copyFileSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { sourceUrl, targetUrl } = req.body;
      const sourcePath = isAllowed(sourceUrl, uploadsRoot());
      const targetPath = isAllowed(targetUrl, uploadsRoot());
      if (!sourcePath || !targetPath) return res.json(this.fail({ msg: "源路径和目标路径不能为空" }));
      if (!(await existsAsync(sourcePath))) return res.json(this.fail({ msg: "源文件不存在" }));
      if (await existsAsync(targetPath)) return res.json(this.fail({ msg: "目标路径已存在" }));
      const stats = await fsp.stat(sourcePath);
      if (stats.isDirectory()) {
        await fsp.mkdir(targetPath, { recursive: true });
        const copyRecursive = async (src, dest) => {
          const entries = await fsp.readdir(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) { await fsp.mkdir(destPath, { recursive: true }); await copyRecursive(srcPath, destPath); }
            else await fsp.copyFile(srcPath, destPath);
          }
        };
        await copyRecursive(sourcePath, targetPath);
      } else {
        await fsp.mkdir(path.dirname(targetPath), { recursive: true });
        await fsp.copyFile(sourcePath, targetPath);
      }
      res.json(this.success({ msg: "复制成功" }));
    } catch (error) {
      logger.error("Copy file error:", error);
      res.json(this.fail({ msg: error.message || "复制失败" }));
    }
  }

  async moveFile(req, res, next) {
    try {
      const vdata = validated(moveFileSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { sourceUrl, targetUrl } = req.body;
      const sourcePath = isAllowed(sourceUrl, uploadsRoot());
      const targetPath = isAllowed(targetUrl, uploadsRoot());
      if (!sourcePath || !targetPath) return res.json(this.fail({ msg: "源路径和目标路径不能为空" }));
      if (!(await existsAsync(sourcePath))) return res.json(this.fail({ msg: "源文件不存在" }));
      if (await existsAsync(targetPath)) return res.json(this.fail({ msg: "目标路径已存在" }));
      await fsp.mkdir(path.dirname(targetPath), { recursive: true });
      await fsp.rename(sourcePath, targetPath);
      res.json(this.success({ msg: "移动成功" }));
    } catch (error) {
      logger.error("Move file error:", error);
      res.json(this.fail({ msg: error.message || "移动失败" }));
    }
  }

  async renameFile(req, res, next) {
    try {
      const vdata = validated(renameFileSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { sourceUrl, newName } = req.body;
      const sourcePath = isAllowed(sourceUrl, uploadsRoot());
      if (!sourcePath || !newName) return res.json(this.fail({ msg: "源路径和新名称不能为空" }));
      if (!/^[a-zA-Z0-9_\-\u4e00-\u9fa5.]+$/.test(newName)) return res.json(this.fail({ msg: "新文件名不安全" }));
      if (!(await existsAsync(sourcePath))) return res.json(this.fail({ msg: "源文件不存在" }));
      const targetPath = path.join(path.dirname(sourcePath), newName);
      const safeTargetPath = isAllowed(targetPath);
      if (!safeTargetPath) return res.json(this.fail({ msg: "目标路径不安全" }));
      if (await existsAsync(safeTargetPath)) return res.json(this.fail({ msg: "目标名称已存在" }));
      await fsp.rename(sourcePath, safeTargetPath);
      res.json(this.success({ msg: "重命名成功" }));
    } catch (error) {
      logger.error("Rename file error:", error);
      res.json(this.fail({ msg: error.message || "重命名失败" }));
    }
  }

  async getRelativePath(req, res, next) {
    try {
      const vdata = validated(getRelativePathSchema, req.query, res, this);
      if (vdata === undefined) return;
      const filePath = req.safePath;
      if (!filePath) return res.json(this.fail({ msg: "文件路径不能为空" }));
      if (!(await existsAsync(filePath))) return res.json(this.fail({ msg: "文件不存在" }));
      const basePath = path.join(Paths.rootPath, "public");
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, "/");
      res.json(this.success({ data: { relativePath: relativePath.startsWith("/") ? relativePath : "/" + relativePath, fullPath: filePath } }));
    } catch (error) {
      logger.error("Get relative path error:", error);
      res.json(this.fail({ msg: error.message || "获取路径失败" }));
    }
  }

  async createFolder(req, res, next) {
    try {
      const vdata = validated(createFolderSchema, req.query, res, this);
      if (vdata === undefined) return;
      const safePath = req.safePath;
      if (!safePath) return res.json(this.fail({ msg: "文件夹路径不能为空" }));
      if (await existsAsync(safePath)) return res.json(this.fail({ msg: "文件夹已存在" }));
      await fsp.mkdir(safePath, { recursive: true });
      res.json(this.success({ msg: "文件夹创建成功" }));
    } catch (error) {
      logger.error("Create folder error:", error);
      res.json(this.fail({ msg: error.message || "创建文件夹失败" }));
    }
  }

  async compressFiles(req, res, next) {
    try {
      const vdata = validated(compressFilesSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { files, folderPath, zipName } = req.body;
      const uploadRoot = path.join(Paths.rootPath, "public", getApp()?.config?.upload?.uploadDir || "uploads");
      const targetDir = folderPath ? isAllowed(folderPath) : uploadRoot;
      if (!targetDir) return res.json(this.fail({ msg: "文件夹路径不能为空" }));
      if (!files || !Array.isArray(files) || files.length === 0) return res.json(this.fail({ msg: "请选择要压缩的文件" }));
      const safeFiles = files.map((f) => isAllowed(f)).filter(Boolean);
      if (safeFiles.length !== files.length) return res.json(this.fail({ msg: "存在不安全的文件路径" }));
      const finalZipName = path.basename(zipName || `archive_${Date.now()}.zip`) || `archive_${Date.now()}.zip`;
      // 防路径穿越：无论 zipName 传什么路径串，只取 basename，杜绝用 ../ 逃逸到目标目录之外任意写入
      const zipFilePath = path.join(targetDir, finalZipName);
      if (await existsAsync(zipFilePath)) return res.json(this.fail({ msg: "压缩文件已存在" }));
      const zip = new AdmZip();
      for (const file of safeFiles) {
        if (await existsAsync(file)) {
          const stats = await fsp.stat(file);
          if (stats.isDirectory()) zip.addLocalFolder(file, path.basename(file));
          else zip.addLocalFile(file, "", path.basename(file));
        }
      }
      zip.writeZip(zipFilePath);
      const basePath = path.join(Paths.rootPath, "public", getApp()?.config?.upload?.uploadDir || "uploads");
      res.json(this.success({ msg: "压缩成功", data: { zipName: finalZipName, zipPath: path.relative(basePath, zipFilePath).replace(/\\/g, "/") } }));
    } catch (error) {
      logger.error("Compress files error:", error);
      res.json(this.fail({ msg: error.message || "压缩失败" }));
    }
  }
}
export default new UploadController();

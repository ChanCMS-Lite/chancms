import { getFileTree, existsAsync } from "../../../helper/file.js";
import { isAllowed } from "../../../middleware/pathGuard.js";
import path from "path";
import fsp from "fs/promises";
import { Controller, Paths, logger, getApp } from "chanjs";
import { readFileContent, saveFileContent } from "chanjs/utils/index.js";
import { validated } from "../../../common/validate.js";
import { treeSchema, ossSchema, contentSchema, saveSchema } from "../validator/CodeFile.js";

class CodeFileController extends Controller {
  // 读取：二进制文件（图片）按 base64 处理，文本文件按字符串读取
  readExts = [".html", ".js", ".css", ".json", ".md", ".txt", ".xml", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico"];
  // 写入：禁止写入 .js 文件（防止 RCE）；二进制文件需要专用上传接口
  writeExts = [".html", ".css", ".md", ".txt", ".xml", ".json"];

  getBasePath(template = "default") {
    return path.join(Paths.rootPath, "view", template);
  }

  resolveFilePath(template, filePath, forWrite = false) {
    // isAllowed 内部已统一处理绝对/相对路径拼接
    const safePath = isAllowed(filePath);
    if (!safePath) throw new Error("路径不允许");
    const ext = path.extname(safePath).toLowerCase();
    const allowed = forWrite ? this.writeExts : this.readExts;
    if (!allowed.includes(ext)) throw new Error(`不允许的文件类型: ${ext}`);
    return safePath;
  }

  validateContent(content, filePath) {
    if (typeof content !== "string") throw new Error("文件内容必须是字符串");
    const ext = path.extname(filePath).toLowerCase();
    // html/css 为纯文本前端资源，不做整体清洗（清洗会实体转义 < > 摧毁模板）
    if (ext === ".css" || ext === ".js") return;

    // .html 是 art-template 模板：允许合法 <script> 与模板语法，但 {{ }} 表达式会被
    // art-template 编译成函数执行，可借原型链逃逸拿到 Node 进程（如
    // {{ ''.constructor.constructor('return process')() }}）→ 模板写入等于 RCE。
    // 这里对【表达式内部】做危险构造拦截（只扫 {{ }}，不扫整份 HTML，避免误伤文案）。
    // 注意：这是「抬高门槛」而非根治（字符串拼接/Unicode 转义可绕过），
    //    根治需在框架层为 art-template 提供沙箱运行时。
    // 不能拦 `global`：它是本 CMS 模板的一等变量（如 {{if global && global.list[0]}}）。
    if (ext === ".html") {
      // 白名单思路：先把表达式里的 Unicode 转义 / 字符串拼接还原，再做危险构造扫描。
      // 单纯 \bword\b 黑名单可被 \u0063onstructor 或 ["constructor"] 绕过，
      // 这里解码 \uXXXX 与 \xXX，并同时扫 bracket 访问形式 ['constructor']。
      const exprs = content.match(/\{\{[\s\S]*?\}\}/g) || [];
      for (const raw of exprs) {
        // 解码 Unicode/hex 转义，让混淆现出原形
        let decoded = raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
        decoded = decoded.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
        // 去掉空白，防 "con structor" 之类
        const compact = decoded.replace(/\s+/g, "");

        // 危险标识符（含 bracket 访问形式 ['constructor']）
        const DANGEROUS = /(constructor|__proto__|prototype|process|require|globalThis|child_process|eval|Function|global\s*\.|root\s*\.|mainModule|binding|_load|__dirname|__filename)/i;
        // 函数调用逃逸：xxx( 形式（排除已知安全的过滤器/helper）
        const DANGEROUS_CALL = /\b(require|eval|Function|setTimeout|setInterval|setImmediate|exec|spawn|execSync)\s*\(/;
        // 字符串到代码：new Function( / .constructor(
        const NEWFUNC = /new\s+Function|\.constructor\s*\(|\(\s*function\s*\(\s*\)\s*\{/;

        if (DANGEROUS.test(compact) || DANGEROUS_CALL.test(compact) || NEWFUNC.test(compact)) {
          throw new Error(
            `模板表达式含危险构造，已拒绝保存：${raw.replace(/\s+/g, " ").slice(0, 80)}`
          );
        }
      }
      return;
    }

    if (ext === ".json") { try { JSON.parse(content); } catch (e) { throw new Error("JSON 文件内容格式不正确"); } }
    // SVG 安全：禁止内嵌脚本与事件处理器，防止存储型 XSS
    if (ext === ".svg") {
      const lower = content.toLowerCase();
      if (/<script[\s/>]/.test(lower) || /<\/script>/.test(lower)) {
        throw new Error("SVG 文件禁止包含 <script> 标签");
      }
      if (/\son\w+\s*=/.test(lower)) {
        throw new Error("SVG 文件禁止包含事件处理属性");
      }
    }
  }

  async tree(req, res, next) {
    try {
      const vdata = validated(treeSchema, req.query, res, this);
      if (vdata === undefined) return;
      const fullPath = this.getBasePath(req.query.template);
      if (!(await existsAsync(fullPath))) await fsp.mkdir(fullPath, { recursive: true });
      const tree = await getFileTree(fullPath, true);
      res.json(this.success({ data: tree }));
    } catch (error) { logger.error(error); next(error); }
  }

  async oss(req, res, next) {
    try {
      const vdata = validated(ossSchema, req.query, res, this);
      if (vdata === undefined) return;
      const basePath = path.join(Paths.rootPath, "public", getApp()?.config?.upload?.uploadDir || "uploads");
      // oss 接口的 path 是相对 uploads 的子路径（如 /default、/daily），需先拼到 uploads 下再校验
      const rawPath = req.query.path;
      const candidate = !rawPath
        ? basePath
        : rawPath.startsWith(Paths.rootPath)
          ? rawPath
          : path.join(basePath, rawPath.replace(/^[\\/]+/, ""));
      const fullPath = isAllowed(candidate);
      if (!fullPath) return res.status(403).json(this.fail({ msg: "路径不允许" }));
      if (!(await existsAsync(fullPath))) await fsp.mkdir(fullPath, { recursive: true });
      const files = await getFileTree(fullPath, false);
      const dirs = [];
      const entries = await fsp.readdir(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const itemPath = path.join(fullPath, entry.name);
          dirs.push({ name: entry.name, path: itemPath, relativePath: "/" + path.relative(basePath, itemPath).replace(/\\/g, "/"), type: "directory" });
        }
      }
      res.json(this.success({ data: [...dirs, ...files] }));
    } catch (error) { logger.error(error); next(error); }
  }

  async content(req, res, next) {
    try {
      const vdata = validated(contentSchema, req.query, res, this);
      if (vdata === undefined) return;
      const normalizedPath = this.resolveFilePath(req.query.template, req.query.path);
      const content = await readFileContent(normalizedPath);
      res.json(this.success({ data: content }));
    } catch (error) {
      // 业务已知错误返回对应状态码，未知错误交全局处理
      const businessErrors = { "文件不存在": 404, "路径不允许": 403, "路径不是文件": 400 };
      const status = businessErrors[error.message];
      if (status) return res.status(status).json(this.fail({ msg: error.message }));
      logger.error(error);
      next(error);
    }
  }

  async save(req, res, next) {
    try {
      const vdata = validated(saveSchema, req.body, res, this);
      if (vdata === undefined) return;
      const { content, template, path: filePath } = req.body;
      const normalizedPath = this.resolveFilePath(template, filePath, true);
      this.validateContent(content, normalizedPath);
      // 模板文件是管理员编写的代码/静态文件（含 art-template 语法与合法 <script>），
      // 按原样写入，不做富文本清洗（清洗会实体转义 < > 摧毁整个模板）。
      // 安全防线：validateContent 已硬性拒绝 .svg 的 <script>/on* 事件与非法 JSON。
      saveFileContent(normalizedPath, content);
      res.json(this.success({ data: true }));
    } catch (error) {
      logger.error("[CodeFile.save] 错误:", error.message);
      const isSecurityError = ["不安全", "非法", "不允许", "危险", "禁止", "超出", "不能为空"].some((k) => error.message.includes(k));
      if (isSecurityError) return res.status(403).json(this.fail(error.message));
      return res.status(500).json(this.fail({ msg: error.message || "保存失败" }));
    }
  }
}

export default new CodeFileController();

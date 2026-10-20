import { getApp, logger } from "chanjs";
import { normalizeRecipients } from "./email.js";

/**
 * 需要从 sys_config 合并进 config 的远程配置分组。
 * - target：写入 config 的哪个子对象（与 config/email.js 的键对齐）
 * - parse：值转换（upload 为数值，email 原样字符串）
 * - map：DB 里的 config_key -> 消费端期望的键（绕过 sys_config.config_key 全局唯一且大小写不敏感）
 *
 * 调用时机：
 *  1) 框架 beforeStart 钩子（#loadConfig 之后、#loadDb 之后、listen 之前）——启动期合并一次；
 *  2) 后台 base/config/update 改完 upload/email 配置后——再次调用即时重载。
 * 等价于「加载 config 之后直接加载数据库配置进行合并」，DB 为配置唯一来源（无 env 兜底）。
 */
// 写到 config 根（扁平标量分组 page_config / security_config 使用）
const ROOT_TARGET = "__root__";

/**
 * 安全 JSON 解析（容错）：解析失败返回 undefined，调用方跳过该值，保留文件兜底。
 */
function safeJsonParse(value, label) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.error(`[remote-config] ${label} JSON 解析失败，使用文件兜底：${e.message}`);
    return undefined;
  }
}

const REMOTE_GROUPS = {
  upload_config: {
    target: "upload",
    // 大小限制字段在 sys_config 中以「MB」为单位存储（如 100 = 100MB = 104857600 字节），
    // 支持小数（0.5 = 512KB）。解析时统一 ×1024×1024 换算为字节，
    // 注入 config.upload.* 供 multer / 前端校验消费。
    // uploadDir 为字符串目录名，需原样保留，不参与换算。
    //
    // 大小限制「唯一来源为 DB」，config/upload.js 无任何 *Size 兜底常量。
    // 解析结果非正数（未配置/填错）时写入 0，由 modules/oss/common/upload.js 与
    // upload-validator.js 的安全网回落 1MB 保守值（fail-closed）。
    parse: (v, k) => {
      if (k === "uploadDir") return v;
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? Math.round(n * 1024 * 1024) : 0;
    },
    map: null,
  },
  email_config: {
    target: "EMAIL",
    // TO 字段支持 JSON 数组（["a@x.com"]）或逗号/分号分隔串；其余字段原样字符串
    parse: parseEmailValue,
    map: null,
  },
  // 限流：整对象 JSON（config_key=all），与文件兜底浅合并（DB 优先，文件兜底缺失键）。
  // config.rateLimit 与 waf.js 引用的 ratelimit 模块对象是共享引用，原地合并后 WAF 自动跟随。
  rate_limit_config: {
    target: "rateLimit",
    json: true,
    map: null,
  },
  // 上传 MIME 白名单：JSON 数组（config_key=all），写入 config.upload.allowedTypes。
  upload_allow_config: {
    target: "upload",
    subKey: "allowedTypes",
    json: true,
    map: null,
  },
  // 分页默认值：扁平标量（PAGE_SIZE / LIMIT_MAX），写到 config 根，覆盖 env 兜底。
  page_config: {
    target: ROOT_TARGET,
    parse: (v) => v,
    map: null,
  },
  // 安全：bcrypt 盐轮数（BCRYPT_SALT），写到 config 根，覆盖 env 兜底。
  // 消费端（SysUser/Member 登录/改密）均读 this.config.BCRYPT_SALT，自动生效。
  security_config: {
    target: ROOT_TARGET,
    parse: (v) => v,
    map: null,
  },
  // 后台 API 跨域白名单：config_key=ORIGIN，值 "*" 或逗号分隔域名。
  // 原地覆盖 config.cors.originList（config/cors.js 的动态 origin 函数每次请求
  // 实时读取，保存后即时生效，无需重启）。空值/非法值跳过，回落 env CORS_ORIGIN 兜底。
  // 注意：credentials 由启动期 env 决定（chanjs Cors options 静态化），此处只管 origin。
  cors_config: {
    target: "cors",
    subKey: "originList",
    parse: (v) => {
      const raw = String(v ?? "").trim();
      if (!raw) return undefined; // 空值：保留兜底
      return raw === "*"
        ? "*"
        : raw.split(",").map(s => s.trim()).filter(Boolean);
    },
    map: null,
  },
  // 前台页面缓存开关：config_key=CACHE，值 true/false/1/0。
  // 写到 config 根覆盖 env 兜底；消费端 web/middleware/init.js 每请求实时读取，即时生效。
  cache_config: {
    target: ROOT_TARGET,
    parse: (v) => {
      const s = String(v ?? "").trim().toLowerCase();
      if (["true", "1"].includes(s)) return true;
      if (["false", "0"].includes(s)) return false;
      return undefined; // 非法值：跳过，保留文件兜底
    },
    map: null,
  },
};

/**
 * email_config 单字段解析。
 * TO 字段复用 email.js 的 normalizeRecipients：支持 JSON 数组（["a@x.com"]）或逗号/分号分隔串，
 * 统一解析为字符串数组（类型稳定，调用方无需判断字符串/数组）；其余字段原样返回字符串。
 * @param {string} value - 来自 sys_config 的 config_value
 * @param {string} key - config_key（用于识别 TO 字段）
 * @returns {string|string[]}
 */
function parseEmailValue(value, key) {
  if (key !== "TO") return value;
  if (typeof value !== "string") return value;
  let to = value;
  try {
    const parsed = JSON.parse(value.trim());
    if (Array.isArray(parsed)) to = parsed;
  } catch (_) {
    /* 非 JSON，回退逗号/分号分隔 */
  }
  return normalizeRecipients(to);
}

/**
 * 从 sys_config 加载 upload/email 配置，合并进 getApp().config。
 * 容错：DB 不可用时不抛错中断启动，相关配置保持为空对象（消费端按未配置处理）。
 */
export async function loadRemoteConfig() {
  const app = getApp();
  if (!app) {
    logger.warn("[remote-config] getApp() 不可用，跳过远程配置加载");
    return;
  }
  const config = app.config || (app.config = {});
  // 确保各分组目标子对象存在：config/index.js 仅 spread 了 upload，
  // EMAIL / rateLimit 等需在此建空对象，供后续 DB 值写入。
  for (const grp of Object.values(REMOTE_GROUPS)) {
    if (grp.target === ROOT_TARGET) continue;
    config[grp.target] = config[grp.target] || {};
  }

  try {
    const db = app.db;
    if (!db) {
      logger.warn("[remote-config] 数据库连接不可用，跳过远程配置加载");
      return;
    }
    const rows = await db("sys_config")
      .whereIn("type_code", Object.keys(REMOTE_GROUPS))
      .select();

    rows.forEach((item) => {
      const grp = REMOTE_GROUPS[item.type_code];
      if (!grp) return;

      // JSON 型分组：解析失败（脏数据）跳过，保留文件兜底
      const parsed = grp.json
        ? safeJsonParse(item.config_value, item.type_code)
        : grp.parse(item.config_value, item.config_key);
      if (parsed === undefined) return;

      if (grp.target === ROOT_TARGET) {
        // 扁平标量分组：直接写到 config 根（如 PAGE_SIZE / BCRYPT_SALT）
        const finalKey = grp.map ? grp.map[item.config_key] : item.config_key;
        if (!finalKey) return;
        config[finalKey] = parsed;
      } else if (grp.subKey) {
        // 写入目标子对象的指定子键（如 config.upload.allowedTypes）
        config[grp.target][grp.subKey] = parsed;
      } else if (grp.json) {
        // 整对象 JSON：与文件兜底浅合并（原地修改共享引用，WAF 自动跟随）
        config[grp.target] = Object.assign(config[grp.target], parsed);
      } else {
        // 普通标量分组：写到 target[finalKey]
        const finalKey = grp.map ? grp.map[item.config_key] : item.config_key;
        if (!finalKey) return;
        config[grp.target][finalKey] = parsed;
      }
    });

    logger.info(
      `[remote-config] 已从 sys_config 合并远程配置分组：${Object.keys(REMOTE_GROUPS).join(", ")}`
    );
  } catch (error) {
    // 不向外抛错：避免 beforeStart 抛错导致进程退出；配置降级为空对象
    logger.error("[remote-config] 加载远程配置失败（已降级，配置保持为空）：", error);
  }
}

export default loadRemoteConfig;

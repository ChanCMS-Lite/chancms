import { Controller } from "chanjs";
import { resetTransporter } from "../../../common/email.js";
import { loadRemoteConfig } from "../../../common/remote-config.js";
import { validated } from "../../../common/validate.js";
import { clearAllWebCache } from "../../../common/cacheclear.js";
import { createSchema, updateSchema, deleteSchema, detailSchema, listSchema, updateManySchema } from "../validator/Config.js";

// 这些分组由 beforeStart 钩子从 sys_config 合并进 config，后台改完后需重新合并
const REMOTE_CONFIG_TYPES = [
  "upload_config",
  "email_config",
  "rate_limit_config",
  "upload_allow_config",
  "page_config",
  "security_config",
  "cors_config",
  "cache_config",
];

// JSON 型分组：后台写入前需校验合法性，防止脏数据进库后经 loadRemoteConfig 即时生效
const JSON_CONFIG_TYPES = ["rate_limit_config", "upload_allow_config"];

// JSON 合法性校验（返回错误信息字符串，合法返回 null）
function validateJsonConfig(typeCode, value) {
  if (!JSON_CONFIG_TYPES.includes(typeCode)) return null;
  if (typeof value !== "string") return null;
  try {
    JSON.parse(value);
    return null;
  } catch (e) {
    return `配置值不是合法 JSON：${e.message}`;
  }
}

class ConfigController extends Controller {
  constructor(...args) {
    super(...args);
    this.Config = this.get("base", "Config", "service");
  }

  async list(req, res, next) {
    try {
      const Config = await this.Config;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await Config.list({ query: vdata || {} });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getlist(req, res, next) {
    try {
      const Config = await this.Config;
      const vdata = validated(listSchema, req.query, res, this);
      if (vdata === undefined) return;
      const data = await Config.list({ query: vdata || {}, fields: ["id", "config_key", "config_value"] });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 增
  async create(req, res, next) {
    try {
      const Config = await this.Config;
      const body = validated(createSchema, req.body, res, this);
      if (body === undefined) return;
      const data = await Config.create(body);
      // sys_config 写操作全清前台缓存（配置分组在 web:global 缓存里，全清成本可忽略）
      clearAllWebCache(req);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 查
  async detail(req, res, next) {
    try {
      const Config = await this.Config;
      const vdata = validated(detailSchema, req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await Config.detail(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 删除
  async delete(req, res, next) {
    try {
      const Config = await this.Config;
      const vdata = validated(deleteSchema, req.body?.id != null ? req.body : req.query, res, this);
      if (vdata === undefined) return;
      const { id } = vdata;
      const data = await Config.delete(id);
      if (data && data.success === false) {
        res.json(this.fail(data));
        return;
      }
      clearAllWebCache(req);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 改
  async update(req, res, next) {
    try {
      const Config = await this.Config;
      const params = validated(updateSchema, req.body, res, this);
      if (params === undefined) return;

      // JSON 型分组：写入前校验合法性，防止脏数据进库后经 loadRemoteConfig 即时生效
      const jsonErr = validateJsonConfig(params.type_code, params.config_value);
      if (jsonErr) {
        res.json(this.fail({ msg: jsonErr }));
        return;
      }

      const data = await Config.update(params);

      // sys_config 写操作全清前台缓存（配置分组在 web:global 缓存里）
      clearAllWebCache(req);

      // 改完 sys_config 后即时重载远程配置（启动钩子同样函数，保证后台改配置免重启生效）
      if (REMOTE_CONFIG_TYPES.includes(params.type_code)) {
        if (params.type_code === "email_config") {
          // 邮件配置变更需重建 SMTP 连接池
          resetTransporter();
        }
        await loadRemoteConfig();
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // 批量更新
  async updateMany(req, res, next) {
    try {
      const Config = await this.Config;
      const params = validated(updateManySchema, req.body, res, this);
      if (params === undefined) return;

      // JSON 型分组：批量写入前逐个校验合法性
      if (Array.isArray(params)) {
        for (const u of params) {
          const jsonErr = validateJsonConfig(u?.query?.type_code, u?.data?.config_value);
          if (jsonErr) {
            res.json(this.fail({ msg: jsonErr }));
            return;
          }
        }
      }

      const data = await Config.updateMany(params);

      // sys_config 写操作全清前台缓存（配置分组在 web:global 缓存里）
      clearAllWebCache(req);

      // 批量更新若涉及远程配置分组，须重载使改动即时生效
      if (Array.isArray(params) && params.some((u) => REMOTE_CONFIG_TYPES.includes(u?.query?.type_code))) {
        await loadRemoteConfig();
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default new ConfigController();
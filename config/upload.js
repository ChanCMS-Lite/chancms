// 上传相关配置（单位：字节）。
//
// 大小限制（*Size）「唯一来源」为后台 sys_config.upload_config：
//   - 后台以「MB」为单位配置（如 100 = 100MB，支持小数 0.5 = 512KB）
//   - 启动期由 app/common/remote-config.js 读取并 ×1024×1024 换算为字节，注入 config.upload.*
//   - 后台 base/config/update 保存后会即时 reload，无需重启
//
// 不在此保留文件兜底：两处兜底会造成「改了后台没生效 / 改了代码没生效」的口径漂移。统一为「DB 唯一来源」后，DB 未配置时由
//   modules/oss/common/upload.js 与 modules/oss/common/upload-validator.js 的安全网回落 1MB 保守值
//   （fail-closed），既不写死业务默认值，也不会因配置缺失而放开上传限制。
//
// 本文件仅保留「非大小类」的基础配置兜底。
export const upload = {
  // 上传根目录（位于 public/ 下），可由 sys_config.upload_config.uploadDir 在后台覆盖
  uploadDir: "uploads",
};

export default {
  upload,
};

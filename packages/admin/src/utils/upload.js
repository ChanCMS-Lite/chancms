import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getUploadConfig } from '@/api/upload.js';
import { tinymceSet } from '@/config/tinymce.js';
import { resolveOssUrl } from '@/utils/oss-url.js';
export { resolveOssUrl } from '@/utils/oss-url.js';

/**
 * 上传大小限制配置（字节）
 *
 * ⚠️ 本对象「不预置任何业务默认值」，唯一来源为后台 sys_config.upload_config：
 *    - 后台以「MB」为单位配置（100 = 100MB，支持小数 0.5 = 512KB）
 *    - 由 loadUploadConfig() 从 /base/config/getlist?type_code=upload_config 拉取，
 *      换算为字节后写入（见 api/upload.js#getUploadConfig）
 *
 * 为什么不放兜底值：
 *    前端兜底会与后台配置形成第二套口径，出现「改了后台没生效」的假象
 *    （历史坑：前端硬编码 200KB vs 后台配置 500KB，图片上传被莫名拦截）。
 *    统一为「DB 唯一来源」后，未加载/未配置时对应键为 undefined/0，
 *    由 checkUploadSize() 走 fail-closed 拒绝上传并提示，不会静默放行。
 */
export const uploadConfig = reactive({});

let loaded = false;

/**
 * 从后端加载上传配置（带缓存，多次调用只请求一次）
 */
export async function loadUploadConfig() {
  if (loaded) return uploadConfig;
  try {
    const cfg = await getUploadConfig();
    if (cfg) {
      // 以接口返回为准全量写入：uploadConfig 初始为空对象，无本地默认值可遍历，
      // 必须遍历 cfg 的键，否则永远写不进任何配置值。
      Object.keys(cfg).forEach((key) => {
        uploadConfig[key] = cfg[key];
      });
      // TinyMCE 编辑器图片上传大小限制跟随后端 imgSize（消除前端硬编码 200KB）
      if (uploadConfig.imgSize) tinymceSet.custom_images_limit_size = uploadConfig.imgSize;
    }
  } catch (error) {
    console.error('加载上传配置失败:', error);
  }
  loaded = true;
  return uploadConfig;
}

/**
 * 格式化字节为可读大小
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.floor(bytes / 1024)}k`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 把上传类型映射到 uploadConfig 中的键名
 * 注意：图片在配置里叫 imgSize（不是 imageSize），需单独映射
 * @param {string} type
 * @returns {string}
 */
export function sizeKeyOf(type = 'image') {
  if (type === 'image') return 'imgSize';
  return `${type}Size`;
}

/**
 * 生成上传提示文案（动态从 uploadConfig 读取大小限制，统一收口自 sys_config.upload_config）
 * @param {string} type - image/logo/file/video/pdf/music/css/js/font/archive/html/txt
 * @param {string} [label] - 可选前缀，如「上传图片作为封面图」
 * @returns {string}
 */
export function uploadTip(type = 'image', label) {
  const key = sizeKeyOf(type);
  const maxSize = uploadConfig[key] || uploadConfig.fileSize;
  // 类型已精简为「图片 / 视频 / 音频 / 通用文件」四类（Logo 归图片，PDF/压缩包归文件）
  const prefix = label
    || (type === 'file' ? '上传文件'
      : type === 'video' ? '上传视频'
        : type === 'music' ? '上传音频'
          : '上传图片');
  // 配置未加载/未配置时不展示错误的大小数字，避免误导
  if (!Number.isFinite(maxSize) || maxSize <= 0) return prefix;
  return `${prefix}，大小不超过 ${formatFileSize(maxSize)}`;
}

/**
 * 校验上传文件大小
 * @param {File} rawFile - 文件对象
 * @param {string} type - 配置类型：image/logo/file/video/pdf/music/css/js/font/archive/html/txt
 * @returns {boolean} 是否通过
 */
export function checkUploadSize(rawFile, type = 'image') {
  const key = sizeKeyOf(type);
  const maxSize = uploadConfig[key] || uploadConfig.fileSize;
  // fail-closed：取不到合法上限（后台未配置 / 接口失败）时拒绝上传，
  // 而不是放行——与后端 multer 安全网（回落 1MB）保持同一原则。
  if (!Number.isFinite(maxSize) || maxSize <= 0) {
    ElMessage({
      message: '上传大小限制未配置，请先在「系统配置 → upload_config」中设置后重试',
      type: 'error',
    });
    return false;
  }
  if (rawFile.size > maxSize) {
    ElMessage({
      message: `上传文件必须小于${formatFileSize(maxSize)}`,
      type: 'error',
    });
    return false;
  }
  return true;
}

/**
 * 从上传接口返回体中提取可用的文件地址。
 * 兼容三种 data 形态：数组[{url|path|link}] / 直接字符串 / 对象{url|path|link}。
 * 收口自 ImageUploader 与 FileUploader 两处重复的本地实现，统一逻辑。
 * @param {object} result - 上传接口响应（含 code/data）
 * @returns {string} 地址，取不到返回 ''
 */
export function extractUrl(result, provider) {
  if (!result || result.code !== 0 || !result.data) return '';
  // Lite 精简版仅本地上传；统一经 resolveOssUrl 取用本地地址（保留 provider 形参兼容旧调用）
  if (Array.isArray(result.data)) {
    return resolveOssUrl(result.data[0], provider);
  }
  if (typeof result.data === 'string') return result.data;
  return resolveOssUrl(result.data, provider);
}

/**
 * 图片上传前校验（含类型 + 大小）
 * @param {File} rawFile
 * @param {string} type - image 或 logo
 */
export function beforeImageUpload(rawFile, type = 'image') {
  if (rawFile.type.indexOf('image') === -1) {
    ElMessage({ message: '上传文件只能是图片格式', type: 'error' });
    return false;
  }
  return checkUploadSize(rawFile, type);
}

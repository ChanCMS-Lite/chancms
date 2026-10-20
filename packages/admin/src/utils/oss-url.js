/**
 * 上传结果外链地址统一取用（Lite 精简版仅本地上传）
 *
 * 后端本地上传响应中，每条结果含 { url, path, link }。
 * Lite 已移除云存储，这里仅做统一的本地兜底取用，供各业务视图/组件复用，
 * 避免散落 `.url || .path` 判断。
 *
 * @param {Object} item - 单条上传结果 { url, path, link, ... }
 * @param {string} [provider] - 兼容旧调用签名（本地恒为 'local'），保留以防改动散落各处
 * @returns {string} 地址，取不到返回 ''
 */
export function resolveOssUrl(item, provider) {
  if (!item) return '';
  return item.url || item.path || item.link || '';
}

import path from "path";

/**
 * 验证文件名是否安全
 *   拦截路径分隔符 / \ 以及 .. 防止路径穿越攻击
 * @param {string} filename - 文件名
 * @returns {boolean} 是否安全
 */
export const isFilenameSafe = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  if (filename.length > 255) return false;
  // 1. 显式拦截路径分隔符 / \（含正反斜杠），杜绝 ../ 路径穿越
  if (/[\/\\]/.test(filename)) return false;
  // 2. 显式拦截 .. 段，防御双重点号穿越
  if (filename.includes('..')) return false;
  // 3. 拦截非法控制字符与 Windows 保留字符
  if (/[<>:"|?*\x00-\x1f]/.test(filename)) return false;
  // 4. 拦截 Windows 保留设备名
  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(filename)) return false;
  // 5. 规范化后若与原始值不同，说明存在冗余或异常路径段
  const normalized = path.normalize(filename);
  if (normalized !== filename) return false;
  // 6. 禁止以 . 开头（隐藏文件）
  if (filename.startsWith('.')) return false;
  return true;
};
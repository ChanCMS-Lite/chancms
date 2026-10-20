import fsp from "fs/promises";
import path from "path";

const hiddenFilePatterns = [
  /^\./,
  /^Thumbs\.db$/,
  /^desktop\.ini$/,
  /\.DS_Store$/,
];

/**
 * 检查文件是否为隐藏文件
 * @param {string} filename - 文件名
 * @returns {boolean} - 是否为隐藏文件
 */
function isHiddenFile(filename) {
  return hiddenFilePatterns.some(pattern => pattern.test(filename));
}

/**
 * 检查文件或目录是否存在
 * @param {string} p - 文件或目录路径
 * @returns {Promise<boolean>} - 是否存在
 */
export const existsAsync = (p) => fsp.access(p).then(() => true).catch(() => false);

/**
 * 获取目录树
 * @param {string} dirPath - 目录路径
 * @param {boolean} recursive - 是否递归
 * @param {string} basePath - 基础路径（可选）
 * @returns {Promise<Array>} - 目录树数组
 */
export async function getFileTree(dirPath, recursive = true, basePath = null) {
  if (!(await existsAsync(dirPath))) {
    return [];
  }
  // 检查是否为目录
  const stats = await fsp.stat(dirPath);
  if (!stats.isDirectory()) {
    return [];
  }
  
  // 读取目录内容
  const items = [];
  const files = await fsp.readdir(dirPath);
  
  const base = basePath || process.cwd();

  for (const file of files) {
    if (isHiddenFile(file)) {
      continue;
    }
    // 构建完整路径
    const fullPath = path.join(dirPath, file);
    const fileStats = await fsp.stat(fullPath);
    // 递归处理子目录
    if (fileStats.isDirectory() && recursive) {
      const children = await getFileTree(fullPath, recursive, basePath);
      items.push({
        name: file,
        path: fullPath,
        type: 'directory',
        children: children
      });
    } else if (fileStats.isFile()) {
      const relativePath = path.relative(base, fullPath).replace(/\\/g, '/');
      items.push({
        name: file,
        path: fullPath,
        relativePath: relativePath.startsWith('public') ? '/' + relativePath.replace(/^\//, '') : fullPath,
        type: 'file',
        size: fileStats.size
      });
    }
  }

  return items;
}

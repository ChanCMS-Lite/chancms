/**
 * 按字符串路径从对象中取值，支持 . 和 [n] 语法
 * 示例：getValueByPath(data, 'data.list[0].title')
 */
export const getValueByPath = (obj, path) => {
  if (!path || typeof path !== "string") return "";
  return path.split(".").reduce((o, k) => {
    if (o == null) return undefined;
    // 支持数组下标：data.list[0]
    const match = k.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      const [, key, index] = match;
      return o[key]?.[index];
    }
    return o[k];
  }, obj);
};

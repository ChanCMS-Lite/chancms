// 采集数据格式化工具（前后端逻辑保持一致）

// 根据路径从对象取值（支持 data.list[0].title）
export function getValueByPath(obj, path) {
  if (!path || typeof path !== 'string') return '';
  return path.split('.').reduce((o, k) => {
    if (o == null) return undefined;
    const match = k.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      const [, key, index] = match;
      return o[key]?.[index];
    }
    return o[k];
  }, obj);
}

// 判断字符串是否为路径（data.tip / data.news[0]），否则视为字面量
export function isPathLike(str) {
  return /^[a-zA-Z_$][\w$]*(\.[\w$]+|\[\d+\])*$/.test(str);
}

// 按 parseData 配置格式化数据
export function formatByConfig(data, parseData) {
  let config;
  try {
    config = typeof parseData === 'string' ? JSON.parse(parseData) : parseData;
  } catch {
    throw new Error('parseData 不是合法 JSON');
  }
  const result = {};
  for (const [key, fieldConfig] of Object.entries(config)) {
    if (typeof fieldConfig !== 'object' || fieldConfig === null) {
      result[key] = '';
      continue;
    }
    const {
      path,
      prefix = '',
      suffix = '',
      default: defaultValue = '',
      isArray = false,
      wrap,
      index = false,
      indexPrefix = '',
      indexSuffix = '',
    } = fieldConfig;

    // 多字段拼接：path 为数组，元素可为路径或字面量
    if (Array.isArray(path)) {
      let str = path
        .map((item) => {
          if (typeof item === 'string' && isPathLike(item)) {
            const v = getValueByPath(data, item);
            return v == null ? '' : String(v);
          }
          return String(item);
        })
        .join('');
      if (str === '' && defaultValue) str = defaultValue;
      result[key] = prefix + str + suffix;
      continue;
    }

    let value = path ? getValueByPath(data, path) : undefined;
    if (value == null || value === undefined || value === '') {
      value = defaultValue;
    }

    // 数组字段：转 HTML 并可选加序号
    if (isArray && Array.isArray(value) && wrap) {
      value = value
        .map((item, i) => {
          const idx = index ? `${indexPrefix}${i + 1}${indexSuffix}` : '';
          return `<${wrap}>${idx}${String(item)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</${wrap}>`;
        })
        .join('');
      result[key] = prefix + value + suffix;
      continue;
    }

    result[key] = prefix + String(value) + suffix;
  }
  return result;
}

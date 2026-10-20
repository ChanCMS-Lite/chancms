/**
 * 栏目域（content_type）—— 前端单一真相源
 *
 * 与后端 app/common/content-types.js 保持一致（域枚举 + 模块→域映射）。
 * 后台所有消费栏目树的地方都从这里取，禁止再写域名字面量。
 *
 * 设计：一个根栏目 = 一个「域」，子孙强制继承；域之间互不可见。
 * 各模块只声明「我读哪些域」，就不可能串门。
 */

export const CONTENT_TYPE = {
  PAGE: 'page', // 首页 / 关于 / 作者 → 单页容器
  ARTICLE: 'article', // 文章 / 文档 → 文章类内容
  IMAGE: 'image', // 图片 → 文章类内容（共用文章编辑器）
  VIDEO: 'video', // 视频 → 文章类内容（共用文章编辑器）
  SPECIAL: 'special', // 专题 → 导航入口，内容在 cms_special
}

export const ALL_CONTENT_TYPES = Object.values(CONTENT_TYPE)

/** 文章类内容域：共用文章编辑器 / 列表的模块读这一组 */
export const ARTICLE_LIKE_TYPES = [
  CONTENT_TYPE.ARTICLE,
  CONTENT_TYPE.IMAGE,
  CONTENT_TYPE.VIDEO,
]

/** 除单页外的全部域：标签这类「跟内容走、但不限内容形态」的模块用这一组 */
export const NON_PAGE_TYPES = [
  CONTENT_TYPE.ARTICLE,
  CONTENT_TYPE.IMAGE,
  CONTENT_TYPE.VIDEO,
  CONTENT_TYPE.SPECIAL,
]

/**
 * 各模块「允许的域」。
 *
 * 用法：`find()` 取**全量**栏目树，再用 `markForeignDisabled(rows, DOMAIN.xxx)`
 * 把不属于本模块的节点标 `disabled`（灰显不可选）—— 而不是让后端把其他域过滤掉。
 * 新增页面时在这里加一项，而不是在调用点手写域名字符串。
 */
export const DOMAIN = {
  article: ARTICLE_LIKE_TYPES.join(','), // 文章管理
  tag: NON_PAGE_TYPES.join(','), // 标签：只排除单页，其余栏目都可挂标签
  collect: ARTICLE_LIKE_TYPES.join(','), // 采集（页面 / 接口）
  relation: ARTICLE_LIKE_TYPES.join(','), // 关联文章选择器
  page: CONTENT_TYPE.PAGE, // 单页管理
}

/** 域 → 中文名（栏目管理「内容类型」列展示用） */
export const CONTENT_TYPE_LABEL = {
  [CONTENT_TYPE.PAGE]: '单页',
  [CONTENT_TYPE.ARTICLE]: '文章',
  [CONTENT_TYPE.IMAGE]: '图片',
  [CONTENT_TYPE.VIDEO]: '视频',
  [CONTENT_TYPE.SPECIAL]: '专题',
}

/** 归一化域参数：支持 'a,b' / ['a'] / 'a' → Set */
function normalizeDomains(allowedTypes) {
  const arr = Array.isArray(allowedTypes)
    ? allowedTypes
    : String(allowedTypes || '').split(',')
  return new Set(arr.map((t) => String(t).trim()).filter(Boolean))
}

/**
 * 统一约定：后台各模块的「栏目下拉」一律展示**完整栏目树**（不删减），
 * 只把「不属于本模块域」的节点标 `disabled = true`（灰显不可选）。
 *
 * 为什么用 disabled 而不是让后端按域过滤：
 *   1. 结构完整可见 —— 运营不会以为栏目被删了，也能看清父子关系；
 *   2. 历史回显安全 —— 已挂在其他域栏目下的存量数据（采集任务 / 标签 / 文章），
 *      编辑时仍能在全量树里找到，不会「选中的栏目凭空消失」；
 *   3. 判据只有一个维度（域）—— 不和 type（列表栏目 / 单页）打架。
 *      单页栏目下挂文章列表子栏目（父单页 → 子列表）仍可正常选中。
 *
 * 原地标记并返回同一份数组，便于后续继续 `addLabelValue(tree(rows))`。
 *
 * @param {Array} rows 后端 `/cms/category/find` 的全量扁平栏目（含 content_type）
 * @param {string|string[]} allowedTypes 本模块允许的域，如 `DOMAIN.product` / `DOMAIN.article`
 */
export function markForeignDisabled(rows, allowedTypes) {
  const allow = normalizeDomains(allowedTypes)
  const list = Array.isArray(rows) ? rows : rows?.list || []
  list.forEach((row) => {
    const ct = row && row.content_type
    if (!ct) return // 字段缺失不处理（服务端守卫兜底），避免整树下拉全灰
    if (!allow.has(String(ct))) row.disabled = true
  })
  return list
}

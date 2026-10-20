// 栏目可见范围工具（cms 后台与 web 前台共用）
// 只做一件事：把「某个栏目」展开为「自身 + 全部后代/祖先栏目」的 id 集合。
//
// 为什么在 JS 里建树而不是递归 SQL：
// 1. 兼容三种数据库（MySQL / PG / SQLite），无需 CTE 语法差异分支；
// 2. cms_category 量级很小（几十到几百行），一次全表查询开销可忽略，
//    远小于按层级递归查询产生的 N 次往返。
//
// 注意：本文件不缓存。栏目变更由 cacheclear 统一失效，缓存层容易与
// 「后台刚改完栏目、列表立刻要看到结果」的诉求冲突，宁可多一次轻量查询。

/**
 * 查询栏目自身 + 所有祖先栏目（含父级及更上）的 id 数组
 *
 * 语义：当栏目 A 绑定内容时，A 的子孙栏目也应可见该内容；
 *       反之 A 不应被自己祖先的绑定内容污染（祖先绑定由祖先作用域决定）。
 *       与 categoryIdsWithChildren 互为反向操作；查询绑定时用 ancestors。
 *
 * @param {Object} db - knex 实例
 * @param {number|string} cid - 起始栏目 id
 * @returns {Promise<number[]>} id 数组，首项为 cid 自身；cid 非法时返回空数组
 */
export async function categoryIdsWithAncestors(db, cid) {
  const target = Number(cid);
  if (!target) return [];

  const rows = await db("cms_category").select("id", "pid");
  const parentMap = new Map();
  for (const row of rows) {
    parentMap.set(Number(row.id), Number(row.pid));
  }

  const ids = [target];
  const seen = new Set(ids);
  let current = target;
  // pid=0 是顶级栏目的合法值（最顶层），不能再向上
  while (parentMap.has(current)) {
    const pid = parentMap.get(current);
    if (!pid || seen.has(pid)) break;
    seen.add(pid);
    ids.push(pid);
    current = pid;
  }
  return ids;
}

/**
 * 查询栏目自身 + 所有后代栏目（含孙级及更深）的 id 数组
 * @param {Object} db - knex 实例（调用方注入，避免依赖 getApp() 时序）
 * @param {number|string} cid - 起始栏目 id
 * @returns {Promise<number[]>} id 数组，首项为 cid 自身；cid 非法时返回空数组
 */
export async function categoryIdsWithChildren(db, cid) {
  const target = Number(cid);
  if (!target) return [];

  const rows = await db("cms_category").select("id", "pid");
  const childMap = new Map();
  for (const row of rows) {
    const pid = Number(row.pid);
    if (!childMap.has(pid)) childMap.set(pid, []);
    childMap.get(pid).push(Number(row.id));
  }

  const ids = [target];
  const seen = new Set(ids);
  const stack = [target];
  while (stack.length) {
    const current = stack.pop();
    for (const child of childMap.get(current) || []) {
      // 防脏数据成环（如 A.pid=B 且 B.pid=A）导致死循环
      if (seen.has(child)) continue;
      seen.add(child);
      ids.push(child);
      stack.push(child);
    }
  }
  return ids;
}

import { z } from 'zod';

// 全局中文错误文案（zod v4 customError 钩子）
// 缺字段/类型错不再泄漏英文 "Invalid input: expected string, received undefined"；
// 业务 refine/.min 的自定义消息不受影响（仅当 issue 无自定义消息时才走这里）
z.config({
  customError: (iss) => {
    const p = iss.path?.length ? `: ${iss.path.join('.')}` : '';
    if (iss.code === 'invalid_type' && iss.input === undefined) return `参数缺失${p}`;
    if (iss.code === 'invalid_value' && iss.input === undefined) return `参数缺失${p}`;
    if (iss.code === 'invalid_type' || iss.code === 'invalid_union' || iss.code === 'invalid_value')
      return `参数取值错误${p}`;
    // 其余场景返回 undefined → 落回 zod 默认文案
    return undefined;
  },
});

/**
 * 通用参数校验工具（基于 zod）
 * 校验失败返回 { ok:false, error:'中文消息' }；成功返回 { ok:true, data }（zod 类型转换 + Strip 过滤）
 * 每个 controller 对应 validator/Xxx.js，业务失败 code 统一 1006
 */

/**
 * 深克隆（只处理纯数据：对象/数组/原始值）
 * @param {*} v
 */
const clone = (v) =>
  v === null || typeof v !== 'object'
    ? v
    : Array.isArray(v)
      ? v.map(clone)
      : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)]));

/**
 * 按路径取值（路径不存在或中途遇到非对象/数组时返回 undefined）
 * @param {*} data
 * @param {Array<string|number>} path
 */
const getByPath = (data, path) => {
  let cur = data;
  for (const seg of path) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = cur[seg];
  }
  return cur;
};

/**
 * 按路径把「值为 null 的属性」从克隆体上删除（不改原对象）
 *
 * 只处理对象属性，**跳过含数字索引的路径**：`delete arr[1]` 会在数组上留稀疏空洞，
 *    把可诊断的报错换成更难懂的报错。数组元素为 null 属于调用方数据错误，保持原样报错即可。
 *
 * @param {*} root - 原始请求数据
 * @param {Array<Array<string|number>>} paths - zod issue 的 path 列表
 */
const dropNullPaths = (root, paths) => {
  const out = clone(root);
  for (const path of paths) {
    if (!Array.isArray(path) || path.length === 0) continue;
    if (path.some((seg) => typeof seg === 'number')) continue; // 数组元素：不静默删除
    let cur = out;
    for (let i = 0; i < path.length - 1; i++) {
      cur = cur?.[path[i]];
      if (cur === null || typeof cur !== 'object') { cur = undefined; break; }
    }
    if (cur && typeof cur === 'object') {
      const last = path[path.length - 1];
      if (Object.prototype.hasOwnProperty.call(cur, last) && cur[last] === null) delete cur[last];
    }
  }
  return out;
};

/**
 * 执行 schema 校验
 *
 * null 兜底（与前端「整包/解构回显再提交」的既有行为配套）：
 *    编辑弹窗回显的 DB NULL 会以 JSON null 回到后端，而 zod 的 `.optional()` 只接受
 *    undefined，null 会报 invalid_type → 用户无法保存。这里做一次**精准重试**：
 *    仅当失败项是「某字段收到 null」时，把这些字段的 null 视作「未提供」后重新校验。
 *    声明了 `.nullable()` 的字段照样收 null；必填字段得到更准的「参数缺失」报错；
 *    兜底字段以 undefined 写库（knex 忽略），不会把旧值覆盖成 NULL。
 *    用户清空输入框提交的是空字符串 `''` 而非 null，真实「清空」语义不受影响。
 *
 * @param {z.ZodSchema} schema - zod schema 实例
 * @param {*} data - 待校验数据（通常是 req.body / req.query）
 * @returns {{ ok: true, data: any } | { ok: false, error: string }}
 */
export const validate = (schema, data) => {
  let result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  // 命中 null 兜底：挑出「源数据在该路径上就是 null」的失败项。
  // 判据只看源值，**不看 issue.code**（zod 对 z.string() 收 null 报 invalid_type，
  //    对 union 收 null 报 invalid_union，按 code 匹配会漏掉 union 字段）；也不能用
  //    issue.input 判断（zod v4 的 issues 没有 input 字段），故回查原始 data。
  // 含数字索引的路径（数组元素为 null）不参与兜底：delete arr[i] 会留稀疏空洞。
  const nullPaths = result.error.issues
    .filter((i) => getByPath(data, i.path) === null)
    .map((i) => i.path)
    .filter((p) => Array.isArray(p) && p.length > 0 && !p.some((seg) => typeof seg === 'number'));

  if (nullPaths.length > 0) {
    const retry = schema.safeParse(dropNullPaths(data, nullPaths));
    if (retry.success) {
      return { ok: true, data: retry.data };
    }
    // 兜底后仍失败：以重试的错误为准（此时剩的是真正的参数问题，报错更准确）
    result = retry;
  }

  // zod 错误数组：取第一条 issue 的 message 作为用户可见错误
  const firstIssue = result.error.issues[0];
  return { ok: false, error: firstIssue?.message || '参数错误' };
};

/**
 * 校验 + 失败自动响应的快捷方式（收敛 controller 中的 validate+fail 样板）
 * @param {z.ZodSchema} schema - zod schema 实例
 * @param {*} data - 待校验数据（req.body / req.query）
 * @param {import('express').Response} res - 响应对象，失败时自动写入 { msg, code:1006 }
 * @param {Object} ctrl - controller 实例（用于 this.fail）
 * @returns {any|undefined} 校验通过返回解析后的 data；失败已响应，返回 undefined（调用方应立即 return）
 */
export const validated = (schema, data, res, ctrl) => {
  const result = validate(schema, data);
  if (result.ok) return result.data;
  res.json(ctrl.fail({ msg: result.error, code: 1006 }));
  return undefined;
};

export { z };

/**
 * 权限比对工具（纯函数 + 常量，不碰数据库）
 * ---------------------------------------------------------------
 * 背景：接口→权限码的映射已完全由 sys_perm_route 表驱动（见 SysPermRoute service），
 * 这里只保留「鉴权比对」所需的纯函数与放行名单：
 *   1. SKIP_PATHS          —— 放行白名单（登录/验证码/前端初始化元接口，已登录即放行）
 *   2. permMatches         —— 权限比对（*:*:* 超管通配 + save 桥接 create/update + 动词归一）
 *   3. normalizePermCode   —— 权限码归一（permMatches 内部使用）
 *
 * 权限码格式：module:resource:action（如 cms:article:update）
 *   action 仅 4 类：list（一切读）/ create / update / delete
 */

// ========== 1. 跳过权限校验的路径（method + path） ==========
// 这些接口要么是公开接口（登录/验证码），要么是前端初始化必需的元接口，
// 已登录用户一律放行，不做 1003 拦截。注意：它们**不配置**在 sys_perm_route 表里。
const SKIP_PATHS = [
  'GET /base/captcha',
  'POST /base/verifyCaptcha',
  'POST /base/user/login',
  'GET /base/menu/allRouter',
  'GET /base/permission/all',
  'GET /base/permission/list',
  // 权限树是角色编辑/权限管理共用的元数据（避免"配角色需先有权限看树"的鸡生蛋），已登录即放行
  'GET /base/permission/tree',
  // 登录后前端初始化必调「取本人信息」；登出是 token 失效操作。
  // 二者都是会话自身操作，任何已登录用户（含游客等低权角色）必须可调，
  // 否则角色没配 base:user:list 会卡死在登录初始化（"获取菜单失败"）。
  // detail 的自我保护：控制器层强制「无 base:user:list 权限时只能查自己」，防越权查他人。
  'GET /base/user/detail',
  'POST /base/user/logout',
  // 留言提交是前台匿名接口（路由置于 auth 之前），双重保险
  'POST /cms/message/create',
];

// ========== 2. 动作动词归一化分组 ==========
// 仅在「鉴权比对」时忽略动词差异：接口归属码是规范动作（list/create/update/delete），
// 但历史角色可能持有 find/detail/save 等旧码，比对时归一为同一组。
// 例：归属码 cms:article:list 与角色持有的 cms:article:detail 视为同一权限。
const ACTION_GROUPS = {
  list: [
    'list', 'view', 'find', 'detail', 'search', 'statistics', 'has', 'hasuse',
    'findid', 'findsubid', 'findfield', 'findbymid', 'appinfo', 'info',
    'runenv', 'views', 'folder', 'gethtml', 'getarticle', 'all', 'allrouter',
    'tree', 'getlist',
  ],
  create: ['create', 'save', 'add'],
  update: ['update', 'save', 'edit'],
  delete: ['delete', 'remove', 'del', 'clear'],
};

// 把任意权限码归一为 module:resource:group（group ∈ list/create/update/delete/save）
export function normalizePermCode(code) {
  if (!code || code === '*:*:*') return code;
  const parts = String(code).split(':');
  if (parts.length < 3) return code;
  // 必须按「末段=动作、中间全部=资源」解析：权限码段数不固定（3 段 base:config:list，
  //    4 段 cms:sysApp:config:update / member:v1:comment:list）；若只取前三段，4 段码会把
  //    第 3 段当动作，不同动作归一成同一码 → 持只读码即等效拥有写权限（越权）。
  const mod = parts[0];
  const action = parts[parts.length - 1];
  const res = parts.slice(1, -1).join(':');
  let group = action;
  for (const [g, verbs] of Object.entries(ACTION_GROUPS)) {
    if (verbs.includes(String(action).toLowerCase())) {
      group = g;
      break;
    }
  }
  if (String(action).toLowerCase() === 'save') group = 'save';
  return `${mod}:${res}:${group}`;
}

// 拆解归一后的权限码 → { res: 'module:resource', act: '动作组' }
// 同上：动作永远取末段，资源是中间全部（支持 N 段）
function splitNormalized(code) {
  const idx = code.lastIndexOf(':');
  return { res: code.slice(0, idx), act: code.slice(idx + 1) };
}

// 判断"请求的权限码"是否被"用户已拥有的权限码"覆盖
//   - *:*:* 通配放行（超管）
//   - 同 module:resource 且 group 相同即放行
//   - save 桥接：一方为 save、另一方为 create/update 时放行
export function permMatches(requested, owned) {
  if (!owned || owned === '*:*:*') return true;
  if (!requested) return true;
  const rq = normalizePermCode(requested);
  const ow = normalizePermCode(owned);
  if (rq === ow) return true;
  const { res: rqRes, act: rqAct } = splitNormalized(rq);
  const { res: owRes, act: owAct } = splitNormalized(ow);
  // 资源（module:resource…）必须完全一致，再比动作组
  if (rqRes !== owRes) return false;
  const set = new Set([rqAct, owAct]);
  if (set.has('save') && (set.has('create') || set.has('update'))) return true;
  return false;
}

// 判断当前登录用户是否超管（auth 中间件把权限集挂在 req.user.perms）
// 供「仅超管可查看/操作他人数据」的对象级鉴权使用（allRouter/allPermission/userRole 等）
export function isSuperUser(req) {
  const perms = req?.user?.perms;
  return Array.isArray(perms) && perms.includes("*:*:*");
}

export { SKIP_PATHS };

/**
 * 接口权限归属（sys_perm_route 表）服务
 * ---------------------------------------------------------------
 * 职责：
 *  1. 缓存：启动/后台变更后把「接口归属」加载进 chanjs 自带 cache（同步读，ttl=0 永久），
 *     鉴权时 getRoutePermCode 同步查缓存，避免每请求查库。
 *  2. 同步：扫描各管理模块 router.js，未配置归属的接口按 URL 末段动词自动归类写入
 *     sys_perm_route（并确保 sys_permission 有对应码、权限树资源自动补齐）。
 *
 * 缓存键：permRouteMap（值 = Map<'METHOD path', perm_code>）
 * 变更即生效：后台「接口权限」增删改后调用 reloadPermRouteCache（del + 重载）。
 */
import { Repository, logger, getApp, cache } from "chanjs";
import { SKIP_PATHS } from "../../../common/permission-utils.js";

const ROUTE_CACHE_KEY = "permRouteMap";
// 归属权限码格式：module:resource:action（action ∈ list/create/update/delete）
const PERM_CODE_RE = /^[a-z]+:[a-zA-Z0-9]+:(list|create|update|delete)$/i;
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

class SysPermRouteService extends Repository {
  constructor() {
    super("sys_perm_route");
  }

  // 从库加载全表到框架 cache（ttl=0 永久，不会被过期清理；变更时手动 del 重载）
  // DB 竞态自愈：冷启动时 MySQL 可能尚未就绪（app.db=null）。
  // 这里重试若干次（间隔 1s）；仍失败时**不写空 Map**（保持未加载），
  // 由 ensureLoaded 懒加载在下个请求自动重试——避免空 Map 导致全接口 403 且无法自愈。
  async loadPermRouteMap(retryTimes = 3) {
    for (let attempt = 1; attempt <= retryTimes; attempt++) {
      try {
        const rows = await this.db("sys_perm_route").select("method", "path", "perm_code");
        const map = new Map();
        for (const r of rows) {
          map.set(`${String(r.method).toUpperCase()} ${r.path}`, r.perm_code);
        }
        cache.set(ROUTE_CACHE_KEY, map, 0);
        logger.info(`[perm-route] 接口归属已加载: ${map.size} 条`);
        return map.size;
      } catch (e) {
        const remain = retryTimes - attempt;
        if (remain > 0) {
          logger.warn(`[perm-route] 第 ${attempt}/${retryTimes} 次加载失败（${e.message}），1s 后重试，剩余 ${remain} 次`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          logger.error(`[perm-route] ⚠️ 重试 ${retryTimes} 次仍加载失败: ${e.message}（下个请求将自动重试）`);
          return 0;
        }
      }
    }
    return 0;
  }

  // 懒加载单飞：auth 中间件首个后台请求时调用。
  // Map 未加载（缓存无 key）才触发加载；并发首请求共享同一次加载（_loadingPromise 单飞）。
  // 加载失败不落空 Map → 下个请求自动重试，DB 恢复即自愈，启动零 DB 依赖。
  ensureLoaded() {
    if (cache.get(ROUTE_CACHE_KEY)) return Promise.resolve(true);
    if (!this._loadingPromise) {
      this._loadingPromise = this.loadPermRouteMap()
        .catch(() => 0)
        .finally(() => {
          this._loadingPromise = null;
        });
    }
    return this._loadingPromise;
  }

  // 后台增删改后刷新缓存（del + 重载）
  async reloadPermRouteCache() {
    cache.del(ROUTE_CACHE_KEY);
    return this.loadPermRouteMap();
  }

  // 鉴权查询：返回接口归属的权限码；未配置返回 null（同步读缓存）
  // 兜底：精确匹配未命中时按 :param 模板匹配（请求 /cms/article/5 → 库里 /cms/article/:id），
  // 否则带路径参数的接口永远匹配不到归属 → 非超管永久 403。
  getRoutePermCode(method, path) {
    const map = cache.get(ROUTE_CACHE_KEY);
    if (!map) return null;
    const key = `${String(method).toUpperCase()} ${path}`;
    if (map.has(key)) return map.get(key);
    const methodUpper = String(method).toUpperCase();
    for (const [k, code] of map.entries()) {
      const sp = k.split(" ");
      if (sp[0] !== methodUpper) continue;
      if (this._matchPattern(sp[1], path)) return code;
    }
    return null;
  }

  // 路由模板匹配：/cms/article/:id 匹配 /cms/article/5（段数相同、非参数段逐一相等）
  _matchPattern(pattern, path) {
    const p = pattern.split("/").filter(Boolean);
    const q = path.split("/").filter(Boolean);
    if (p.length !== q.length) return false;
    return p.every((seg, i) => seg.startsWith(":") || seg === q[i]);
  }

  // 判断某接口是否已配置（同步用，避免重复插入）
  isRouteConfigured(method, path) {
    const map = cache.get(ROUTE_CACHE_KEY);
    return !!map && map.has(`${String(method).toUpperCase()} ${path}`);
  }

  /**
   * 确保权限码对应的「模块 + 资源」存在于权限树表（sys_perm_module / sys_perm_resource）
   * 这样角色编辑弹窗的权限树会自动出现这一项，角色才能勾选该权限码。
   * 权限码格式：module:resource:action（如 cms:article:update）
   */
  async ensurePermResource(permCode) {
    const parts = String(permCode).split(":");
    if (parts.length < 2) return;
    const [mod, res] = parts;
    // 模块分组不存在则补（name 先取模块名兜底）
    const modRow = await this.db("sys_perm_module").where("module", mod).first();
    if (!modRow) {
      await this.db("sys_perm_module").insert({ module: mod, name: mod, sort: 99 });
    }
    // 资源不存在则补（新资源默认给全 4 个动作，方便后续勾选；名称先用资源 key 兜底）
    const resRow = await this.db("sys_perm_resource").where({ module: mod, resource_key: res }).first();
    if (!resRow) {
      await this.db("sys_perm_resource").insert({
        module: mod,
        resource_key: res,
        name: res,
        actions: JSON.stringify(["list", "create", "update", "delete"]),
        menu_id: 0,
        sort: 0,
      });
    }
  }

  // ===== 接口归属 CRUD（后台「接口权限」页）=====

  // 接口归属列表（分页 + 关键词 + method 筛选）
  async routeList(query = {}) {
    try {
      const current = parseInt(query.current) || 1;
      const pageSize = parseInt(query.pageSize) || 20;
      const { keywords = "", method = "" } = query;
      let q = this.db("sys_perm_route");
      if (keywords) {
        q = q.where((w) => {
          w.where("path", "like", `%${keywords}%`).orWhere("perm_code", "like", `%${keywords}%`);
        });
      }
      if (method) q = q.andWhere("method", String(method).toUpperCase());
      const countQ = q.clone();
      const [{ total }] = await countQ.count({ total: "*" });
      const list = await q
        .orderBy("method")
        .orderBy("path")
        .offset((current - 1) * pageSize)
        .limit(pageSize);
      return { success: true, code: 0, msg: "查询成功", data: { total: Number(total), list } };
    } catch (error) {
      logger.error("[SysPermRoute.routeList] 查询出错:", error.message);
      return { success: false, code: 5001, msg: "查询失败", data: { total: 0, list: [] } };
    }
  }

  // 新增接口归属（method+path 唯一，重复时更新归属；自动补权限码 + 权限树资源）
  /**
   * 权限子集校验：非超管只能把接口归属改绑到自己已持有的权限码，
   * 防止把高危接口（如删用户）改绑到自己持有的低危码实现垂直提权。
   */
  _checkCallerCanBind(permCode, callerPerms) {
    // 超管持 *:*:* 直通；其余必须精确持有目标权限码才能改绑
    if (!Array.isArray(callerPerms) || callerPerms.includes('*:*:*')) return { ok: true };
    if (!permCode) return { ok: true };
    if (callerPerms.includes(permCode)) return { ok: true };
    return { ok: false, key: permCode };
  }

  async routeCreate(data = {}, callerPerms = []) {
    const { method = "", path = "", perm_code = "", remark = "" } = data;
    const m = String(method).toUpperCase();
    const p = String(path).trim();
    const c = String(perm_code).trim();
    if (!HTTP_METHODS.includes(m)) return { success: false, code: 1007, msg: "请求方法不合法" };
    if (!p.startsWith("/")) return { success: false, code: 1007, msg: "接口路径需以 / 开头" };
    if (!PERM_CODE_RE.test(c)) {
      return { success: false, code: 1007, msg: "归属权限码格式应为 module:resource:action（action ∈ list/create/update/delete）" };
    }
    // 防垂直提权：非超管不能把接口绑定到自己没有的权限码
    const bindCheck = this._checkCallerCanBind(c, callerPerms);
    if (!bindCheck.ok) {
      return { success: false, code: 1008, msg: `无权将接口绑定到自身未持有的权限码: ${bindCheck.key}` };
    }
    // 确保归属码存在于 sys_permission（角色勾选依赖）
    const exist = await this.db("sys_permission").where("perm_key", c).first();
    if (!exist) {
      await this.db("sys_permission").insert({ perm_key: c, perm_type: "I", name: c, menu_id: 0 });
    }
    await this.db("sys_perm_route")
      .insert({ method: m, path: p, perm_code: c, remark: remark || null })
      .onConflict(["method", "path"])
      .merge({ perm_code: c, remark: remark || null });
    await this.ensurePermResource(c); // 新资源自动进权限树（角色权限树能勾到）
    await this.reloadPermRouteCache();
    return { success: true, code: 0, msg: "保存成功" };
  }

  // 编辑接口归属
  async routeUpdate(data = {}, callerPerms = []) {
    const { id, method, path, perm_code, remark } = data;
    if (!id) return { success: false, code: 1007, msg: "ID不能为空" };
    const payload = {};
    if (method) payload.method = String(method).toUpperCase();
    if (path) {
      const p = String(path).trim();
      if (!p.startsWith("/")) return { success: false, code: 1007, msg: "接口路径需以 / 开头" };
      payload.path = p;
    }
    if (perm_code) {
      const c = String(perm_code).trim();
      if (!PERM_CODE_RE.test(c)) {
        return { success: false, code: 1007, msg: "归属权限码格式应为 module:resource:action" };
      }
      // 防垂直提权：非超管不能把接口改绑到自己没有的权限码
      const bindCheck = this._checkCallerCanBind(c, callerPerms);
      if (!bindCheck.ok) {
        return { success: false, code: 1008, msg: `无权将接口改绑到自身未持有的权限码: ${bindCheck.key}` };
      }
      payload.perm_code = c;
    }
    if (remark !== undefined) payload.remark = remark || null;
    if (Object.keys(payload).length === 0) return { success: false, code: 1007, msg: "没有可更新的字段" };
    await this.db("sys_perm_route").where("id", id).update(payload);
    await this.reloadPermRouteCache();
    return { success: true, code: 0, msg: "更新成功" };
  }

  // 删除接口归属
  async routeDelete(id) {
    if (!id) return { success: false, code: 1007, msg: "ID不能为空" };
    await this.db("sys_perm_route").where("id", id).del();
    await this.reloadPermRouteCache();
    return { success: true, code: 0, msg: "删除成功" };
  }

  /**
   * 同步路由权限：扫描各管理模块 router.js，
   * 未配置归属的接口按 URL 末段动词自动归类，写入 sys_perm_route + 确保 sys_permission/权限树资源补齐
   * @returns {string[]} 本次新增的接口配置（"METHOD path → code"）
   */
  async syncRoutePermissions() {
    const fs = await import("fs");
    const pathMod = await import("path");
    const modulesPath = getApp().paths?.modulesPath || pathMod.join(process.cwd(), "app", "modules");
    const ADMIN_MODULES = ["cms", "base", "oss", "template", "member", "iplib"];

    // 自动归类：URL 末段动词 → 规范动作
    const ACTION_GROUPS = {
      list: ["list", "view", "search", "detail", "find", "info", "tree", "statistics", "all", "folder", "getlist", "has", "hasuse", "appinfo", "runenv", "views", "gethtml", "getarticle", "allrouter", "findid", "findsubid", "findfield", "findbymid"],
      create: ["create", "add"],
      update: ["update", "edit", "save", "sync", "run", "upload", "move", "copy", "rename", "createfolder", "compress", "audit"],
      delete: ["delete", "remove", "del", "clear"],
    };
    const PAIR = {};
    for (const [g, verbs] of Object.entries(ACTION_GROUPS)) verbs.forEach((v) => (PAIR[v] = g));
    const SPECIAL = {
      "/base/user/logout": "base:user:list",
    };

    // 动作解析：末段是路径参数（:id/:slug）时按 HTTP 方法判定（GET 读 / DELETE 删 / PUT 改 / POST 写）；
    // 否则 GET 归 list，写操作按末段动词归类（PAIR）。
    const resolveAction = (method, last) => {
      if (last.startsWith(":")) {
        return method === "DELETE" ? "delete"
          : method === "PUT" ? "update"
          : method === "POST" ? "create"
          : "list"; // GET
      }
      return method === "GET" ? "list" : (PAIR[last] || "create");
    };

    const classify = (method, path) => {
      if (SPECIAL[path]) return SPECIAL[path];
      const segs = path.split("/").filter(Boolean);
      const last = (segs[segs.length - 1] || "").toLowerCase();
      const isRead = method === "GET";
      if (path.startsWith("/template/v1/")) return isRead ? "template:code:list" : "template:code:update";
      if (path.startsWith("/member/v1/")) return isRead ? "member:user:list" : "member:user:update";
      if (path.startsWith("/oss/")) {
        if (isRead) return "oss:file:list";
        if (last === "delete") return "oss:file:delete";
        return "oss:file:create";
      }
      // 通用后台接口（/cms/article/:id、/base/xxx …）：按第 2 段当 resource 归类，末段 :param 按方法判定动作。
      // 不能因「含 :」或「<3 段」直接 return null，否则新增接口（尤其详情/删除类 :id 路由）永久 403。
      const mod = segs[0];
      const res = segs[1] ? segs[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase()) : mod;
      return `${mod}:${res}:${resolveAction(method, last)}`;
    };

    // 先刷新缓存，保证 isRouteConfigured 基于最新表数据判断（不重复插入）
    await this.reloadPermRouteCache();

    const added = [];
    for (const mod of ADMIN_MODULES) {
      const routerFile = pathMod.join(modulesPath, mod, "router.js");
      if (!fs.existsSync(routerFile)) continue;
      const src = fs.readFileSync(routerFile, "utf8");
      const prefixes = [...src.matchAll(/app\.use\(\s*["']([^"']+)["']\s*,\s*router\s*\)/g)].map((m) => m[1]);
      if (prefixes.length === 0) continue;
      const routeRe = /router\.(get|post|put|delete)\(\s*["']([^"']+)["']/g;
      let m;
      while ((m = routeRe.exec(src))) {
        const method = m[1].toUpperCase();
        const rpath = m[2];
        for (const prefix of prefixes) {
          const full = prefix + (rpath.startsWith("/") ? rpath : "/" + rpath);
          // 含 :param 的路由也必须登记（/cms/article/:id 等详情/删除接口），否则非超管 403。
          // classify 按末段 :param 的 HTTP 方法判定动作（GET→list / DELETE→delete …）。
          const key = `${method} ${full}`;
          if (Array.isArray(SKIP_PATHS) && SKIP_PATHS.includes(key)) continue;
          if (this.isRouteConfigured(method, full)) continue; // 已配置（含手动改过的）跳过
          const code = classify(method, full);
          if (!code || !code.includes(":")) continue;
          await this.db("sys_perm_route").insert({ method, path: full, perm_code: code });
          added.push(`${key} → ${code}`);
        }
      }
    }

    // 确保新归属码存在于 sys_permission（角色勾选/鉴权依赖）+ 权限树资源自动补齐（角色权限树能勾到）
    if (added.length) {
      const codes = [...new Set(added.map((a) => a.split("→ ")[1]))];
      const existing = await this.db("sys_permission").select("perm_key");
      const existSet = new Set(existing.map((r) => r.perm_key));
      const missing = codes.filter((c) => !existSet.has(c));
      if (missing.length) {
        await this.db("sys_permission").insert(missing.map((c) => ({ perm_key: c, perm_type: "I", name: c, menu_id: 0 })));
      }
      for (const c of codes) await this.ensurePermResource(c); // 新资源自动进权限树
      await this.reloadPermRouteCache(); // 新增归属立即生效
    }
    return added;
  }
}

export default new SysPermRouteService();

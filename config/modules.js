// 模块加载顺序 = 路由注册顺序（框架不再强制 web 后置）。
// web 含动态匹配路由，必须放在末位，避免兜底路由抢先拦截后续模块。
// health 提供顶层 /health 端点（框架内置版已在 config/health.js 关闭），需最先注册。
export const modules = [
  "health",
  "base",
  "cms",
  "member",
  "template", // 模板文件编辑器（非会员模块）
  "iplib", // 本地 ip2region IP 归属地查询（非反向代理）
  "oss",
  "api", // C 端聚合层（H5/小程序前后端分离统一入口），必须在 web 之前
  "web",
];

export default {
  modules,
};

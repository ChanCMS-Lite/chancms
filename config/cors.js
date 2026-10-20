// CORS 配置（后台 API 的跨域白名单）
//
// 配置来源（两层，DB 优先、env 兜底，默认兜底保留不可删）：
//   1) 兜底默认：环境变量 CORS_ORIGIN（逗号分隔多域名，或 * 全放行）
//   2) 后台覆盖：sys_config.cors_config.ORIGIN（base/config/update 保存后经 remote-config
//      原地覆盖 cors.originList，无需重启即时生效；删除/清空该行则回落 env 兜底）
//   注意区分：这里管的是「后台 API 本身」的 CORS；OSS 直传 bucket 的 CORS 在
//   sys_config 的 aliyun_oss/tencent_oss/qiniu_oss 分组 corsOrigin（apply-oss-cors.mjs 应用）。
//
// 安全：
//   - origin 为 * 且 credentials 为 true 违反 W3C 规范（CSRF 风险），故 * 时强制 credentials=false
//   - credentials 由启动期 env 决定（chanjs Cors 中间件把 options 静态化，无法运行时翻转）：
//     需要跨域携带 Cookie 时，把启动 env 的 CORS_ORIGIN 设为具体域名白名单
//     （后台白名单只影响放行的 origin，不改变 credentials 行为）
const rawOrigin = process.env.CORS_ORIGIN || "*";

// 解析为白名单数组（支持单域名或多域名逗号分隔）
const parseOriginList = (raw) =>
  raw === "*" ? "*" : raw.split(",").map(s => s.trim()).filter(Boolean);


export const cors = {
  // 当前生效的白名单（"*" 或域名数组）。
  // remote-config 启动期/后台保存后会原地覆盖此属性，
  // 下面的 origin 函数每次请求实时读取，实现免重启生效。
  originList: parseOriginList(rawOrigin),

  // 动态白名单校验（每次请求执行）
  origin: (origin, callback) => {
    const list = cors.originList;
    if (list === "*") {
      // 全放行：返回 "*" 保持与旧行为一致（ACAO: *）
      return callback(null, "*");
    }
    // 白名单模式：不在名单内不放行（cors 对 false 的处理是不发 CORS 头，不拦截请求）
    callback(null, list.includes(origin));
  },

  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: rawOrigin !== "*", // 启动期 env 决定；origin=* 时强制 false（W3C 规范要求）
  maxAge: 86400,
};

export default {
  cors,
};

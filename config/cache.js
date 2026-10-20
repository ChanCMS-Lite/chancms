// 缓存开关：栏目、碎片、站点基本信息稳定后开启可提升性能
// 缓存 key 统一在 app/common/cache-keys.js 管理
//
// 配置来源（两层，DB 优先、env 兜底，默认兜底保留）：
//   1) 兜底默认：环境变量 CACHE === "false" 时关闭，其余开启（本文件）
//   2) 后台覆盖：sys_config.cache_config.CACHE（true/false/1/0），
//      经 remote-config 写到 config.CACHE；消费端 web/middleware/init.js
//      每请求实时读取，后台改完即时生效，无需重启
export const CACHE = process.env.CACHE === "false" ? false : true;

export default { CACHE };

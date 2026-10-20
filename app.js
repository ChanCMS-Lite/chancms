import Chan from "chanjs";
import { loadRemoteConfig } from "./app/common/remote-config.js";
const chan = new Chan();
/**
 * @description  加载数据配置合并到默认配置
 * @runtime 执行时机：在 #loadConfig 之后、#loadDb 之后、listen 之前执行
 * @config 数据配置：sys_config 里的 upload/email 配置「合并」进 app.config，作为配置唯一来源
 * @update 后台 base/config/update 改完配置后会再次调用 loadRemoteConfig 即时重载。
 */
chan.beforeStart(loadRemoteConfig);

await chan.start();

chan.run((port) => {
  console.log(`🌟 ChanCMS is running on http://localhost:${port}`);
});

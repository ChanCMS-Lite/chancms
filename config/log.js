// 日志配置
// 唯一真实开关是环境变量 LOG_LEVEL（pino 级别）：
//   trace / debug / info / warn / error / fatal（默认 info）
// pino 实例在框架内（chanjs/utils/logger.js）直接读 process.env.LOG_LEVEL 创建，
// 本文件导出的 config.logger 仅作配置留存、无运行时消费方（勿在此调级别，改了不生效）。
// pm2 生产环境在 pm2/mysql.json 的 env 里注入 LOG_LEVEL=info。
export const logger = {
  level: process.env.LOG_LEVEL || "info",
};

export default {
  logger,
};

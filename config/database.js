// 数据库连接配置（三选一，由环境变量 DB_TYPE 决定：mysql / pg / sqlite，默认 mysql）
// 连接参数全部来自 env 文件（node --env-file=env/xxx 或 pm2 env 注入）：
//   DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_DATABASE / DB_FILEPATH(sqlite)
//   DB_POOL_MIN / DB_POOL_MAX（连接池，默认 2/10）
// 注：口令强度由部署方自行保证，本文件不做弱口令拦截。
const dbType = (process.env.DB_TYPE || "mysql").toLowerCase();

const defaultMysql = {
  key: "primary",
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "123456",
    database: process.env.DB_DATABASE || "chancms",
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || 2),
    max: parseInt(process.env.DB_POOL_MAX || 10),
    acquireTimeoutMillis: 5000, // 连接超时
    idleTimeoutMillis: 30000, // 空闲超时
    reapIntervalMillis: 5000, // 检查间隔
  },
};

// sqlite：client 为纯字符串配置，SqliteAdapter 驱动由 chanjs 框架根据类型自动挂载
const defaultSqlite = {
  key: "primary",
  client: "sqlite",
  connection: {
    filename: process.env.DB_FILEPATH || "./data/init.sqlite",
  },
  useNullAsDefault: true,
};

const defaultPg = {
  key: "primary",
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "123456",
    database: process.env.DB_DATABASE || "chancms",
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || 2),
    max: parseInt(process.env.DB_POOL_MAX || 10),
    acquireTimeoutMillis: 5000, // 连接超时
    idleTimeoutMillis: 30000, // 空闲超时
    reapIntervalMillis: 5000, // 检查间隔
  },
};

const currentConn = dbType === "mysql" ? defaultMysql : dbType === "pg" ? defaultPg : defaultSqlite;

export const db = [currentConn];

export default {
  db,
};

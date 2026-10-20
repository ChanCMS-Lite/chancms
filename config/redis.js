/**
 * Redis 配置
 * 用于 Rate Limit 计数、缓存等跨请求共享存储
 *
 * 启用方式：
 *   1. 环境变量 REDIS_ENABLED=true
 *   2. 或直接修改 REDIS_ENABLED 常量
 *
 * 未启用时，框架自动回退到内存模式（Map+TTL，上限 20MB / 10万条）
 */

// 是否启用 Redis（默认开启，环境变量显式 false 才关闭）
// 本地开发已启动 Redis，生产环境也推荐启用
export const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

// Redis 连接配置
// 默认连接本地 127.0.0.1:6379（DBngin/Homebrew 标准地址）
// Docker 环境通过 REDIS_HOST=chancms-redis 覆盖
export const REDIS = {
  // 连接选项（透传给 ioredis）
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0', 10),
  // 连接超时（毫秒）
  connectTimeout: 5000,
  // 命令超时
  commandTimeout: 1000,
  // 自动重连
  retryStrategy(times) {
    if (times > 3) return null; // 重试 3 次后放弃
    return Math.min(times * 200, 1000);
  },
  // 懒加载：仅在用到时建立连接
  lazyConnect: true,
  // 显示友好名称（用于日志）
  name: 'chancms-redis',
};

export default {
  REDIS_ENABLED,
  REDIS,
};

/**
 * WAF (Web Application Firewall) 配置
 *
 * 合法配置键（框架启动期自检，未知键会打 warn）：
 *  - enabled       是否启用 WAF
 *  - rateLimit     限流参数（max/windowMs），复用 config/ratelimit.js 的 global
 *  - ignorePaths   跳过限流 + URL 关键词检测的路径前缀（精确/前缀匹配，大小写不敏感）
 *  - bodyXssPaths  请求体 XSS 过滤白名单（路径前缀），默认为空 = 任何接口都不过滤 body。
 *                  只有公开用户生成内容（会员/留言/评论）的写入接口才需要声明，防存储型 XSS；
 *                  后台富文本编辑接口（文章/产品/书籍等）不声明——正文里的 style/iframe/script
 *                  是管理员有意写入的内容，过滤会静默破坏排版与特效。
 */

import { rateLimit } from "./ratelimit.js";

export const waf = {
  // 是否启用 WAF
  enabled: true,

  // 限流配置：基于 IP 维度，服务端存储
  // 复用统一限流配置（config/ratelimit.js 的 global，跟随环境 dev/prd 切换）
  rateLimit: rateLimit.global,

  // 静态资源与健康检查跳过限流 + URL 关键词检测
  ignorePaths: [
    '/health',
    '/favicon.ico',
    '/static',
    '/public',
    '/view',
  ],

  // 请求体 XSS 过滤：按需开启（默认全不过滤）
  bodyXssPaths: [
    '/member/v1',   // 会员注册/资料/评论
    '/api/v1',      // 小程序/H5 公开接口（评论发布等）
    '/cms/message', // 留言板（游客提交）
  ],
};

export default {
  waf,
};

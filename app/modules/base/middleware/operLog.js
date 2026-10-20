import OperLog from "../service/OperLog.js";
import { parseIpRegion } from "../../../common/ip2region.js";
import { getIp } from "chanjs/utils/index.js";
import { logger } from "chanjs";


const getBusinessType = (method) => {
  switch (method?.toUpperCase()) {
    case 'POST':
      return 1;
    case 'PUT':
    case 'PATCH':
      return 2;
    case 'DELETE':
      return 3;
    default:
      return 0;
  }
};

const filterSensitiveParams = (body) => {
  if (!body || typeof body !== 'object') return body;
  // 敏感字段：密码类、token 类、个人联系信息类（不写入操作日志防止泄露）
  // 匹配时统一转小写，同时覆盖 camelCase（newPassword）与 snake_case（new_password）命名
  const sensitiveFields = new Set([
    'password', 'newpassword', 'confirmPassword'.toLowerCase(), 'oldpassword', 'pwd',
    'token', 'accesstoken', 'refreshtoken', 'authorization',
    'email', 'phone', 'mobile', 'tel',
  ]);
  const result = {};
  for (const [key, value] of Object.entries(body)) {
    if (!sensitiveFields.has(String(key).toLowerCase())) {
      result[key] = value;
    }
  }
  return result;
};

const getModuleTitle = (url) => {
  const parts = url.split('?')[0].split('/').filter(Boolean);
  return parts[1] || parts[0] || '未知模块';
};

// ============ 异步批量写入队列 ============
// 内存缓冲队列：res.finish 时仅 push（无 IO），定时或满阈值时批量 INSERT
const pendingLogs = [];
const FLUSH_INTERVAL_MS = 5 * 1000; // 5 秒 flush 一次
const FLUSH_THRESHOLD = 50;         // 满 50 条立即 flush
const MAX_PENDING = 1000;           // 队列上限（防 DB 长时间不可用导致 OOM）
let flushing = false;               // 防并发 flush 标志

/**
 * 批量 flush 待写入日志
 * - 用 splice(0) 原子取出全部待写日志
 * - 失败只打日志不抛错（日志不能影响主业务）
 */
const flushLogs = async () => {
  // 正在 flush 或队列为空，跳过（避免并发 batchInsert 重复写入）
  if (flushing || pendingLogs.length === 0) return;
  flushing = true;
  const records = pendingLogs.splice(0);
  try {
    await OperLog.batchInsert(records);
  } catch (err) {
    // 失败只打日志，不抛错（日志不能影响主业务）
    logger.error('[OperLog] 批量写入日志失败:', err.message);
  } finally {
    flushing = false;
  }
};

// 定时 flush（unref 保证不阻止进程退出）
const flushTimer = setInterval(flushLogs, FLUSH_INTERVAL_MS);
if (flushTimer.unref) flushTimer.unref();

// 进程退出前 flush 剩余日志
// beforeExit 在 SIGINT/SIGTERM 正常终止流程下不一定触发，单独注册信号监听兜底
process.on('beforeExit', () => {
  flushLogs().catch(() => {});
});

// 收到终止信号时，先把内存队列里的审计日志刷盘，再把同一信号交还框架的优雅停机处理
// （不自行 exit，避免与 App.js 的 SIGINT/SIGTERM 处理重复或导致进程挂起）
const flushOnSignal = (sig) => {
  flushLogs()
    .catch(() => {})
    .finally(() => {
      process.removeListener(sig, flushOnSignal);
      process.kill(process.pid, sig);
    });
};
process.on('SIGINT', flushOnSignal);
process.on('SIGTERM', flushOnSignal);

export default () => {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      try {
        const url = req.originalUrl || req.url || '';

        // 只记录后台管理接口
        if (!url.startsWith('/base/') && !url.startsWith('/cms/')) {
          return;
        }

        // 跳过登录、验证码等敏感接口
        // 必须用 contains('captcha') 而非 '/captcha'：
        //   图形验证码接口是 /base/verifyCaptcha（captcha 前是 y 不是 /），
        //   用 '/captcha' 会漏判，把高频校验写进操作日志变成噪音。
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('/login') || lowerUrl.includes('captcha')) {
          return;
        }

        // 只记录修改操作（POST/PUT/DELETE），不记录查询（GET）
        const method = req.method?.toUpperCase();
        if (method === 'GET') {
          return;
        }

        const { username } = req.user || {};
        const params = filterSensitiveParams(req.body);
        // 安全的 JSON.stringify，避免 undefined 导致 slice 报错
        const safeStringify = (obj, maxLen = 2000) => {
          const str = JSON.stringify(obj);
          return (str || '').slice(0, maxLen);
        };
        // 只记状态码，不记响应体（响应体常含列表数据/敏感字段，整包入库膨胀日志且有泄露风险）
        const resultStr = '';
        const status = res.statusCode < 400 ? 1 : 0;
        const errorMsg = res.statusCode >= 400 ? 'HTTP ' + res.statusCode : '';

        // 解析 IP 归属地（内网 IP 返回占位，外网 IP 走 ip2region）
        const operIp = getIp(req) || '';
        const geo = parseIpRegion(operIp);

        // push 到内存队列，不做 IO（5s 定时或满 50 条触发批量 INSERT）
        // 队列上限保护：超过 MAX_PENDING 时丢弃最旧日志（DB 长时间不可用防 OOM）
        if (pendingLogs.length >= MAX_PENDING) {
          pendingLogs.splice(0, pendingLogs.length - MAX_PENDING + 1);
        }
        pendingLogs.push({
          title: getModuleTitle(url),
          business_type: getBusinessType(req.method),
          method: url,
          request_method: req.method,
          operator_type: 1, // 后台用户
          oper_name: username || '',
          oper_url: url,
          oper_ip: operIp,
          oper_param: safeStringify(params),
          json_result: resultStr,
          status,
          error_msg: errorMsg,
          oper_time: new Date(startTime),
          // IP 归属地（对齐 sys_oper_log 表字段）
          country: geo.country,
          prov: geo.prov,
          city: geo.city,
          district: geo.district,
          isp: geo.isp,
        });

        // 满 50 条立即触发 flush
        if (pendingLogs.length >= FLUSH_THRESHOLD) {
          flushLogs().catch((err) => {
            logger.error('[OperLog] 触发 flush 失败:', err.message);
          });
        }
      } catch (err) {
        logger.error('[OperLog] 操作日志中间件异常:', err.message);
      }
    });

    next();
  };
};

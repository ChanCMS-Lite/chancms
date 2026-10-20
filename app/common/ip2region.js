/**
 * IP 归属地解析工具（基于 ip2region）
 *
 *=======================================
 * 设计说明
 *=======================================
 * - 单例 searcher，避免每次解析重新加载数据库
 * - 统一处理内网 IP（返回"内网"占位）
 * - 统一字段命名，对齐 sys_oper_log 表（country/prov/city/district/isp）
 *
 *=======================================
 * 使用
 *=======================================
 * import { parseIpRegion } from '../../../common/ip2region.js';
 * const geo = parseIpRegion('1.2.3.4');
 * // → { country: '中国', prov: '浙江省', city: '杭州', district: null, isp: '电信' }
 */
import { createRequire } from 'module';
import { logger } from "chanjs";

const require = createRequire(import.meta.url);
const { default: IP2Region } = require('ip2region');

// 单例 searcher（加载 ip2region.db，约 11MB，仅初始化一次）
const searcher = new IP2Region();

/**
 * 内网 IP 判断
 * RFC 1918 私有网段 + 回环地址
 * @param {string} ip
 * @returns {boolean}
 */
function isIntranet(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1' || ip === '0.0.0.0') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

/**
 * 解析 IP 归属地
 * @param {string} ip - IPv4/IPv6 地址
 * @returns {Object} 归属地信息
 *   - country {string} 国家
 *   - prov    {string} 省份
 *   - city    {string} 城市
 *   - district {string|null} 区县（ip2region 不提供，固定 null）
 *   - isp     {string} 网络提供商
 *   - is_intranet {boolean} 是否内网
 */
export function parseIpRegion(ip) {
  // 内网 IP 直接返回占位
  if (isIntranet(ip)) {
    return {
      country: '内网',
      prov: '内网',
      city: '内网',
      district: null,
      isp: '内网',
      is_intranet: true,
    };
  }

  try {
    const geo = searcher.search(ip);
    if (geo) {
      return {
        country: geo.country || '未知',
        prov: geo.province || '未知',
        city: geo.city || '未知',
        district: null,  // ip2region 不提供区县
        isp: geo.isp || '未知',
        is_intranet: false,
      };
    }
  } catch (err) {
    logger.error('[ip2region] 解析失败:', ip, err.message);
  }

  return {
    country: '未知',
    prov: '未知',
    city: '未知',
    district: null,
    isp: '未知',
    is_intranet: false,
  };
}

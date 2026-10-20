import dns from 'dns';
import net from 'net';

/**
 * 判断 IP 是否为私有/保留地址（禁止 SSRF 访问）
 * 覆盖 RFC 1918 + RFC 6598 + 云元数据 + 回环 + 链路本地 + 未分配
 */
function isPrivateIp(ip) {
  // IPv4
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    // 0.0.0.0/8          未指定/本机
    // 10.0.0.0/8         RFC 1918 私有
    // 100.64.0.0/10      RFC 6598 CGNAT
    // 127.0.0.0/8        回环
    // 169.254.0.0/16     链路本地（含云元数据 169.254.169.254）
    // 172.16.0.0/12      RFC 1918 私有
    // 192.0.0.0/24       IETF 协议分配
    // 192.168.0.0/16     RFC 1918 私有
    // 198.18.0.0/15      RFC 2544 基准测试
    // 224.0.0.0/4        组播
    // 240.0.0.0/4        保留
    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true;
    return false;
  }
  // IPv6
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA
    if (lower.startsWith('fe80')) return true; // 链路本地
    if (lower.startsWith('::ffff:')) {
      // IPv4 映射地址，提取 IPv4 部分校验
      const v4 = lower.split(':').pop();
      if (net.isIPv4(v4)) return isPrivateIp(v4);
    }
  }
  return false;
}

/**
 * 校验目标 URL 是否安全（防 SSRF）
 * 检查项：
 *   1. 仅允许 http/https 协议
 *   2. 禁止私有/保留 IP（含云元数据 169.254.169.254）
 *   3. DNS 解析后校验真实 IP，防止 DNS Rebinding
 *   4. 禁止 localhost
 * @param {string} urlString - 待校验的 URL
 * @returns {Promise<{valid:boolean,reason?:string}>} valid=true 安全可访问
 */
export const isValidTargetUrl = async (urlString) => {
  try {
    const url = new URL(urlString);

    // 1. 协议白名单（仅 http/https）
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, reason: '仅支持 http/https 协议' };
    }

    const hostname = url.hostname;

    // 2. 禁止 localhost
    if (hostname === 'localhost') {
      return { valid: false, reason: '禁止访问 localhost' };
    }

    // 3. 如果 hostname 是 IP，直接校验
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return { valid: false, reason: '禁止访问私有 IP 地址' };
      }
      return { valid: true };
    }

    // 4. DNS 解析后校验真实 IP（防 DNS Rebinding）
    try {
      const addresses = await dns.promises.lookup(hostname, { all: true });
      if (!addresses.length) {
        return { valid: false, reason: '域名无法解析' };
      }

      // 任一解析 IP 命中私有段即拒绝
      for (const { address } of addresses) {
        if (isPrivateIp(address)) {
          return { valid: false, reason: '域名解析到私有 IP，存在安全风险' };
        }
      }

      return { valid: true };
    } catch (dnsErr) {
      // DNS 解析失败一律 fail-closed：无法证明目标不落在私有网段时拒绝请求
      // （旧版对 ENOTFOUND/异常放行，实际是 fail-open，攻击者可用不存在的域名骗过校验）
      return { valid: false, reason: `DNS 解析失败(${dnsErr.code || dnsErr.message})` };
    }
  } catch (e) {
    return { valid: false, reason: `URL 格式错误: ${e.message}` };
  }
};

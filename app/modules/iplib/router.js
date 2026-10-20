import { loader, createRateLimitMiddleware } from "chanjs";
import { rateLimit } from "../../../config/ratelimit.js";

/**
 * IP 归属地查询模块（原 proxy 目录，名实不符重命名为 iplib）
 *
 * GET /iplib/v1/ip —— 取访客公网 IP / 归属地（本地 ip2region 库查询，非 SSRF 出口，无出站 HTTP）
 *
 * 安全边界：
 *  - 按设计对外公开（登录前就要用），因此不加鉴权，但**必须限流**：
 *    `?ip=` 可查任意 IP，无限流即等于对外提供一个免费的 IP 归属地查询服务。
 *    阈值见 config/ratelimit.js 的 ipQuery。
 *  - IP 取值统一走框架 getIp（见 controller），不自行解析 XFF。
 */
export default async (app, router, config) => {
  let controller = await loader.loadController("iplib");

  //用户
  router.get(
    "/ip",
    createRateLimitMiddleware({
      windowMs: rateLimit.ipQuery.windowMs,
      max: rateLimit.ipQuery.max,
    }),
    controller.IpQuery.ip
  );

  //配置前缀
  app.use("/iplib/v1", router);
};

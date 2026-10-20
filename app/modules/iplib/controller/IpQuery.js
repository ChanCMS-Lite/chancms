import { Controller } from "chanjs";
import { validated } from "../../../common/validate.js";
import { ipSchema } from "../validator/IpQuery.js";
import { parseIpRegion } from "../../../common/ip2region.js";
import { getIp } from "chanjs/utils/index.js";


class IpQueryController extends Controller {
  #getIpInfo(ip, geo = {}) {
    return {
      status: "success",
      country: geo.country || "未知",
      countryCode: "CN",
      region: geo.prov || "未知",
      regionName: geo.prov || "未知",
      city: geo.city || "未知",
      district: geo.district || "",
      zip: "",
      lat: "0.0",
      lon: "0.0",
      timezone: "Asia/Shanghai",
      isp: geo.isp || "未知",
      org: "",
      as: geo.isp || "未知",
      query: ip,
    };
  }

  async ip(req, res, next) {
    try {
      const vdata = validated(ipSchema, req.query, res, this);
      if (vdata === undefined) return;
      const targetIP = req.query.ip || getIp(req);
      if (!targetIP) return res.json(this.fail({ msg: "无法获取IP地址" }));

      const geo = parseIpRegion(targetIP);
      return res.json(this.success({ data: this.#getIpInfo(targetIP, geo) }));
    } catch (err) {
      next(err);
    }
  }
}

export default new IpQueryController();

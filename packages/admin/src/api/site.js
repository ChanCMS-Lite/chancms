import http from "../utils/http.js";
import API from "../config/index.js";

/**
 * @description 获取应用基本信息
 */
export let appInfo = () => {
  return http({
    url: `${API.BASE_API}/cms/site/appInfo`,
    method: "get",
  });
};

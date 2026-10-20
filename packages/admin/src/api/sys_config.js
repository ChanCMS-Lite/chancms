import http from "../utils/http";
import API from "../config/index";

export let views = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/views`,
    method: "get",
  });
};

// 应用配置所在视图目录（视图模板选择器使用）
export let folder = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/folder`,
    method: "get",
  });
};

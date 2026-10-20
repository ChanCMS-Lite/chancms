import http from "@/utils/http.js";
import API from "@/config/index.js";


/**
 * @description 运行环境
 */
export let runEnv = () => {
  return http({
    url: `${API.BASE_API}/cms/site/runEnv`,
    method: "get",
  });
};

export let tongji = () => {
  return http({
    url: `${API.BASE_API}/cms/article/tongji`,
    method: "get",
  });
};

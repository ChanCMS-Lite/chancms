import API from "@/config/index.js";
import http from "@/utils/http.js";

/**
 * @description 网站基本信息
 */
export let getSiteInfo = () => {
  return http({
    url: `${API.BASE_API}/cms/site/info`,
    method: "get",
  });
};

//更新基本信息
export let update = (data) => {
  return http({
    url: `${API.BASE_API}/cms/site/update`,
    method: "post",
    data,
  });
};

/**
 * @description 运行环境
 */
export let runEnv = () => {
  return http({
    url: `${API.BASE_API}/cms/site/runEnv`,
    method: "get",
  });
};


export let getlist = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/getlist`,
    method: "get",
    params
  });
};

export let updateMany = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/updateMany`,
    method: "post",
    data: params
  });
};

import API from "@/config/index.js";
import http from "@/utils/http.js";

// 在线用户（只读列表 + 强退）
export let list = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/online/list`,
    method: "get",
    params
  });
};

export let kick = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/online/kick`,
    method: "post",
    data
  });
};

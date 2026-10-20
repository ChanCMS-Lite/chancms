import API from "@/config/index.js";
import http from "@/utils/http.js";

export const list = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/operLog/list`,
    method: "get",
    params,
  });
};

export const remove = (data) => {
  return http({
    url: `${API.BASE_API}/base/operLog/delete`,
    method: "post",
    data,
  });
};

export const clear = () => {
  return http({
    url: `${API.BASE_API}/base/operLog/clear`,
    method: "post",
  });
};

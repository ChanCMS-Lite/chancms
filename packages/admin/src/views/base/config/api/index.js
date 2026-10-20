import API from "@/config/index.js";
import http from "@/utils/http.js";

export let getlist = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/getlist`,
    method: "get",
    params
  });
};
export let list = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/list`,
    method: "get",
    params
  });
};
export let create = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/create`,
    method: "post",
    data: params
  });
};

export let detail = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/detail`,
    method: "get",
    params: params
  });
};

export let update = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/config/update`,
    method: "post",
    data: params
  });
};

export let remove = (data={}) => {
  return http({
    url: `${API.BASE_API}/base/config/delete`,
    method: "post",
    data: data
  });
}

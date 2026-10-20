
import API from "@/config/index.js";
import http from "@/utils/http.js";

export let list = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/list`,
    method: "get",
    params
  });
};

export let create = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/create`,
    method: "post",
    data: params
  });
};

export let detail = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/detail`,
    method: "get",
    params: params
  });
};


export let update = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/update`,
    method: "post",
    data: params
  });
};

export let remove = (data={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/delete`,
    method: "post",
    data: data
  });
}


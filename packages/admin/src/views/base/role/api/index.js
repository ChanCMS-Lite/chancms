
import API from "@/config/index.js";
import http from "@/utils/http.js";

export let menuList = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/menu/list`,
    method: "get",
    params
  });
};

export let list = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/role/list`,
    method: "get",
    params
  });
};

export let create = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/role/create`,
    method: "post",
    data: params
  });
};

export let detail = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/role/detail`,
    method: "get",
    params: params
  });
};


export let update = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/role/update`,
    method: "post",
    data: params
  });
};

export let remove = (data={}) => {
  return http({
    url: `${API.BASE_API}/base/role/delete`,
    method: "post",
    data: data
  });
}

export let roleMenuList = (params) => {
  return http({
    url: `${API.BASE_API}/base/roleMenu/list`,
    method: "get",
    params
  });
}

export let permTree = (params={}) => {
  return http({
    url: `${API.BASE_API}/base/permission/tree`,
    method: "get",
    params
  });
}

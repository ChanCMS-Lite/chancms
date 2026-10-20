import http from "../utils/http.js";
import API from "../config/index.js";

//查 所有栏目（可选按内容类型过滤：article=文章类 / product=商品类）
export let find = (params) => {
  return http({
    url: `${API.BASE_API}/cms/category/find`,
    method: "get",
    params,
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/category/create`,
    method: "post",
    data: opt,
  });
};

//栏目详情
export let findId = (id) => {
  return http({
    url: `${API.BASE_API}/cms/category/findId?id=${id}`,
    method: "get",
  });
};

//判断是否有子栏目
export let findSubId = (id) => {
  return http({
    url: `${API.BASE_API}/cms/category/findSubId?id=${id}`,
    method: "get",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/category/update`,
    method: "post",
    data: opt,
  });
};

export let destroy = (id) => {
  return http({
    url: `${API.BASE_API}/cms/category/delete?id=${id}`,
    method: "post",
  });
};

export let search = (key) => {
  return http({
    url: `${API.BASE_API}/cms/category/search?q=${key}`,
    method: "get",
  });
};

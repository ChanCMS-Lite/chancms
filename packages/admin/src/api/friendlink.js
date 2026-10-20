import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表
export let list = (page, keyword = "") => {
  const params = `page=${page}&pageSize=20${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}`;
  return http({
    url: `${API.BASE_API}/cms/friendlink/list?${params}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/friendlink/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/friendlink/delete?id=${id}`,
    method: "post",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/friendlink/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/friendlink/detail?id=${id}`,
    method: "get",
  });
};

import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表
export let search = (page, keyword = "") => {
  return http({
    url: `${API.BASE_API}/cms/frag/search?page=${page}&keywords=${keyword}&pageSize=20`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/frag/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/frag/delete?id=${id}`,
    method: "post",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/frag/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/frag/detail?id=${id}`,
    method: "get",
  });
};

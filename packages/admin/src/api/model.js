import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表（关联模型下拉用，拉全部，不被默认 pageSize 截断）
export let list = (page = 1, pageSize = 1000) => {
  return http({
    url: `${API.BASE_API}/cms/model/list?page=${page}&pageSize=${pageSize}`,
    method: "get",
  });
};

//搜索
export let search = (page = 1, keyword = "") => {
  return http({
    url: `${API.BASE_API}/cms/model/search?page=${page}&pageSize=20&keyword=${encodeURIComponent(keyword)}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/model/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id, table) => {
  return http({
    url: `${API.BASE_API}/cms/model/delete`,
    method: "post",
    data: {
      id,
      table,
    },
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/model/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/model/detail?id=${id}`,
    method: "get",
  });
};

//判断模型是否被使用
export let hasUse = (id) => {
  return http({
    url: `${API.BASE_API}/cms/model/hasUse?id=${id}`,
    method: "get",
  });
};

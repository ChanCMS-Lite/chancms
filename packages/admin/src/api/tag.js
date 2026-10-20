import http from "../utils/http.js";
import API from "../config/index.js";
//文章列表
export let search = (page=1, keyword = "", pageSize = 20, cid = 0) => {
  let url = `${API.BASE_API}/cms/tag/search?page=${page}&pageSize=${pageSize}&keyword=${keyword}`;
  if (cid) {
    url += `&cid=${cid}`;
  }
  return http({
    url,
    method: "get",
  });
};

//文章列表
export let list = (page, cid = 0) => {
  return http({
    url: `${API.BASE_API}/cms/tag/list?page=${page}&pageSize=20&cid=${cid}`,
    method: "get",
  });
};

export let has = (path, cid = 0) => {
  return http({
    url: `${API.BASE_API}/cms/tag/has?path=${path}&cid=${cid}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/tag/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/tag/delete?id=${id}`,
    method: "post",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/tag/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/tag/detail?id=${id}`,
    method: "get",
  });
};

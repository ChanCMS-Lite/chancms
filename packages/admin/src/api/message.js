import http from "../utils/http.js";
import API from "../config/index.js";

//列表
export let list = (page) => {
  return http({
    url: `${API.BASE_API}/cms/message/list?page=${page}&pageSize=20`,
    method: "get",
  });
};

//搜索（按标题/内容模糊匹配）
export let search = (page, keyword) => {
  return http({
    url: `${API.BASE_API}/cms/message/search?page=${page}&pageSize=20&keyword=${encodeURIComponent(keyword)}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/message/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/message/delete?id=${id}`,
    method: "post",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/message/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/message/detail?id=${id}`,
    method: "get",
  });
};

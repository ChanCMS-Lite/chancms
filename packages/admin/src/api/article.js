import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表
export let search = ({ page = 1, keyword = "", cid = 0, pageSize = 20, id, content_type } = {}) => {
  const params = { page, keyword, cid, pageSize }
  if (id) params.id = id
  // 按内容域过滤：'article,image,video' / 'page' 等（见 constants/contentTypes.js）
  if (content_type) params.content_type = content_type
  return http({
    url: `${API.BASE_API}/cms/article/search`,
    method: "get",
    params,
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/article/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/article/delete?id=${id}`,
    method: "post",
  });
};


//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/article/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/article/detail?id=${id}`,
    method: "get",
  });
};

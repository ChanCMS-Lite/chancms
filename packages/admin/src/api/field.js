import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表
export let list = (mid, page = 1, pageSize = 20) => {
  return http({
    url: `${API.BASE_API}/cms/field/list?page=${page}&mid=${mid}&pageSize=${pageSize}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/field/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/field/delete?id=${id}`,
    method: "post",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/field/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/field/detail?id=${id}`,
    method: "get",
  });
};

// 按模型ID获取全部字段定义（不分页，供 DynamicForm 渲染）
export let findByMid = (mid) => {
  return http({
    url: `${API.BASE_API}/cms/field/findByMid?mid=${mid}`,
    method: "get",
  });
};

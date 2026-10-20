import http from "@/utils/http.js";
import API from "@/config/index.js";

export let list = (page, pageSize, status = "") => {
  return http({
    url: `${API.BASE_API}/member/v1/comment/list`,
    method: "get",
    params: {
      page,
      pageSize,
      status
    }
  });
};

export let audit = (data) => {
  return http({
    url: `${API.BASE_API}/member/v1/comment/audit`,
    method: "post",
    data
  });
};

export let deleteComment = (id) => {
  return http({
    url: `${API.BASE_API}/member/v1/comment/delete`,
    method: "post",
    data: {
      id
    }
  });
};

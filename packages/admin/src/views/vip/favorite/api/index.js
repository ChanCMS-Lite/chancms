import http from "@/utils/http.js";
import API from "@/config/index.js";

export let list = (page, pageSize, keyword = "") => {
  return http({
    url: `${API.BASE_API}/member/v1/favorite/list`,
    method: "get",
    params: {
      page,
      pageSize,
      keyword: keyword || undefined
    }
  });
};

export let deleteFavorite = (id) => {
  return http({
    url: `${API.BASE_API}/member/v1/favorite/delete`,
    method: "post",
    data: {
      id
    }
  });
};

import http from "../utils/http";
import API from "../config/index";

export let allRouter = () => {
  return http({
    url: `${API.BASE_API}/base/menu/allRouter`,
    method: "get",
  });
};

export let allPermission = () => {
  return http({
    url: `${API.BASE_API}/base/permission/all`,
    method: "get",
  });
};

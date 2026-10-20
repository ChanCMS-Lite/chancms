import API from "@/config/index.js";
import http from "@/utils/http.js";

// 动态表格模板统一存于 sys_config，type_code 固定为 mid_template。
// 复用现有 /base/config/* 接口，无需后端改动；mid_template 不在远程配置组，
// 不会误触发热重载。
const TYPE_CODE = "mid_template";

// 列出全部模板
export let list = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/config/list`,
    method: "get",
    params: { ...params, type_code: TYPE_CODE },
  });
};

// 保存模板：config_key=模板名称，config_value=表格 JSON 字符串
export let create = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/config/create`,
    method: "post",
    data: { ...params, type_code: TYPE_CODE },
  });
};

// 删除模板
export let remove = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/config/delete`,
    method: "post",
    data,
  });
};

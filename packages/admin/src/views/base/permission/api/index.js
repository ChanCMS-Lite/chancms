import API from "@/config/index.js";
import http from "@/utils/http.js";

// 手动同步路由权限（扫描模块 router.js，未配置归属的接口自动归类写入）
export let syncPerm = () => {
  return http({
    url: `${API.BASE_API}/base/permission/sync`,
    method: "post",
  });
};

// ===== 接口权限归属（sys_perm_route：每个接口配置增删改查归属）=====
export let routeList = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/route/list`,
    method: "get",
    params,
  });
};

export let routeCreate = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/route/create`,
    method: "post",
    data,
  });
};

export let routeUpdate = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/route/update`,
    method: "post",
    data,
  });
};

export let routeDelete = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/route/delete`,
    method: "post",
    params,
  });
};

// 归属选择数据源：模块 → 资源 → 动作
export let permResources = () => {
  return http({
    url: `${API.BASE_API}/base/permission/permResources`,
    method: "get",
  });
};

// ===== 权限树资源维护（sys_perm_resource：角色权限树的来源）=====
export let resourceList = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/resource/list`,
    method: "get",
    params,
  });
};

export let resourceSave = (data = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/resource/save`,
    method: "post",
    data,
  });
};

export let resourceDelete = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/permission/resource/delete`,
    method: "post",
    params,
  });
};

// 菜单列表（资源挂靠菜单选择用）
export let menuList = (params = {}) => {
  return http({
    url: `${API.BASE_API}/base/menu/list`,
    method: "get",
    params,
  });
};

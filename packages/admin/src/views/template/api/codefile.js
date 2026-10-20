import http from "@/utils/http.js";
import API from "@/config/index.js";

export let getFileTree = (params) => {
  return http({
    url: `${API.BASE_API}/template/v1/file/tree`,
    method: "get",
    params
  });
};

export let getUploadFile = (params) => {
  return http({
    url: `${API.BASE_API}/template/v1/file/oss`,
    method: "get",
    params
  });
};

export let getFileContent = (opt) => {
  return http({
    url: `${API.BASE_API}/template/v1/file/content`,
    method: "get",
    params: opt,
  });
};

export let saveFileContent = (opt) => {
  return http({
    url: `${API.BASE_API}/template/v1/file/save`,
    method: "post",
    data: opt,
  });
};

export let deleteFile = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/delete`,
    method: "post",
    data
  });
};

export let extractArchive = (params) => {
  return http({
    url: `${API.BASE_API}/oss/local/extract`,
    method: "get",
    params
  });
};

export let uploadTemplateFile = (data) => {
  return http({
    url: `${API.BASE_API}/template/v1/file/upload`,
    method: "post",
    data,
  });
};

export let copyFile = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/copy`,
    method: "post",
    data,
  });
};

export let moveFile = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/move`,
    method: "post",
    data,
  });
};

export let renameFile = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/rename`,
    method: "post",
    data,
  });
};

export let createFolder = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/createFolder`,
    method: "post",
    data,
  });
};

export let compressFiles = (data) => {
  return http({
    url: `${API.BASE_API}/oss/local/compress`,
    method: "post",
    data,
  });
};

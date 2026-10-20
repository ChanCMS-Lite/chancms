import API from "../config/index.js";
import http from "../utils/http.js";

export default class Base {
  static API = API.BASE_API;

  version() {
    return "v.1.0";
  }

  // 从服务器获取数据
  static get(params = {}) {
    return http({
      url: `${Base.API}/cms/get`,
      method: "GET",
      params: params,
    });
  }

  // 向服务器新增数据
  static post(data = {}) {
    return http({
      url: `${Base.API}/cms/post`,
      method: "POST",
      data,
    });
  }
  //完整更新服务器上的数据
  static put(data = {}) {
    return http({
      url: `${Base.API}/cms/put`,
      method: "PUT",
      data,
    });
  }
  //部分更新服务器上的数据
  static patch(data = {}) {
    return http({
      url: `${Base.API}/cms/patch`,
      method: "PATCH",
      data,
    });
  }

  //删除服务器上的数据
  static delete(id) {
    return http({
      url: `${Base.API}/cms/delete?id=${id}`,
      method: "POST",
    });
  }

  // 多文件上传
  static uploadFiles = (data) => {
    return http({
      url: `${Base.API}/oss/local/files`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: data,
    });
  };
}

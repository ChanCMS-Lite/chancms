import http from "../utils/http.js";
import Base from "./Base";
import API from "../config/index.js";
export default class Login extends Base {
  constructor(props) {
    super(props);
  }

  static toLogin(data) {
    return http({
      url: `${API.BASE_API}/base/user/login`,
      method: "post",
      data: data,
    });
  }

  /**
   * 获取图形验证码
   * 后端返回 { sessionId, data: svgXml }
   * 登录时需把 sessionId + captcha 一起提交
   */
  static getCaptcha() {
    return http({
      url: `${API.BASE_API}/base/captcha`,
      method: "get",
    });
  }

  /**
   * 登录前置：单独校验图形验证码（消费式）
   * 验证码错误 → 返回 code:1006，前端据此不调用 /base/user/login，直接刷新验证码
   */
  static checkCaptcha(data) {
    return http({
      url: `${API.BASE_API}/base/verifyCaptcha`,
      method: "post",
      data: data,
    });
  }

  /**
   * 退出登录（P0-S06）：调用后端 logout 接口
   * 后端会清 HttpOnly cookie（token/perms）并把当前 token 加入黑名单
   * 路径：POST /base/user/logout
   */
  static userLogout() {
    return http({
      url: `${API.BASE_API}/base/user/logout`,
      method: "post",
    });
  }
  //改成真实的就就支持了角色权限控制
  static userInfo() {
    return http({
      url: `${API.BASE_API}/base/user/detail`,
      method: "get",
    });
  }
}

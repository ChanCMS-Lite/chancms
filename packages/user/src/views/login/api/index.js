import host from "@/config/index.js";
import http from "@/utils/http";

// 原有邮箱/密码登录相关接口（保持不变）
export const sendEmail = (params) => {
  return http({
    url: `${host.BASE_API}/member/v1/sendEmail`,
    method: "POST",
    data: params,
  });
};

export const checkEmail = params => {
  return http({
    url: `${host.BASE_API}/member/v1/checkEmail`,
    method: "POST",
    data: params,
  });
};

export const resetPass = params => {
  return http({
    url: `${host.BASE_API}/member/v1/resetPass`,
    method: "POST",
    data: params,
  });
};

export const toReg = (params) => {
  return http({
    url: `${host.BASE_API}/member/v1/register`,
    method: "POST",
    data: params,
  });
};

export const toLogin = (params) => {
  return http({
    url: `${host.BASE_API}/member/v1/login`,
    method: "POST",
    data: params,
  });
};

/**
 * 获取图形验证码（后端 SVG）
 * 返回 { sessionId, data: svgXml }
 * 登录时需把 sessionId + captcha 一起提交
 */
export const getCaptcha = () => {
  return http({
    url: `${host.BASE_API}/member/v1/captcha`,
    method: "GET",
  });
};

/**
 * 登录前置：仅校验图形验证码（不触发登录）
 * 验证码错误时返回 code:1006，前端据此不调用 /member/v1/login
 */
export const checkCaptcha = (params) => {
  return http({
    url: `${host.BASE_API}/member/v1/verifyCaptcha`,
    method: "POST",
    data: params,
  });
};

// 1. 微信内OAuth授权接口（仅微信内使用）
export const wxauth = () => {
  return http({
    url: `${host.BASE_API}/wechat/v1/auth`, // 后端OAuth授权接口（微信内专用）
    method: "GET",
    params: {},
  });
};

export const wxauthCallback = (params) => {
  return http({
    url: `${host.BASE_API}/wechat/v1/callback`, // 后端OAuth回调接口
    method: "GET",
    params,
  });
};

// 2. PC端扫码登录接口（仅PC端使用，新增独立接口，避免与OAuth混淆）
// 无需请求参数：服务端自行判定真实来源 IP，并用 httpOnly binder cookie 绑定当前浏览器
export const getScanQrCode = () => {
  return http({
    url: `${host.BASE_API}/wechat/v1/loginQrCode`, // 后端扫码二维码接口（PC专用）
    method: "GET",
  });
};

export const getScanStatus = (params) => {
  return http({
    url: `${host.BASE_API}/wechat/v1/scanStatus`, // 后端扫码状态接口
    method: "GET",
    params, // 传scanId
  });
};
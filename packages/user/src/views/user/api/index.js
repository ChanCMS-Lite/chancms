import host from "@/config/index.js";
import http from "@/utils/http";

// 获取用户信息
export const userInfo = () => {
  return http({
    url: `${host.BASE_API}/member/v1/detail`,
    method: "GET",
    params: {},
  });
};


export const updateUser = (data) => {
  return http({
    url: `${host.BASE_API}/member/v1/updateUser`,
    method: "POST",
    data,
  });
};
export const updatePass = (data) => {
  return http({
    url: `${host.BASE_API}/member/v1/updatePass`,
    method: "POST",
    data,
  });
};

// 发送邮箱验证码（修改密码场景，后端基于登录态邮箱下发；sendEmailSchema 仅接受 register | reset）
export const sendCode = (data) => {
  return http({
    url: `${host.BASE_API}/member/v1/sendEmail`,
    method: "POST",
    data,
  });
};


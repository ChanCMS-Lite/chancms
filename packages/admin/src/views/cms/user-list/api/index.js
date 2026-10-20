import http from "@/utils/http.js";
import API from "@/config/index.js";

/**
 * @description 获取会员列表
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页条数
 * @returns
 */
export let list = (page, pageSize) => {
  return http({
    url: `${API.BASE_API}/member/v1/list`,
    method: "get",
    params: {
      page,
      pageSize
    }
  });
};

/**
 * @description 搜索会员
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页条数
 * @returns
 */
export let search = (keyword, page, pageSize) => {
  return http({
    url: `${API.BASE_API}/member/v1/search`,
    method: "get",
    params: {
      keyword,
      page,
      pageSize
    }
  });
};

/**
 * @description 获取会员详情
 * @param {number} id - 会员ID
 * @returns
 */
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/member/v1/adminDetail`,
    method: "get",
    params: {
      id
    }
  });
};

/**
 * @description 更新会员状态
 * @param {object} data - { id, status }
 * @returns
 */
export let updateStatus = (data) => {
  return http({
    url: `${API.BASE_API}/member/v1/updateStatus`,
    method: "post",
    data
  });
};

/**
 * @description 后台更新会员信息
 * @param {object} data - { id, phone, remark, sex, wechat, username, nickname, email, status }
 * @returns
 */
export let updateUser = (data) => {
  return http({
    url: `${API.BASE_API}/member/v1/adminUpdateUser`,
    method: "post",
    data
  });
};

/**
 * @description 后台删除会员（支持批量，id 逗号拼接）
 * @param {string|number} id - 会员ID 或 "1,2,3"
 * @returns
 */
export let remove = (id) => {
  return http({
    url: `${API.BASE_API}/member/v1/delete`,
    method: "post",
    data: { id }
  });
};

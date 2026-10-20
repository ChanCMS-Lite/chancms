import Cookies from 'js-cookie';
import http from '@/utils/http';

/**
 * @description 退出登录：调用后端 logout 接口（token 加黑名单），清除前端登录态
 *
 * 清理项：
 * - loggedIn：前端登录态标识 cookie（HttpOnly=false）
 * - un：会员用户名 cookie（HttpOnly=false）
 * - ut：token cookie（HttpOnly=false），后端 /member/v1/logout 也会一并清除
 */
export const loginOut = async () => {
  try {
    await http.get('/member/v1/logout');
  } catch {
    // 即使接口失败也清除本地登录态
  }
  Cookies.remove('loggedIn');
  Cookies.remove('un');
  Cookies.remove('ut');
};

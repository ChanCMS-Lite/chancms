// Cookie 配置
// 说明：本项目统一使用 JWT_SECRET（见 config/jwt.js）做接口鉴权签名；
// 不启用 Cookie 签名（cookieKey=false），因此无需 TOKEN_KEY / secretcms / token 等配置。
export const cookieKey = false;

export default {
  cookieKey,
};

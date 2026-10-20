import { logger } from "chanjs";
export default () => {
  return async (req, res, next) => {
    try {
      const pathSegments = req.url.split("/").filter((item) => item !== "");

      for (let item of pathSegments) {
        if (item.length > 100) {
          logger.error(`错误请求路径: ${req.url}`);
          // 路径长度超限属客户端请求格式错误，400 Bad Request 语义更合适
          return res.status(400).send(`错误请求路径: ${req.url}`);
        }
      }

      const { content_id = "", class_id = "", page = "" } = req.query;
      if (class_id) {
        if (page) {
          res.redirect(`/list/${class_id}/index${page}.html`);
        } else {
          res.redirect(`/list/${class_id}`);
        }
        return;
      }

      if (content_id) {
        res.redirect(`/article/${content_id}.html`);
        return;
      }

      await next();
    } catch (error) {
      next(error);
    }
  };
};

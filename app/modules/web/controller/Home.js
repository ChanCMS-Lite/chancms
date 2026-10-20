import { logger } from "chanjs";
import { CACHE_KEYS, CACHE_TTL } from "../../../common/cache-keys.js";
import { homeView } from "../utils/index.js";
import WebController from "../common/base.js";

// 首页控制器
class HomeController extends WebController {
  constructor() {
    super();
    this.home = this.get("web", "Home", "service");
  }

  // 首页
  async index(req, res, next) {
    try {
      const home = await this.home;
      const { nav, template } = req.app.locals;
      const category = req.app.get("category");
      const defaultView = homeView(nav);
      const data = await this.cachedData(CACHE_KEYS.HOME, CACHE_TTL.HOME, () =>
        home.home({ categoryList: category })
      );

      await res.render(`${template}/${defaultView}`, { ...data });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
}

export default new HomeController();

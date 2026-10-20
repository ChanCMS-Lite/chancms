import fs from "node:fs";
import path from "node:path";
import { Paths } from "chanjs";
import WebController from "../common/base.js";

// SEO 静态文件控制器：robots.txt / sitemap.xml / llsm.txt（+llms.txt 别名）
class SeoController extends WebController {
    /**
     * SEO 静态文件：按当前激活模板目录优先提供（多模板各配各的，sitemap 指向各自域名），
     * 模板缺失时回退 public/ 全站通用版，都没有才 404。
     * /llms.txt 是 /llsm.txt 的别名（AI 爬虫约定俗成拼法，同源同内容）。
     */
    async seoFile(req, res, next) {
        try {
            const { template } = req.app.locals;
            const name = req.path === "/llms.txt" ? "llsm.txt" : req.path.slice(1);
            const candidates = [
                path.join(Paths.rootPath, "view", template || "default", name),
                path.join(Paths.rootPath, "public", name),
            ];
            for (const file of candidates) {
                if (fs.existsSync(file)) {
                    const type = name.endsWith(".xml")
                        ? "application/xml; charset=utf-8"
                        : "text/plain; charset=utf-8";
                    return res.type(type).send(fs.readFileSync(file, "utf8"));
                }
            }
            return next();
        } catch (error) {
            next(error);
        }
    }
}

export default new SeoController();

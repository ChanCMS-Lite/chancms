// 批量删除本地图片（供 Article/Product 硬删除后清理物理文件复用，≥2 处复用故抽取）
// 只允许删除 isAllowed 白名单目录下的文件，防路径穿越任意删文件；
// 单文件失败仅记日志不中断（DB 事务已提交，物理文件偶发残留可接受，不回滚业务结果）
import { logger } from "chanjs";
import { delImg } from "chanjs/utils/index.js";
import { isAllowed } from "../../../middleware/pathGuard.js";

export function deleteLocalImages(imagePaths) {
  for (const imgPath of imagePaths) {
    if (!imgPath || typeof imgPath !== "string") continue;
    const safePath = isAllowed(imgPath);
    if (!safePath) { logger.error("Skip unsafe image path:", imgPath); continue; }
    try { delImg(safePath); } catch (e) { logger.error("Delete image error:", imgPath, e.message); }
  }
}

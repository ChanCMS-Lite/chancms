// art-template 模板目录（站点 SSR 模板，按模板集分子目录：view/blince、view/default…）
// 前台渲染用哪个子目录由后台 sys_config 的模板配置决定，这里只是根路径注册
import path from "path";

export let views = [path.join(process.cwd(), "view")];

export default {
    views
}

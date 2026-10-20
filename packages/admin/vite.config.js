import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


import copy from "rollup-plugin-copy";
import legacy from "@vitejs/plugin-legacy";
import VueSetupExtend from "vite-plugin-vue-setup-extend"; //支持vue3的name属性
import AutoImport from "unplugin-auto-import/vite"; //按需导入
import Components from "unplugin-vue-components/vite"; //按需组件引入
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"; //按需引入
import svgLoader from 'vite-svg-loader'
import dayjs from "dayjs";

// 生成版本号
const version = dayjs().format("YYYYMMDDHHmmss");

/**
 * 给 HTML 中的 CSS / 图片 / 字体追加 ?v=<构建版本号>（缓存破坏）
 *
 * 🔴 JS 的 <script src> 绝对不能加 ?v=（2026-09-17 实测定位，勿再尝试）：
 * 产物里存在对入口的无 query 自引用，给入口加 query 后实测同时请求了
 *   ./assets/js/index.js?v=X   ← 入口
 *   ./assets/js/index.js       ← 同一个入口的无 query 版本
 * 两个 URL → 同一个模块被分裂成两份 → 入口执行两次 → 两个 Vue app 挂到同一个
 * #app → 容器 _vnode 错乱，卸载 Fragment 时 el 为 null：
 *   Routing error: TypeError: Cannot read properties of null (reading 'nextSibling')
 * 最终白屏（A/B 净室对照实验已复现并确认因果：A 白屏 / B 正常）。
 * JS 的刷新保证来自 config/static.js 对 /public 的 maxAge:0 + ETag 协商缓存。
 * legacy 入口走 data-src（由 System.import 读取），带 query 安全（仅旧浏览器执行）。
 */
const stampUrl = (url) => {
  if (!url) return url;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("#")) return url;
  if (url.includes("?v=")) return url; // 幂等：两个 hook 都会跑，避免叠两次
  return `${url}?v=${version}`;
};

const stampHtml = (html) =>
  html
    // legacy 入口的 data-src="...js"（System.import 读它，现代浏览器不执行该分支）
    .replace(/(\sdata-src=)(["'])([^"']+\.js)\2/g, (m, a, q, url) => `${a}${q}${stampUrl(url)}${q}`)
    // 样式 / 图片 / 字体
    .replace(
      /(\shref=)(["'])([^"']+\.(?:css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot))\2/g,
      (m, a, q, url) => `${a}${q}${stampUrl(url)}${q}`,
    );

const addVersion = () => ({
  name: "vite-plugin-add-version",
  apply: "build",
  enforce: "post",
  transformIndexHtml: (html) => stampHtml(html),
  generateBundle(options, bundle) {
    Object.keys(bundle).forEach((fileName) => {
      if (fileName.endsWith(".html")) {
        bundle[fileName].source = stampHtml(bundle[fileName].source.toString());
      }
    });
  },
});

// 给 CSS 中的图片 URL 添加版本号
const addVersionForCss = () => ({
  name: "vite-plugin-css-url-version",
  enforce: "post",
  generateBundle(options, bundle) {
    Object.keys(bundle).forEach((fileName) => {
      const file = bundle[fileName];
      if (fileName.endsWith(".css")) {
        let content = file.type === "asset" ? file.source.toString() : file.code;
        content = content.replace(
          /url\(["']?([^"')]+?)(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)["']?\)/g,
          `url("$1$2?v=${version}")`,
        );
        if (file.type === "asset") {
          file.source = content;
        } else {
          file.code = content;
        }
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(),
    svgLoader(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    VueSetupExtend(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    addVersionForCss(),
    addVersion(),
    copy({
      // 必须在 rollup 写盘之后再复制：默认的 buildEnd 阶段 dist 还没创建，
      // 干净构建（无 dist 目录）会报 ENOENT mkdir dist/assets
      hook: "writeBundle",
      targets: [
        // 必须 glob：目录形式会把整个 src/assets 再套一层变成 dist/assets/assets（死重）
        { src: "src/assets/**", dest: "dist/assets" },
        { src: "src/favicon.ico", dest: "dist" },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    // vite 7 默认把 less/sass 预处理放进 worker（ESM 作用域），
    // less 内部的 require 会抛 "require is not defined in ES module scope"；
    // 设为 0 = 主线程编译，规避该问题
    preprocessorMaxWorkers: 0,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 300,
    cssCodeSplit: true,
    target: ["es2015"],
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const p = id.toString();
            // pnpm 布局：node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
            // 必须取【最后一次】node_modules/ 之后的包名；
            // 旧的 split("node_modules/")[1] 会截到 ".pnpm"，产物变成 .pnpm.js 隐藏文件，
            // 被 serve-static 的 dotfiles:ignore 挡成 404 → 后台白屏。
            const name = p
              .slice(p.lastIndexOf("node_modules/") + 13)
              .split("/")[0];
            return name.startsWith(".") ? "vendor" : name;
          }
        },
        // 产物名固定不变，缓存破坏交给上面的 ?v=<构建版本号>（两处必须一致，勿单改）
        // 文件名固定 → 部署只需覆盖，不累积旧文件，因此不依赖 --clean
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        assetFileNames: `assets/[ext]/[name].[ext]`,
      }
    },
  },
  base: "./",
  lintOnSave: true,
  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      "/book": {
        target: "http://localhost:3000/book", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/book/, ""),
      },
      "/view": {
        target: "http://localhost:3000/view", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/view/, ""),
      },
      "/api": {
        target: "http://localhost:3000/api", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/base": {
        target: "http://localhost:3000/base", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/base/, ""),
      },
      "/cms": {
        target: "http://localhost:3000/cms", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms/, ""),
      },
      "/vip": {
        target: "http://localhost:3000/vip", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vip/, ""),
      },
      "/proxy": {
        target: "http://localhost:3000/proxy", // api接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ""),
      },
      "/member": {
        target: "http://localhost:3000", // 会员接口代理,
        changeOrigin: true,
      },
      "/oss": {
        target: "http://localhost:3000/oss", // OSS接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oss/, ""),
      },
      "/stat": {
        target: "http://localhost:3000/stat", // OSS接口代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stat/, ""),
      },
      "/public": {
        target: "http://localhost:3000/public", // 上传图片代理,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/public/, ""),
      },
    },
    hmr: {
      overlay: false,
    }
  },
});

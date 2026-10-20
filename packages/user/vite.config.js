import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import dayjs from 'dayjs'
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import VueSetupExtend from "vite-plugin-vue-setup-extend";

// 生成版本号
const version = dayjs().format('YYYYMMDDHHmmss')

/**
 * 给 HTML 中的 CSS/图片资源添加版本号（缓存破坏）
 * 
 * 注意：JS 资源的 src 绝对不能加 ?v= 参数！
 * 经测试验证，给 <script type="module" src="...?v=xxx"> 加 query 参数
 * 会导致 Vue 运行时抛出 "Cannot read properties of null (reading 'nextSibling')" 错误，
 * 原因是浏览器将带 query 参数的模块视为不同资源，影响模块加载时序。
 * CSS 的 href 加 query 参数则无此问题。
 */
const addVersion = () => ({
  name: 'vite-plugin-add-version',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml: (html) => {
    // 只给 CSS/图片/字体 加版本号，跳过 .js
    let processedHtml = html.replace(
      /(href)=(["'])([^"']*?)(\.css|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)\2/g,
      `$1=$2$3$4?v=${version}$2`,
    );
    // 处理 data-src 属性（legacy 插件用）
    processedHtml = processedHtml.replace(
      /data-src=(["'])([^"']*?)\.js\1/g,
      `data-src=$1$2.js?v=${version}$1`,
    );
    return processedHtml;
  },
  generateBundle(options, bundle) {
    Object.keys(bundle).forEach((fileName) => {
      if (fileName.endsWith('.html')) {
        let htmlContent = bundle[fileName].source.toString();
        htmlContent = htmlContent.replace(
          /(href)=(["'])([^"']*?)(\.css|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)\2/g,
          `$1=$2$3$4?v=${version}$2`,
        );
        htmlContent = htmlContent.replace(
          /data-src=(["'])([^"']*?)\.js\1/g,
          `data-src=$1$2.js?v=${version}$1`,
        );
        bundle[fileName].source = htmlContent;
      }
    });
  },
});

// 给 CSS 中的图片 URL 添加版本号
const addVersionForCss = () => ({
  name: 'vite-plugin-css-url-version',
  enforce: 'post',
  generateBundle(options, bundle) {
    Object.keys(bundle).forEach((fileName) => {
      const file = bundle[fileName];
      if (fileName.endsWith('.css')) {
        let content = file.type === 'asset' ? file.source.toString() : file.code;
        content = content.replace(
          /url\(["']?([^"')]+?)(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)["']?\)/g,
          `url("$1$2?v=${version}")`,
        );
        if (file.type === 'asset') {
          file.source = content;
        } else {
          file.code = content;
        }
      }
    });
  },
});


export default defineConfig(({ mode }) => {
  console.log('VITE_MODE:',mode)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      // legacy 插件已移除：
      // 1. 其生成的现代/旧版双份 chunk 与 manualChunks 冲突
      // 2. 现代浏览器已普遍支持 ES module，无需 legacy 兼容
      VueSetupExtend(),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] }),
      addVersionForCss(),
      addVersion(),
    ],
    css: {
      postcss: './postcss.config.js'
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3001,
      open: env.VITE_OPEN_BROWSER === "true",
      proxy: {
        "/member": {
          target: "http://localhost:3000/member",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/member/, ""),
        },
        "/wechat": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
        "/proxy": {
          target: "http://localhost:3000/proxy",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy/, ""),
        },
        "/upload": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/upload/, ""),
        },
        "/socket.io": {
          target: "ws://localhost:5174",
          ws: true,
        },
      },
    },
    base: "./",
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: false,
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      target: 'es2015',
      rollupOptions: {
        output: {
          /**
           * 按第三方包名分包，但将 element-plus 相关包合并到同一 chunk，
           * 避免 @element-plus/icons 等包从 element-plus 动态导入时找不到导出。
           *
           * 🔴 pnpm 布局下必须取【最后一次】node_modules/ 之后的包名：
           *    路径形如 node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
           *    旧的 split("node_modules/")[1] 会截到 ".pnpm" → 产物变成 .pnpm.js 隐藏文件，
           *    被 serve-static 的 dotfiles:ignore 挡成 404 → 会员端白屏。
           */
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              const p = id.toString();
              const packageName = p.slice(p.lastIndexOf('node_modules/') + 13).split('/')[0]
              // element-plus 相关的包合并到一个 chunk
              if (packageName && (packageName === 'element-plus' || packageName.startsWith('@element-plus'))) {
                return 'element-plus'
              }
              // 以 "." 开头（.pnpm 等）归入 vendor，避免产生隐藏文件名
              return !packageName || packageName.startsWith('.') ? 'vendor' : packageName
            }
          },
          entryFileNames: `assets/js/[name].js`,
          chunkFileNames: `assets/js/[name].js`,
          assetFileNames: `assets/[ext]/[name].[ext]`,
        },
      },
      terserOptions: {
        compress: {
          drop_console: env.VITE_DROP_CONSOLE === "true",
          drop_debugger: env.VITE_DROP_DEBUGGER === "true",
        },
        format: {
          comments: false,
        },
      },
    },
  };
});
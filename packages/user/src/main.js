import { createApp } from 'vue'
import { pinia } from './store'
import router from './router'
import App from './App.vue'
import '@/assets/css/index.css'
// 创建应用实例
const app = createApp(App)
// 加载插件
import loadPlugins from "@/plugins/index.js";
loadPlugins(app);

// 使用插件（注意顺序：先 Pinia，后 Router）
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')


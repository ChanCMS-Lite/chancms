import { createApp } from "vue";
import store from './stores/index.js';
import router from "./router";
import App from "./App.vue";

import loadDirective from '@/directives/index.js'
import loadPlugins from "@/plugins/index.js";

import "saduo/src/all.css";
import "./assets/css/main.css";
import "./assets/css/design.css";

const app = createApp(App);
loadDirective(app)
loadPlugins(app);
app.use(store);
app.use(router);
app.mount("#app");

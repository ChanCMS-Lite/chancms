<template>
  <el-config-provider :locale="locale">
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref } from "vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { ElConfigProvider } from "element-plus";
const locale = ref(zhCn);

// 🔴 2026-09-16：已移除设备指纹 `_f` 相关逻辑（App.vue 种 cookie / http.js 带 fp header）。
//    原因：后端 auth-cookie.js 自 2026-09-15 起不再绑定设备指纹，仅以 token(uid+ip) 判定登录态；
//    `_f` 在同 host 多项目下会互相踩踏，且统计系统已改用独立的 `_cvid` cookie，`_f` 无任何消费方。
</script>

<style>
/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

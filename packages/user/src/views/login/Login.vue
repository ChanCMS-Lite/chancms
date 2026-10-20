<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper">
          <img src="@/assets/logo.svg" alt="CMS Logo" class="logo-img">
        </div>
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录您的账号，开启全新体验</p>
      </div>

      <component
        :is="currentLoginComponent"
        @login-success="handleLoginSuccess"
        :redirect="redirectPath"
        v-bind="currentLoginComponent === WechatOAuthLogin ? { 'auto-trigger': isWeChatBrowser } : {}"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";

import AccountLogin from "./components/AccountLogin.vue";
import WechatOAuthLogin from "./components/WechatOAuthLogin.vue";

const router = useRouter();
const route = useRoute();

const redirectPath = ref(route.query.redirect || "/index");

const isWeChatBrowser = computed(() => {
  const ua = navigator.userAgent.toLowerCase();
  const isWeChat = /micromessenger/.test(ua);
  const isPC = /windows nt|macintosh|linux/.test(ua);
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua);
  return isWeChat && (isMobile || !isPC);
});

const currentLoginComponent = computed(() => {
  return isWeChatBrowser.value ? WechatOAuthLogin : AccountLogin;
});

/**
 * 开放重定向防护：仅允许站内相对路径（以 / 开头且不以 // 开头），其余一律回首页
 * @param {string} path - 待跳转路径
 * @returns {string} 安全的跳转路径
 */
const safeRedirect = (path) => {
  if (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) return path;
  return '/index';
};

/**
 * 登录成功处理
 *
 * 鉴权说明：
 * - 后端 chancms-vip 登录成功时通过 Set-Cookie HttpOnly 下发 ut + loggedIn + _f，
 *   响应体不再返回 token。
 * - 前端不处理 token，登录态由 loggedIn cookie（HttpOnly=false）标识，
 *   路由守卫统一读 loggedIn 判断登录态。
 * - 此处仅保留展示用的非鉴权 cookie（_i），与鉴权无关；un/avatar 不再写入 cookie，
 *   MainLayout/MemberCenter 通过 /member/v1/detail 接口实时拉取。
 */
const handleLoginSuccess = (loginData) => {
  const { ip } = loginData || {};
  if (ip) {
    Cookies.set("ip", ip);
    Cookies.remove("_i"); // 迁移清理：ip cookie 旧名为 _i
  }
  ElMessage.success("登录成功，正在跳转...");

  // 直接 replace 跳转，避免登录页进入历史栈；使用 safeRedirect 防止开放重定向
  router.replace(safeRedirect(redirectPath.value)).catch(err => {
    console.error("路由跳转失败:", err);
  });
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #eef2ff 100%);
  padding: 3rem 1rem;
 

}

@media (min-width: 640px) {
  .login-container {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .login-container {
    padding: 3rem 2rem;
  }
}

.login-card {
  width: 100%;
  max-width: 28rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 2rem;
  animation: slideIn 0.5s ease-out;
}

@media (min-width: 640px) {
  .login-card {
    padding: 2.5rem;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo-wrapper {
  width: 5rem;
  height: 5rem;
  margin-bottom: 1.5rem;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.login-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}
</style>

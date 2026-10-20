<template>
  <div class="flex flex-col items-center justify-center mt-8 space-y-4">
    <!-- 授权加载中 -->
    <div v-if="loading" class="flex items-center justify-center h-32">
      <el-icon class="animate-spin mr-2 text-primary">
        <Loading />
      </el-icon>
      <span class="text-gray-500">正在跳转微信授权...</span>
    </div>

    <!-- 授权失败 -->
    <div v-else-if="errorMsg" class="text-center text-red-500 space-y-4 mt-8">
      <p>{{ errorMsg }}</p>
      <el-button
        type="primary"
        
        @click="fetchOAuthAuth"
        :loading="loading"
      >
        重试授权
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Loading } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { wxauth, wxauthCallback } from "../api/index.js";

// 1. 接收父组件传递的 autoTrigger 参数（微信内自动触发授权）
// 注：redirect prop 当前未在组件内使用（跳转由父组件 Login.vue 统一处理），
// 保留声明是为了父组件 v-bind 透传不告警；如需本组件内跳转可读 props.redirect
const props = defineProps({
  redirect: {
    type: String,
    default: "/index"
  },
  autoTrigger: {
    type: Boolean,
    default: false
  }
});

// 对外暴露事件
const emit = defineEmits(["login-success"]);

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMsg = ref("");

onMounted(async () => {
  // 微信内自动触发场景：首次加载且 autoTrigger=true 时自动发起授权或处理回调
  if (props.autoTrigger) {
    // 使用 hash 路由的 route.query 读取回调参数（项目用 createWebHashHistory，
    // window.location.search 永远为空，已删除该无效分支）
    const code = route.query.code;
    const state = route.query.state;

    if (code && state) {
      await handleOAuthCallback(code, state);
    } else {
      await fetchOAuthAuth();
    }
  } else {
    // 非自动触发场景（如手动重试），仅当存在回调参数时处理
    const code = route.query.code;
    const state = route.query.state;
    if (code && state) {
      await handleOAuthCallback(code, state);
    }
  }
});

/**
 * 发起微信OAuth授权（原有逻辑不变）
 */
async function fetchOAuthAuth() {
  try {
    loading.value = true;
    errorMsg.value = "";

    const res = await wxauth(); // 调用后端/wechat/v1/auth接口
    if (res.code === 0 && res.data?.qr_url) {
      window.location.href = res.data.qr_url; // 跳转到微信授权页
    } else {
      errorMsg.value = res.msg || "获取授权地址失败，请重试";
    }
  } catch (e) {
    console.error("发起OAuth授权失败:", e);
    errorMsg.value = "网络异常，授权发起失败";
  } finally {
    loading.value = false;
  }
}

/**
 * 处理微信授权回调（原有逻辑不变）
 */
async function handleOAuthCallback(code, state) {
  try {
    loading.value = true;
    errorMsg.value = "";

    const res = await wxauthCallback({
      code,
      state,
      redirect: props.redirect,
    });

    if (res.code === 0) {
      // 后端回调已下发登录态 cookie（'ut'，非 HttpOnly，见 common/auth-cookie.js 统一方案），
      // 前端无需处理 token；响应体的 token 仅给小程序端用（不支持 cookie）。
      const { nickname, headimgurl, openid } = res.data || {};
      emit("login-success", { nickname, headimgurl, openid });
      clearCallbackParams();
    } else {
      errorMsg.value = res.msg || "微信授权失败，请重试";
    }
  } catch (e) {
    console.error("处理OAuth回调失败:", e);
    errorMsg.value = "网络异常，授权结果处理失败";
  } finally {
    loading.value = false;
  }
}

/**
 * 清理 URL 中的回调参数
 * 使用 router.replace 走 hash 路由清理即可，无需重复调用 window.history.replaceState
 */
function clearCallbackParams() {
  const { query, path } = route;
  const cleanedQuery = { ...query };
  delete cleanedQuery.code;
  delete cleanedQuery.state;

  router.replace({ path, query: cleanedQuery });
}
</script>
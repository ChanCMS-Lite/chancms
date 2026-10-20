<template>
  <div class="login-form-wrapper">
    <!-- 账号登录表单 -->
    <el-form
      ref="loginFormRef"
      :model="formData"
      :rules="formRules"
      class="login-form"
      @submit.prevent="handleAccountLogin"
    >
      <!-- 用户名输入框 -->
      <el-form-item prop="username" class="form-item-large">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名/手机号"
          type="text"
          prefix-icon="User"
          autocomplete="username"
          class="input-large"
          size="large"
        />
      </el-form-item>

      <!-- 密码输入框 -->
      <el-form-item prop="password" class="form-item-large">
        <el-input
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          prefix-icon="Lock"
          show-password
          autocomplete="current-password"
          class="input-large"
          size="large"
        />
      </el-form-item>

      <!-- 图形验证码：captchaSvg 由后端生成返回，已做转义，可信内容可安全 v-html -->
      <el-form-item prop="captcha" class="form-item-large">
        <div class="captcha-row">
          <el-input
            v-model="formData.captcha"
            placeholder="请输入验证码"
            prefix-icon="Key"
            maxlength="4"
            class="input-large captcha-input"
            size="large"
          />
          <div
            class="captcha-img"
            v-html="captchaSvg"
            @click="refreshCaptcha"
            title="点击刷新验证码"
          ></div>
        </div>
      </el-form-item>

      <!-- 忘记密码链接 -->
      <div class="forgot-password-wrapper">
        <router-link to="/repass" class="forgot-password-link">
          忘记密码？
        </router-link>
      </div>

      <!-- 登录按钮 -->
      <el-form-item class="form-item-large">
        <el-button
          type="primary"
          native-type="submit"
          class="login-btn"
          size="large"
          :loading="loginLoading"
        >
          账号登录
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 其他登录方式分割线 -->
    <div class="divider">
      <div class="divider-line"></div>
      <span class="divider-text">其他登录方式</span>
      <div class="divider-line"></div>
    </div>

    <!-- 扫码登录入口 -->
    <div class="wechat-login-wrapper">
      <el-button
        circle
        size="large"
        class="wechat-btn"
        @click="showScanModal = true"
        title="微信扫码登录"
      >
        <ChatDotRound class="wechat-icon" />
      </el-button>
    </div>

    <!-- 注册/去首页链接 -->
    <div class="footer-links">
      <span class="footer-text">暂不登录？</span>
      <a href="/" class="footer-link">去首页</a>
      <span class="footer-text">还没有账号？</span>
      <router-link to="/reg" class="footer-link">立即注册</router-link>
    </div>

    <!-- 扫码登录弹窗 -->
    <el-dialog
      v-model="showScanModal"
      title=""
      width="400px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :show-close="false"
      :append-to-body="true"
      :modal-class="'scan-login-modal'"
      class="scan-login-dialog"
      align-center
      @close="handleModalClose"
    >
      <WechatScanLogin
        @login-success="handleScanLoginSuccess"
        @close-modal="handleModalClose"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ChatDotRound } from "@element-plus/icons-vue";
import WechatScanLogin from "./WechatScanLogin.vue";
import { toLogin, getCaptcha, checkCaptcha } from "../api/index.js";
// 表单引用
const loginFormRef = ref(null);
// 表单数据
const formData = reactive({
  username: "",
  password: "",
  captcha: "",
});
// 验证码 SVG / sessionId
const captchaSvg = ref("");
const sessionId = ref("");
// 表单验证规则
const formRules = reactive({
  username: [
    { required: true, message: "请输入用户名/手机号", trigger: "blur" },
    { min: 2, max: 20, message: "长度需在 2-20 个字符之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于 6 个字符", trigger: "blur" },
  ],
  captcha: [
    { required: true, message: "请输入验证码", trigger: "blur" },
  ],
});

// 获取图形验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha();
    if (res.code === 0 && res.data) {
      sessionId.value = res.data.sessionId;
      captchaSvg.value = res.data.data;
    }
  } catch (e) {
    console.error("[captcha] 获取失败", e);
  }
};

onMounted(() => {
  refreshCaptcha();
});

// 状态管理
const loginLoading = ref(false);
const showScanModal = ref(false);

// 关闭扫码弹窗：设置为false，v-if会销毁组件
const handleModalClose = () => {
  showScanModal.value = false;
};

// 扫码登录成功处理：通过emit让父组件统一处理
const handleScanLoginSuccess = (loginData) => {
  // 关闭扫码弹窗
  handleModalClose();
  // 通过emit让父组件统一处理登录成功逻辑
  emit("login-success", loginData);
};

// 对外暴露事件
const emit = defineEmits(["login-success"]);

/**
 * 账号密码登录
 */
async function handleAccountLogin() {
  try {
    await loginFormRef.value.validate();
    loginLoading.value = true;

    // 登录前置：先单独校验图形验证码，错误则提示并刷新，绝不调用登录接口
    const capRes = await checkCaptcha({
      sessionId: sessionId.value,
      captcha: formData.captcha,
    });
    if (capRes.code !== 0) {
      // 拦截器已弹「验证码错误」提示；此处仅刷新验证码、清空输入并返回
      await refreshCaptcha();
      formData.captcha = "";
      loginLoading.value = false;
      return;
    }

    // fp 已由 http.js 请求拦截器统一注入 header，此处无需再传
    const params = {
      username: formData.username,
      password: formData.password,
      sessionId: sessionId.value,
      captcha: formData.captcha,
    };

    const res = await toLogin(params);
    if (res.code === 0) {
      const { username, status } = res.data;
      // status 为字符串 "1"，用字符串比较，避免 "1" !== 1 误判
      if (status !== "1") {
        ElMessage.warning("当前账号存在风险，请联系管理员审核");
        return;
      }
      // Web 端 token 通过 httpOnly cookie 自动携带，无需前端存储
      emit("login-success", { username });
    } else {
      ElMessage.error(res.msg || "登录失败");
      // 验证码一次性消费，失败后刷新
      await refreshCaptcha();
      formData.captcha = "";
    }
  } catch (error) {
    console.error("登录失败:", error);
    // interceptor 已统一弹出业务错误提示，此处仅刷新验证码
    await refreshCaptcha();
    formData.captcha = "";
  } finally {
    loginLoading.value = false;
  }
}
</script>

<style scoped>
.login-form-wrapper {
  width: 100%;
}

.login-form {
  margin-top: 1.5rem;
}

/* 大号表单项 */
.form-item-large {
  margin-bottom: 1.25rem;
}

.form-item-large :deep(.el-form-item__content) {
  line-height: 48px;
}

/* 大号输入框 */
.input-large :deep(.el-input__wrapper) {
  padding: 4px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.input-large :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
}

.input-large :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 2px 16px rgba(64, 158, 255, 0.18);
}

.input-large :deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
}

.input-large :deep(.el-input__prefix) {
  font-size: 18px;
  color: #909399;
}

/* 验证码行 */
.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  width: 120px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  transition: border-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-img:hover {
  border-color: #409eff;
}

.captcha-img :deep(svg) {
  width: 100%;
  height: 100%;
}

/* 忘记密码链接 */
.forgot-password-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.25rem;
}

.forgot-password-link {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.forgot-password-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(24, 144, 255, 0.35);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.45);
}

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  margin: 1.75rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e4e7ed, transparent);
}

.divider-text {
  padding: 0 16px;
  font-size: 13px;
  color: #8c8c8c;
}

/* 微信登录 */
.wechat-login-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.wechat-btn {
  width: 52px;
  height: 52px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
  transition: all 0.3s ease;
}

.wechat-btn:hover {
  border-color: #07c160;
  background: #f6ffed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.2);
}

.wechat-icon {
  width: 24px;
  height: 24px;
  color: #07c160;
}

/* 底部链接 */
.footer-links {
  text-align: center;
  font-size: 14px;
}

.footer-text {
  color: #8c8c8c;
}

.footer-link {
  font-weight: 600;
  color: #1890ff;
  text-decoration: none;
  margin: 0 4px;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 覆盖 Element Plus 弹窗样式 */
:global(.scan-login-dialog .el-dialog__header) {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

:global(.scan-login-dialog .el-dialog__body) {
  padding: 0 !important;
  margin: 0 !important;
}

:global(.scan-login-dialog .el-dialog) {
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 25px 70px -12px rgba(0, 0, 0, 0.35) !important;
  background: transparent !important;
}

:global(.scan-login-dialog) {
  --el-dialog-padding-primary: 0 !important;
}

/* 确保弹窗遮罩层在最高层级 */
:global(.scan-login-modal) {
  z-index: 9999 !important;
}

:global(.scan-login-modal .el-overlay) {
  z-index: 9999 !important;
}

:global(.scan-login-modal + .el-overlay) {
  z-index: 9999 !important;
}
</style>

<template>
  <div class="scan-login-wrapper">
    <!-- 顶部标题区 -->
    <div class="scan-header">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M9.5 4C5.36 4 2 6.69 2 10C2 11.89 3.08 13.56 4.78 14.66L4 17L7.14 15.86C7.87 16.08 8.66 16.21 9.5 16.21C9.69 16.21 9.87 16.2 10.05 16.18C9.87 15.46 9.78 14.71 9.78 13.93C9.78 9.7 13.22 6.26 17.45 6.26C17.62 6.26 17.79 6.27 17.96 6.29C17.33 4.89 15.56 4 13.5 4H9.5Z" fill="#ffffff"/>
          <path d="M17.45 7.26C13.67 7.26 10.78 10.15 10.78 13.93C10.78 17.71 13.67 20.6 17.45 20.6C18.21 20.6 18.94 20.47 19.62 20.24L22.5 21.26L21.78 18.66C23.28 17.62 24.12 16.14 24.12 14.5C24.12 10.63 21.09 7.26 17.45 7.26Z" fill="#ffffff"/>
        </svg>
      </div>
      <h3 class="header-title">微信扫码登录</h3>
      <p class="header-subtitle">安全便捷，一键登录</p>
    </div>

    <!-- 内容区 -->
    <div class="scan-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="content-state">
        <div class="loading-box">
          <div class="loading-spinner">
            <div class="spinner-circle"></div>
            <div class="spinner-circle"></div>
            <div class="spinner-circle"></div>
          </div>
          <p class="loading-text">正在获取二维码...</p>
        </div>
      </div>

      <!-- 二维码显示 -->
      <div v-else-if="qrUrl" class="content-state">
        <div class="qr-box">
          <div class="qr-image-wrap">
            <img :src="qrUrl" alt="微信扫码" class="qr-image" @error="handleQrImgError" @load="handleQrImgLoad" />
            <div class="qr-logo">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9.5 4C5.36 4 2 6.69 2 10C2 11.89 3.08 13.56 4.78 14.66L4 17L7.14 15.86C7.87 16.08 8.66 16.21 9.5 16.21C9.69 16.21 9.87 16.2 10.05 16.18C9.87 15.46 9.78 14.71 9.78 13.93C9.78 9.7 13.22 6.26 17.45 6.26C17.62 6.26 17.79 6.27 17.96 6.29C17.33 4.89 15.56 4 13.5 4H9.5Z" fill="#1890ff"/>
                <path d="M17.45 7.26C13.67 7.26 10.78 10.15 10.78 13.93C10.78 17.71 13.67 20.6 17.45 20.6C18.21 20.6 18.94 20.47 19.62 20.24L22.5 21.26L21.78 18.66C23.28 17.62 24.12 16.14 24.12 14.5C24.12 10.63 21.09 7.26 17.45 7.26Z" fill="#1890ff"/>
              </svg>
            </div>
          </div>
          
          <div class="qr-tips">
            <div class="tip-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span>请使用微信扫一扫</span>
            </div>
          </div>

          <!-- 倒计时 -->
          <div class="countdown-box">
            <div class="countdown-bar">
              <div class="countdown-progress" :style="{ width: (countDown / 300 * 100) + '%' }"></div>
            </div>
            <span class="countdown-time">{{ Math.floor(countDown / 60) }}:{{ String(countDown % 60).padStart(2, '0') }}</span>
          </div>

          <!-- 操作步骤 -->
          <div class="steps-box">
            <div class="step">
              <div class="step-dot">1</div>
              <span class="step-text">打开微信</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-dot">2</div>
              <span class="step-text">扫一扫</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-dot">3</div>
              <span class="step-text">关注登录</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else class="content-state">
        <div class="error-box">
          <div class="error-icon-box">
            <el-icon class="error-icon"><WarningFilled /></el-icon>
          </div>
          <h4 class="error-title">获取失败</h4>
          <p class="error-desc">{{ !isRequestInitiated ? '请求未发起' : '二维码获取失败，请检查网络后重试' }}</p>
          <button class="retry-btn" @click="fetchQrCode" :disabled="loading">
            <el-icon v-if="!loading"><RefreshRight /></el-icon>
            <span v-else class="btn-spinner"></span>
            <span>重新获取</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="scan-footer">
      <button class="footer-btn btn-cancel" @click="handleCancelLogin">
        取消登录
      </button>
      <button class="footer-btn btn-refresh" @click="fetchQrCode" :disabled="loading">
        <el-icon><Refresh /></el-icon>
        <span>刷新二维码</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { ElMessage, ElIcon } from "element-plus";
import { WarningFilled, RefreshRight, Refresh } from "@element-plus/icons-vue";
import { getScanQrCode, getScanStatus } from "../api/index.js";

const emit = defineEmits(["login-success", "close-modal"]);

const loading = ref(false);
const qrUrl = ref("");
const scanId = ref("");
const countDown = ref(300);
const isRequestInitiated = ref(false);
// timer 句柄无需响应式，用普通 let 即可
let pollTimer = null;
let countDownTimer = null;

onMounted(async () => {
  await nextTick();
  await fetchQrCode();
});

// 统一在 onBeforeUnmount 清理，避免重复注册
onBeforeUnmount(() => {
  clearAllTimers();
});

async function fetchQrCode() {
  try {
    loading.value = true;
    isRequestInitiated.value = true;
    qrUrl.value = "";
    clearAllTimers();

    // 服务端自行判定真实来源 IP（getIp(req)），前端无需传 clientIp/fp
    const res = await getScanQrCode();

    if (res && res.code === 0 && res.data) {
      const { qrImgUrl, scanId: resScanId, expireSeconds } = res.data;
      if (!qrImgUrl || !resScanId) {
        throw new Error(`二维码数据不完整`);
      }
      qrUrl.value = qrImgUrl;
      scanId.value = resScanId;
      countDown.value = expireSeconds || 300;
      startCountDown();
      startPollStatus();
    } else {
      throw new Error(`后端返回异常`);
    }
  } catch (error) {
    console.error("[扫码组件] 获取二维码失败:", error);
    ElMessage.error(`获取失败：${error.message || "网络异常"}`);
  } finally {
    loading.value = false;
  }
}

function startCountDown() {
  // 仅清理自身的倒计时定时器，避免清掉轮询定时器导致死锁
  if (countDownTimer) clearInterval(countDownTimer);
  countDownTimer = setInterval(() => {
    if (countDown.value <= 0) {
      clearInterval(countDownTimer);
      countDownTimer = null;
      ElMessage.warning("二维码已过期，正在刷新...");
      fetchQrCode();
      return;
    }
    countDown.value--;
  }, 1000);
}

function startPollStatus() {
  // 仅清理自身的轮询定时器，避免清掉倒计时定时器
  if (pollTimer) clearInterval(pollTimer);
  pollScanStatus();
  pollTimer = setInterval(pollScanStatus, 2000);
}

async function pollScanStatus() {
  if (!scanId.value) {
    clearAllTimers();
    return;
  }

  try {
    const res = await getScanStatus({
      scanId: scanId.value,
      timestamp: Date.now()
    });

    // 后端统一把扫码状态码放在 data.code 中，外层 code=0 表示请求成功
    // 状态码：SCAN_PENDING/SCAN_LOGIN_SUCCESS/SCAN_ALREADY_LOGIN/SCAN_EXPIRED/SCAN_NOT_FOUND
    switch (res?.data?.code) {
      case "SCAN_LOGIN_SUCCESS":
        handleLoginSuccess(res.data);
        break;
      case "SCAN_ALREADY_LOGIN":
        // 已登录场景：token 已通过 HttpOnly cookie 下发，直接触发登录成功
        handleLoginSuccess(res.data);
        break;
      case "SCAN_PENDING":
        break;
      case "SCAN_EXPIRED":
        clearAllTimers();
        qrUrl.value = "";
        ElMessage.warning(res.msg || "二维码已过期");
        break;
      case "SCAN_NOT_FOUND":
        clearAllTimers();
        qrUrl.value = "";
        ElMessage.error(res.msg || "扫码记录不存在");
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[扫码组件] 轮询状态失败:", error);
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    setTimeout(() => {
      if (scanId.value) startPollStatus();
    }, 3000);
  }
}

function handleLoginSuccess(data) {
  // token 已通过 HttpOnly cookie 下发（ut），前端不可读也不需要读
  // 父组件收到 login-success 后通过 userInfo 接口获取登录态
  clearAllTimers();
  emit("login-success", {
    nickname: data?.nickname || "微信用户",
    headimgurl: data?.headimgurl || "",
    openid: data?.openid || ""
  });
}

function handleCancelLogin() {
  clearAllTimers();
  emit("close-modal");
}

function handleQrImgError() {
  qrUrl.value = "";
  clearAllTimers();
  ElMessage.error("二维码图片加载失败");
}

function handleQrImgLoad() {
  // 二维码图片加载成功，无需处理
}

function clearAllTimers() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (countDownTimer) {
    clearInterval(countDownTimer);
    countDownTimer = null;
  }
}
</script>

<style scoped>
/* 外层容器 - 突破限制 */
.scan-login-wrapper {
  margin: -30px -40px -40px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  min-width: 360px;
}

/* 头部 - 经典蓝色 */
.scan-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 28px 24px;
  text-align: center;
  color: #ffffff;
}

.header-icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  backdrop-filter: blur(4px);
}

.header-icon svg {
  width: 32px;
  height: 32px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
}

/* 内容区 */
.scan-content {
  padding: 32px 24px;
  min-height: 300px;
}

.content-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 加载状态 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.loading-spinner {
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
}

.spinner-circle {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #1890ff;
  animation: spin 1s linear infinite;
}

.spinner-circle:nth-child(1) {
  width: 100%;
  height: 100%;
  animation-duration: 1s;
}

.spinner-circle:nth-child(2) {
  width: 75%;
  height: 75%;
  top: 12.5%;
  left: 12.5%;
  animation-duration: 0.8s;
  border-top-color: #40a9ff;
}

.spinner-circle:nth-child(3) {
  width: 50%;
  height: 50%;
  top: 25%;
  left: 25%;
  animation-duration: 0.6s;
  border-top-color: #69c0ff;
}

.loading-text {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* 二维码区 */
.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qr-image-wrap {
  position: relative;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 16px;
}

.qr-image {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  display: block;
  background: #ffffff;
}

.qr-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.qr-logo svg {
  width: 100%;
  height: 100%;
}

.qr-tips {
  margin-bottom: 20px;
}

.tip-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #096dd9;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
}

.tip-badge svg {
  width: 18px;
  height: 18px;
}

/* 倒计时 */
.countdown-box {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 260px;
  margin-bottom: 24px;
}

.countdown-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.countdown-progress {
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 2px;
  transition: width 1s linear;
}

.countdown-time {
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
  text-align: right;
}

/* 步骤 */
.steps-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-dot {
  width: 28px;
  height: 28px;
  background: #1890ff;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.step-text {
  font-size: 12px;
  color: #595959;
}

.step-line {
  width: 40px;
  height: 1px;
  background: #d9d9d9;
  margin: 0 8px;
  margin-bottom: 20px;
}

/* 错误状态 */
.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  text-align: center;
}

.error-icon-box {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 32px;
  color: #ff4d4f;
}

.error-title {
  font-size: 17px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.error-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0 0 24px 0;
  max-width: 240px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 28px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
}

.retry-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.45);
}

.retry-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 底部 */
.scan-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #ffffff;
  color: #595959;
  border: 1px solid #d9d9d9;
}

.btn-cancel:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.btn-refresh {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer-btn .el-icon {
  font-size: 15px;
}

/* 动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
/* 覆盖 Element Plus 弹窗样式 */
.scan-login-dialog .el-dialog__header {
  display: none;
}

.scan-login-dialog .el-dialog__body {
  padding: 0;
}

.scan-login-dialog .el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
}
</style>
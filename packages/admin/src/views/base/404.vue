<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">
        <span class="digit">4</span>
        <span class="digit">0</span>
        <span class="digit">4</span>
      </div>
      <h1 class="error-title">页面找不到了</h1>
      <p class="error-desc">您访问的页面不存在或权限不足</p>
      <div class="error-actions">
        <el-button @click="goHome" type="primary" size="large">
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </el-button>
        <el-button @click="logout" size="large">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { userStore } from '@/stores/user';

const router = useRouter();
const user = userStore();

const logout = async () => {
  ElMessage.success('退出成功，期待您的再次访问')
  // 安全策略（P0-S06）：await 确保后端清 HttpOnly cookie + token 加黑名单后再跳转
  await user.logout();
  router.replace({ path: '/login' });
};

const goHome = () => {
  router.replace({ path: '/dashboard' });
};
</script>

<style lang="less" scoped>
.not-found-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  z-index: 1;
  padding: 40px;
}

.error-code {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;

  .digit {
    font-size: 120px;
    font-weight: 700;
    color: #409eff;
    line-height: 1;
    text-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
    animation: float 3s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
      color: #67c23a;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.error-desc {
  font-size: 15px;
  color: #909399;
  margin: 0 0 32px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;

  .el-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-radius: 8px;

    .el-icon {
      font-size: 16px;
    }
  }
}

// 装饰元素
.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;

    &.circle-1 {
      width: 300px;
      height: 300px;
      background: #409eff;
      top: -100px;
      right: -100px;
    }

    &.circle-2 {
      width: 200px;
      height: 200px;
      background: #67c23a;
      bottom: -50px;
      left: -50px;
    }

    &.circle-3 {
      width: 150px;
      height: 150px;
      background: #e6a23c;
      bottom: 20%;
      right: 10%;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

<template>
  <el-button @click="toggleFullScreen" :icon="isFullScreen ? IconUnFullscreen : IconFullscreen" circle />
</template>
<script setup name="ScreenFull">
import { ref, onMounted, onUnmounted } from 'vue';
import IconFullscreen from '@/assets/icons/fullScreen.svg?component';
import IconUnFullscreen from '@/assets/icons/unFullScreen.svg?component';

// 定义是否全屏的响应式变量
const isFullScreen = ref(false);

// 切换全屏的方法
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullScreen.value = true;
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    isFullScreen.value = false;
  }
};

// 监听全屏变化事件
const handleFullScreenChange = () => {
  isFullScreen.value = Boolean(document.fullscreenElement);
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullScreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullScreenChange);
});
</script>

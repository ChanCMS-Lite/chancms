<template>
  <div
    class="layout-container w-vfull h-vfull flex overflow-h"
    :class="{ 'w-65': !sideFlag, 'w-200': sideFlag, 'no-sidebar': !setting.sidebarShow }"
  >
    <!-- 侧边栏 -->
    <div v-if="setting.sidebarShow" class="sidebar h-vfull bg-fff">
      <SideBar :isCollapse="!sideFlag" />
    </div>

    <!-- 主内容区 -->
    <div class="app-content h-vfull flex-1 bg-f6f6f6" :class="{ 'full-width': !setting.sidebarShow }">
      <TopBar v-if="setting.navbarShow" />
      <AppMain />
    </div>
  </div>

  <!-- 移动端抽屉侧边栏 -->
  <el-drawer
    v-if="setting.sidebarShow"
    v-model="drawer"
    modal-class="drawer-modal"
    :before-close="close"
    direction="ltr"
    :with-header="false"
    size="200px"
  >
    <SideBar />
  </el-drawer>
</template>

<script setup name="LayOut">
import SideBar from './SideBar/index.vue'
import TopBar from './TopBar/index.vue'
import AppMain from './Main.vue'
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

import { useSideStore } from '@/stores/side.js'
import settingStore from '@/stores/setting'

const side = useSideStore()
const setting = settingStore()
const sideFlag = computed(() => side.sideFlag)
const drawer = ref(false)

const close = () => {
  drawer.value = false
  side.toggleSide()
}

watch(sideFlag, (newVal) => {
  if (document.body.clientWidth < 768 && newVal) {
    drawer.value = true
  }
})

const handleResize = () => {
  let w = document.body.clientWidth
  if (w < 1024) {
    if (sideFlag.value) {
      side.setSide(false)
    }
  } else if (w > 1025) {
    side.setSide(true)
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.layout-container {
  background: #f6f6f6;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.app-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.full-width {
    width: 100vw;
  }
}

// 无侧边栏模式
.no-sidebar {
  .app-content {
    width: 100vw;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .app-content {
    width: 100vw;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 65px;
  }

  .app-content {
    width: calc(100vw - 65px);
  }
}

// 宽度类
.w-65 .sidebar {
  width: 65px;
}

.w-65 .app-content {
  width: calc(100vw - 65px);
}

.w-200 .sidebar {
  width: 200px;
}

.w-200 .app-content {
  width: calc(100vw - 200px);
}
</style>

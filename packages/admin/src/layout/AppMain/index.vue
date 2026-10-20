<template>
  <div class="app-main-wrapper" :class="{ 'no-navbar': !setting.navbarShow, 'no-tags': !setting.tagsViewShow }">
    <div class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta?.transition || 'router-anim'" mode="out-in" appear>
          <keep-alive :include="tagStore.cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
    <!-- <Footer v-if="setting.footerShow" /> -->
  </div>
</template>

<script setup name="AppMain">
// import Footer from '../Footer/index.vue'
import settingStore from '@/stores/setting'
import { tagViewStore } from '@/stores/tagView'

const setting = settingStore()
const tagStore = tagViewStore()
</script>

<style lang="less" scoped>
// 路由动画 - 更 subtle 的淡入淡出效果
.router-anim-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.router-anim-enter-active {
  transition: all 0.3s ease-out;
}

.router-anim-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.router-anim-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.router-anim-leave-active {
  transition: all 0.2s ease-in;
}

.router-anim-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 主内容区
.app-main-wrapper {
  height: calc(100vh - 86px);
  overflow-y: auto;
  padding: 10px;
  background: #f2f2f2;

  // 无顶部栏
  &.no-navbar {
    height: calc(100vh - 36px);

    .app-main {
      min-height: calc(100vh - 95px);
    }
  }

  // 无标签页
  &.no-tags {
    height: calc(100vh - 50px);

    .app-main {
      min-height: calc(100vh - 109px);
    }
  }

  // 都无
  &.no-navbar.no-tags {
    height: 100vh;

    .app-main {
      min-height: calc(100vh - 60px);
    }
  }
}

.app-main {
  min-height: calc(100vh - 110px);
  border-radius: 10px;
}

// 移动端适配
@media screen and (max-width: 768px) {
  .app-main-wrapper {
    height: calc(100vh - 56px);
    padding: 8px;

    &.no-navbar {
      height: calc(100vh - 36px);
    }

    &.no-tags {
      height: calc(100vh - 56px);
    }

    &.no-navbar.no-tags {
      height: 100vh;
    }
  }

  .app-main {
    min-height: calc(100vh - 115px);
    border-radius: 8px;
  }
}
</style>

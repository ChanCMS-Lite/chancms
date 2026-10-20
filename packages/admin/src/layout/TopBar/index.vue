<template>
  <div class="top-bar-wrapper">
    <!-- 顶部导航栏 -->
    <div v-if="setting.navbarShow" class="top-bar">
      <div class="top-bar-left">
        <SwitchSide v-if="setting.sidebarShow" />
        <Breadcrumb v-if="setting.breadcrumbShow" />
      </div>

      <div class="top-bar-right">
        <div class="action-btns">
          <WebSite />
          <LanguageSwitch v-if="setting.languageShow" />
          <LightDarkSwitch v-if="setting.lightShow" />
          <Notice v-if="setting.noticeShow" />
          <ScreenFull v-if="setting.screenfullShow" />
        </div>
        <LogOut />
      </div>
    </div>

    <!-- 标签页 -->
    <Tagsview v-if="setting.tagsViewShow" />
  </div>
</template>

<script setup name="TopBar">
import WebSite from './components/WebSite.vue'
import LanguageSwitch from './components/LanguageSwitch.vue'
import LightDarkSwitch from './components/LightDarkSwitch.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import LogOut from './components/LogOut.vue'
import Notice from './components/Notice.vue'
import ScreenFull from './components/ScreenFull.vue'
import Tagsview from './components/Tagsview.vue'
import SwitchSide from './components/SwitchSide.vue'
import settingStore from '@/stores/setting'

const setting = settingStore()
</script>

<style lang="less" scoped>
.top-bar-wrapper {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.top-bar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .top-bar {
    height: 56px;
    padding: 0 12px;
  }
}
</style>

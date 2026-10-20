<template>
  <div class="logo-container" :class="{ 'is-collapse': isCollapse }">
    <div class="logo-content">
      <img class="logo-icon" :src="logoSrc" alt="ChanCMS" />
      <span v-show="!isCollapse" class="logo-text">ChanCMS</span>
    </div>
  </div>
</template>

<script setup name="Logo">
import { defineProps } from 'vue'
defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})
const logoSrc = `${import.meta.env.BASE_URL}logo.svg`
</script>

<style lang="less" scoped>
.logo-container {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
box-shadow: 0 6px 20px rgba(58, 123, 247, 0.09);
  margin-bottom: 25px;
  &.is-collapse {
    .logo-content {
      padding: 0 8px;
    }
  }
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: contain;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>

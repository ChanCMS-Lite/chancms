<template>
  <div class="switch-side" @click="toggleSide">
    <el-icon class="icon" :class="{ 'is-collapse': !sideFlag }">
      <Fold v-if="sideFlag" />
      <Expand v-else />
    </el-icon>
  </div>
</template>

<script name="SwitchSide" setup>
import { computed } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'
import { useSideStore } from '@/stores/side.js'

const side = useSideStore()
const sideFlag = computed(() => side.sideFlag)

const toggleSide = () => {
  side.toggleSide()
}
</script>

<style lang="less" scoped>
.switch-side {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #606266;

  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }

  .icon {
    font-size: 18px;
    transition: transform 0.3s ease;

    &.is-collapse {
      transform: rotate(180deg);
    }
  }
}
</style>

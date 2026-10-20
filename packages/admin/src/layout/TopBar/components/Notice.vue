<template>
  <el-dropdown trigger="click">
    <el-badge :value="3">
      <el-button :icon="IconBell" circle />
    </el-badge>
    <template #dropdown>
      <el-dropdown-menu class="pd-10">
        <el-tabs class="w-240">
          <el-tab-pane label="消息">
            <el-scrollbar max-height="330px">
              <el-dropdown-item>消息</el-dropdown-item>
            </el-scrollbar>
          </el-tab-pane>
          <el-tab-pane label="通知(3)">
            <el-scrollbar max-height="330px">
              <el-dropdown-item>通知</el-dropdown-item>
            </el-scrollbar>
          </el-tab-pane>
          <el-tab-pane label="待办(4)">
            <el-scrollbar max-height="330px">
              <el-dropdown-item>待办</el-dropdown-item>
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup name="Notice">
import IconBell from '@/assets/icons/bell.svg?component'
</script>
<style lang="less" scoped>
.w-240 {
  width: 240px;
}
:deep(.el-tabs__nav-wrap) {
  padding: 0 16px;
}
</style>

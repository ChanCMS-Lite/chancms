<template>
  <div class="website-btn">
    <a href="/" target="_blank" class="link">
      <el-icon class="icon"><Link /></el-icon>
    </a>
  </div>
</template>

<script setup name="WebSite">
import { Link } from '@element-plus/icons-vue'
</script>

<style lang="less" scoped>
.website-btn {
  .link {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: #606266;
    text-decoration: none;

    &:hover {
      background: #f5f7fa;
      color: #409eff;
    }
  }

  .icon {
    font-size: 16px;
  }
}
</style>

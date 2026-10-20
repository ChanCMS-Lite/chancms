<template>
  <el-menu
    :active-text-color="activeTextColor"
    :background-color="backgroundColor"
    :text-color="textColor"
    class="el-menu-vertical-demo"
    :default-active="activeIndex"
    :unique-opened="false"
    :collapse-transition="false"
    :collapse="isCollapse"
    popper-effect="light"
    @open="handleOpen"
    @close="handleClose"
  >
    <SidebarItem v-for="item in sidebarTree" :key="item.id" :item="item" />
  </el-menu>
</template>

<script setup name="SideBarMenu">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userStore } from '@/stores/user'
import SidebarItem from './SideBarItem.vue'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
  activeTextColor: {
    type: String,
    default: '#409EFF',
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  textColor: {
    type: String,
    default: '#303133',
  },
})

const route = useRoute()
const user = userStore()
const activeIndex = ref('')

// 侧边栏用后端树渲染层级
const sidebarTree = computed(() => user.sidebarTree)

// 当前路由对应的高亮菜单项：
// 1) 编辑/详情类页面用 meta.activeMenu 指向其列表页（如 /category/add -> /category）
// 2) 其余直接用完整 route.path 精确匹配菜单项 index
//    —— 修复 /stat/dashboard 被旧 filterPath 截断成 /stat 导致侧边栏不高亮、父级不展开的问题
const resolveActive = () => {
  return route.meta.activeMenu || route.path
}

watch(
  () => route.path,
  () => {
    activeIndex.value = resolveActive()
  },
  { immediate: true }
)

// 侧边栏树是异步从后端拉取的，拉取完成后重算一次，
// 确保直接访问（刷新进入）某页时菜单也能正确展开 / 高亮
watch(
  () => user.sidebarTree.length,
  (len) => {
    if (len > 0) activeIndex.value = resolveActive()
  }
)

onMounted(() => {
  // 安全策略（P0-S06）：登录态由 isAuthenticated 判断
  if (user.isAuthenticated && user.sidebarTree.length === 0) {
    user.getMenuList().catch(() => {})
  }
})

const handleOpen = () => {}
const handleClose = () => {}
</script>

<style scoped>
.el-menu {
  border-right: 0px;
}

:deep(.el-sub-menu__icon-arrow) {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

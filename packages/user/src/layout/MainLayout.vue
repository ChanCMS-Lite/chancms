<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 - 移动端适配 -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
      <div class="mx-auto px-4 h-full flex items-center justify-between">
          <!-- Logo区域 -->
          <div class="flex items-center">
            <a href="/" class="flex items-center">
              <img src="@/assets/logo.svg" class="h-8 w-auto mr-2" alt="CMS Logo">
              <span class="text-xl font-semibold text-gray-800">ChanCMS</span>
            </a>
            <!-- 移动端汉堡菜单按钮 --> 
            <el-button 
              class="md:hidden" v-show="isMobile"
              @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              text
              
            >
              <el-icon :size="20"><Menu /></el-icon>
            </el-button>
          </div>
      
          <!-- 用户菜单 -->
          <div class="flex items-center">
            <!-- 返回首页 -->
            <a href="/" class="flex items-center mr-5">
              <span class="ml-1 mr-1 text-gray-700 hover:text-blue-700">首页</span>
            </a>
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="flex items-center cursor-pointer">
                <img v-if="avatar" class="h-8 w-8 rounded-full" :src="avatar" alt="用户头像">
                <span class="ml-2 mr-1 text-gray-700">{{ username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人资料
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>安全设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="pt-16 flex">
      <!-- 侧边栏 - 移动端适配 -->
      <aside 
        class="fixed left-0 top-16 bottom-0 bg-white shadow-sm transition-all duration-300 ease-in-out z-40"
        :class="{
          'w-40': !isSidebarCollapsed && !isMobile,
          'w-20': isSidebarCollapsed && !isMobile,
          '-translate-x-full': isMobile && !isMobileSidebarOpen,
          'w-64': isMobile && isMobileSidebarOpen,
          'translate-x-0': isMobile && isMobileSidebarOpen
        }"
      >
        <el-menu
          :default-active="activeMenu"
          class="h-full border-0"
          :collapse="isSidebarCollapsed && !isMobile"
          @select="handleSelect"
        >
          <el-menu-item index="/index">
            <el-icon><User /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Lock /></el-icon>
            <template #title>安全设置</template>
          </el-menu-item>
          <el-menu-item index="/fav">
            <el-icon><Star /></el-icon>
            <template #title>我的收藏</template>
          </el-menu-item>
          <el-menu-item index="/comment">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>我的评论</template>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 内容区域 - 移动端适配 -->
      <main
        class="flex-1 p-4 transition-all duration-300 ease-in-out overflow-hidden min-w-0"
        :class="{
          'ml-40': !isSidebarCollapsed && !isMobile,
          'ml-20': isSidebarCollapsed && !isMobile,
          'ml-0': isMobile
        }"
        @click="isMobile && (isMobileSidebarOpen = false)"
      >
        <!-- 移动端侧边栏遮罩 -->
        <div
          v-if="isMobile && isMobileSidebarOpen"
          class="fixed inset-0 bg-black bg-opacity-50 z-30"
          @click="isMobileSidebarOpen = false"
        ></div>

        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  User, Setting, Lock, Star, ChatDotRound,
      SwitchButton, CaretBottom, Menu 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { loginOut } from '@/utils/cookie.js'
import http from '@/utils/http'
import { useContentStore } from '@/store/content.js'
const route = useRoute()
const router = useRouter()

// 响应式判断是否为移动端
const isMobile = ref(false)
const checkIsMobile = () => {
  // 调整断点为更常见的768px
  isMobile.value = window.innerWidth < 768
  // 在移动端时强制展开侧边栏状态为false
  if (isMobile.value) {
    isMobileSidebarOpen.value = false
  }
}

const username = ref('')
const avatar = ref('')

// 用户信息缓存（store）：MemberCenter 等页面复用，避免重复请求 /member/v1/detail
const contentStore = useContentStore()

// 侧边栏状态
const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)
const activeMenu = computed(() => route.path)

// 处理用户菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/index')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理菜单选择
const handleSelect = (index) => {
  router.push(index)
  if (isMobile.value) {
    isMobileSidebarOpen.value = false
  }
}

// 处理退出登录
const handleLogout = async () => {
  // await 确保后端 logout 完成（清 ut HttpOnly cookie），避免跳转登录页后旧会话仍有效
  await loginOut();
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 监听窗口大小变化
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  // 从会员详情接口获取用户名和头像（不再从 cookie 读，ut 为 httpOnly 不可读）
  try {
    const res = await http.get('/member/v1/detail')
    if (res.code === 0 && res.data) {
      username.value = res.data.nickname || res.data.username || '用户'
      avatar.value = res.data.avatar || ''
      contentStore.setUserInfo(res.data)
    }
  } catch {
    // 获取失败使用默认值
  }
})


onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped>
/* 修复侧边栏滚动问题 */
.el-menu {
  overflow-y: auto;
}

/* 修复移动端点击区域问题 */
@media (max-width: 767px) {
  main {
    min-height: calc(100vh - 4rem);
  }
}
</style>

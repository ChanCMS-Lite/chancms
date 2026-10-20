<template>
  <div class="logout-dropdown">
    <el-dropdown trigger="click" placement="bottom-end">
      <div class="avatar-btn">
        <el-icon class="icon"><User /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="logout-menu">
          <el-dropdown-item @click="goToWebsite">
            <el-icon><HomeFilled /></el-icon>
            <span>官网首页</span>
          </el-dropdown-item>
          <el-dropdown-item v-if="setting.persionCenter" @click="goToProfile">
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="logout" class="logout-item">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup name="LogOut">
import { User, HomeFilled, UserFilled, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { userStore } from '@/stores/user'
import settingStore from '@/stores/setting'

const user = userStore()
const setting = settingStore()
const router = useRouter()

const goToWebsite = () => {
  window.open('https://www.chancms.top', '_blank')
}

const goToProfile = () => {
  // 个人中心 = 用户详情页的「看自己」形态（/user/detail/:id，走 sys_role_menu 授权）。
  // 拿不到自己 id 时退到用户管理列表，避免跳到参数为空的坏地址。
  const uid = user.userInfo?.id
  router.push(uid ? `/user/detail/${uid}` : '/user')
}

const logout = async () => {
  ElMessage.success('退出成功，期待您的再次访问')
  // 安全策略（P0-S06）：await 确保后端清 HttpOnly cookie + token 加黑名单后再跳转
  await user.logout()

  // 🔴 2026-09-17：改为 SPA 内跳转，不再 window.location.reload()。
  //    早先之所以要整页重载，是因为「只改 hash 不会重载文档」——
  //    内存里上一账号的 Pinia 状态与已注册动态路由会原样残留。
  //    但这些清理在 user.logout() 里已经做全了：
  //      - $reset() 复位 Pinia（isAuthenticated / userInfo / menuList / perms）
  //      - 删除 appInfo / n / pos / perms 四个 cookie
  //      - resetDynamicRoutes() 回收动态路由并复位 _routesAdded
  //    所以不必重载整个文档。整页重载的代价是白屏一下，
  //    并且重走一次冷启动会话探测（verifySession）。
  //    守卫侧安全性：/login 在白名单内直接放行，且 isAuthenticated 已被 $reset()
  //    复位为 false，不会命中「已登录还去登录页 → 弹回 /dashboard」的分支。
  //    用 replace（而非 push）避免历史记录里留下已登出的后台页面。
  router.replace('/login')
}
</script>

<style lang="less" scoped>
.logout-dropdown {
  .avatar-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: #606266;
    cursor: pointer;

    &:hover {
      background: #f5f7fa;
      color: #409eff;
    }
  }

  .icon {
    font-size: 18px;
  }
}

.logout-menu {
  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 13px;

    .el-icon {
      font-size: 14px;
    }

    &:hover {
      color: #409eff;
    }

    &.logout-item {
      color: #f56c6c;

      &:hover {
        color: #f56c6c;
        background: #fef0f0;
      }
    }
  }
}
</style>

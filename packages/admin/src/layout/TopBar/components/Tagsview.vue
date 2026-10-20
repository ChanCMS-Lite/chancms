<template>
  <div class="tag-views" ref="tagViewsContainer">
    <!-- 左箭头 -->
    <div
      class="nav-arrow left"
      :class="{ 'is-disabled': !showLeftArrow }"
      @click="scrollLeft"
    >
      <el-icon><ArrowLeft /></el-icon>
    </div>

    <!-- 标签页容器 -->
    <div class="tabs-wrapper" ref="tabsWrapper">
      <el-tabs
        v-model="activeTab"
        type="card"
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
        class="custom-tabs"
        ref="tabsRef"
      >
        <el-tab-pane
          v-for="item in tagStore.visitedViews"
          :key="item.fullPath"
          :name="item.fullPath"
          :closable="!item.fixed"
        >
          <template #label>
            <div
              class="tab-label"
              :class="{ 'is-fixed': item.fixed }"
              @contextmenu.prevent="showContextMenu(item, $event)"
            >
              <el-icon v-if="item.fixed" class="fixed-icon">
                <HomeFilled />
              </el-icon>
              <span class="title">{{ item.title }}</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右箭头 -->
    <div
      class="nav-arrow right"
      :class="{ 'is-disabled': !showRightArrow }"
      @click="scrollRight"
    >
      <el-icon><ArrowRight /></el-icon>
    </div>

    <!-- 右键菜单 -->
    <transition name="fade">
      <div
        v-show="menuVisible"
        ref="contextMenu"
        :style="menuStyle"
        class="context-menu"
        @click.stop
      >
        <ul class="menu-list">
          <li class="menu-item" @click="refreshPage">
            <el-icon><Refresh /></el-icon>
            <span>刷新页面</span>
          </li>
          <li class="menu-item" @click="closeLeft(currentItem)">
            <el-icon><ArrowLeft /></el-icon>
            <span>关闭左侧</span>
          </li>
          <li class="menu-item" @click="closeRight(currentItem)">
            <el-icon><ArrowRight /></el-icon>
            <span>关闭右侧</span>
          </li>
          <li class="menu-item" @click="closeOthers(currentItem)">
            <el-icon><Minus /></el-icon>
            <span>关闭其他</span>
          </li>
          <li class="menu-item danger" @click="closeAll">
            <el-icon><Close /></el-icon>
            <span>全部关闭</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script name="Tagsview" setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Refresh,
  ArrowLeft,
  ArrowRight,
  Close,
  HomeFilled,
  Minus,
} from '@element-plus/icons-vue'
import { tagViewStore } from '@/stores/tagView'

const router = useRouter()
const currentRoute = useRoute()
const tagStore = tagViewStore()

// 当前激活的标签
const activeTab = computed({
  get: () => currentRoute.fullPath,
  set: (newPath) => {
    router.push(newPath)
  },
})

// 添加标签
const addTag = (route) => {
  const routePattern = route.matched[route.matched.length - 1]?.path || route.path

  let title = route.meta?.title || route.name || '未命名'
  if (title.includes('新增/修改')) {
    const hasId = route.params.id || route.query.id
    title = hasId ? title.replace('新增/修改', '修改') : title.replace('新增/修改', '新增')
  }

  tagStore.addView({
    name: route.name,
    path: route.path,
    fullPath: route.fullPath,
    routePattern,
    title,
    meta: route.meta || {},
    fixed: route.meta?.fixed || route.fullPath === '/dashboard',
  })
}

// 处理标签点击
const handleTabClick = (tabPane) => {
  const path = tabPane.paneName
  if (path !== currentRoute.fullPath) {
    router.push(path)
  }
}

// 处理标签移除
const handleTabRemove = (targetName) => {
  // 删除前先记录当前列表和索引
  const view = tagStore.visitedViews.find(v => v.fullPath === targetName)
  if (!view || view.fixed) return

  const isActive = targetName === currentRoute.fullPath
  const idx = tagStore.visitedViews.findIndex(v => v.fullPath === targetName)

  // 删除标签
  tagStore.delView(view)

  // 如果关闭的是当前激活标签，跳转到相邻标签
  if (isActive) {
    // delView 已删除当前标签，剩余列表中取相邻位置
    const remaining = tagStore.visitedViews
    const nextTag = remaining[idx - 1] || remaining[idx] || remaining[idx + 1]
    if (nextTag) {
      router.push(nextTag.fullPath)
    } else {
      // 没有剩余标签，跳转首页
      router.push('/dashboard')
    }
  }
}

// 刷新当前页面（无闪烁方式）
const refreshPage = () => {
  const view = tagStore.visitedViews.find(v => v.fullPath === currentRoute.fullPath)
  if (!view) return

  // 先移除缓存
  tagStore.delCachedView(view)
  // 通过 redirect 重新创建组件
  router.replace({ path: '/redirect', query: { path: currentRoute.fullPath } })
  hideContextMenu()
}

// 关闭左侧标签
const closeLeft = (view) => {
  if (!view) return

  const idx = tagStore.visitedViews.findIndex(v => v.fullPath === view.fullPath)
  if (idx <= 0) return

  const currentIsInLeft = tagStore.visitedViews
    .slice(0, idx)
    .some(v => v.fullPath === currentRoute.fullPath)

  tagStore.delLeftViews(view)

  if (currentIsInLeft) {
    router.push(view.fullPath)
  }
  hideContextMenu()
}

// 关闭右侧标签
const closeRight = (view) => {
  if (!view) return

  const idx = tagStore.visitedViews.findIndex(v => v.fullPath === view.fullPath)
  if (idx === -1 || idx >= tagStore.visitedViews.length - 1) return

  const currentIsInRight = tagStore.visitedViews
    .slice(idx + 1)
    .some(v => v.fullPath === currentRoute.fullPath)

  tagStore.delRightViews(view)

  if (currentIsInRight) {
    router.push(view.fullPath)
  }
  hideContextMenu()
}

// 关闭其他标签
const closeOthers = (view) => {
  if (!view) return

  tagStore.delOthersViews(view)

  if (currentRoute.fullPath !== view.fullPath) {
    router.push(view.fullPath)
  }
  hideContextMenu()
}

// 关闭全部（保留固定标签）
const closeAll = () => {
  tagStore.delAllViews()

  const fixedTags = tagStore.visitedViews.filter(v => v.fixed)
  if (fixedTags.length > 0 && currentRoute.fullPath !== fixedTags[0].fullPath) {
    router.push(fixedTags[0].fullPath)
  }
  hideContextMenu()
}

// 右键菜单相关
const currentItem = ref(null)
const contextMenu = ref(null)
const tagViewsContainer = ref(null)
const menuVisible = ref(false)
const menuStyle = ref({
  left: '0px',
  top: '0px',
})

// 显示右键菜单
const showContextMenu = (item, event) => {
  if (item.fixed) return

  currentItem.value = item
  menuVisible.value = true

  const targetElement = event.currentTarget
  const targetRect = targetElement.getBoundingClientRect()
  const containerRect = tagViewsContainer.value.getBoundingClientRect()

  const x = targetRect.left - containerRect.left - 10
  const y = targetRect.bottom - containerRect.top + 4

  menuStyle.value = {
    left: `${x}px`,
    top: `${y}px`,
  }

  nextTick(() => {
    if (contextMenu.value) {
      const menuRect = contextMenu.value.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedLeft = parseInt(menuStyle.value.left)
      let adjustedTop = parseInt(menuStyle.value.top)

      if (targetRect.left + menuRect.width > viewportWidth) {
        adjustedLeft = viewportWidth - menuRect.width - 8
      }
      if (adjustedLeft < 0) {
        adjustedLeft = 8
      }
      if (targetRect.bottom + menuRect.height > viewportHeight) {
        adjustedTop = targetRect.top - containerRect.top - menuRect.height - 4
      }

      menuStyle.value = {
        left: `${adjustedLeft}px`,
        top: `${adjustedTop}px`,
      }
    }
  })
}

// 隐藏右键菜单
const hideContextMenu = () => {
  menuVisible.value = false
  currentItem.value = null
}

// 监听路由变化
watch(
  () => currentRoute.fullPath,
  () => {
    addTag(currentRoute)
    nextTick(() => {
      scrollToActiveTab()
    })
  },
  { immediate: true }
)

// 箭头导航相关
const tabsWrapper = ref(null)
const tabsRef = ref(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)

const updateArrowVisibility = () => {
  const wrapper = tabsWrapper.value
  if (!wrapper) return

  const { scrollLeft, scrollWidth, clientWidth } = wrapper
  showLeftArrow.value = scrollLeft > 0
  showRightArrow.value = scrollLeft + clientWidth < scrollWidth - 1
}

const scrollLeft = () => {
  const wrapper = tabsWrapper.value
  if (!wrapper) return
  wrapper.scrollBy({ left: -200, behavior: 'smooth' })
}

const scrollRight = () => {
  const wrapper = tabsWrapper.value
  if (!wrapper) return
  wrapper.scrollBy({ left: 200, behavior: 'smooth' })
}

const scrollToActiveTab = () => {
  nextTick(() => {
    const wrapper = tabsWrapper.value
    const tabsEl = tabsRef.value?.$el
    if (!wrapper || !tabsEl) return

    const activeTabEl = tabsEl.querySelector('.el-tabs__item.is-active')
    if (activeTabEl) {
      const wrapperRect = wrapper.getBoundingClientRect()
      const tabRect = activeTabEl.getBoundingClientRect()

      const scrollLeftVal = tabRect.left - wrapperRect.left + wrapper.scrollLeft - wrapperRect.width / 2 + tabRect.width / 2
      wrapper.scrollTo({ left: scrollLeftVal, behavior: 'smooth' })
    }

    updateArrowVisibility()
  })
}

const handleResize = () => {
  nextTick(() => {
    updateArrowVisibility()
  })
}

onMounted(() => {
  // 初始化：刷新后重建缓存数组
  tagStore.initTags()

  window.addEventListener('resize', handleResize)
  document.addEventListener('click', hideContextMenu)
  document.addEventListener('scroll', hideContextMenu, true)

  const tabsWrapperEl = tabsWrapper.value
  if (tabsWrapperEl) {
    tabsWrapperEl.addEventListener('scroll', updateArrowVisibility)
  }

  setTimeout(() => {
    updateArrowVisibility()
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', hideContextMenu)
  document.removeEventListener('scroll', hideContextMenu, true)
  const tabsWrapperEl = tabsWrapper.value
  if (tabsWrapperEl) {
    tabsWrapperEl.removeEventListener('scroll', updateArrowVisibility)
  }
})

watch(() => tagStore.visitedViews.length, () => {
  nextTick(() => {
    updateArrowVisibility()
  })
}, { immediate: true })
</script>

<style lang="less" scoped>
.tag-views {
  position: relative;
  height: 40px;
  background: #fff;
  /* 🔴 2026-09-17：**本条 `border-bottom` 就是页签栏底下那条线**，已按要求去掉。
     之前几次改的都是 el-tabs **内部**的边框（见下方 .el-tabs__header / .el-tabs__item 的
     border: none），那是 Element Plus card 型 tab 自带的，跟这条**容器自身的边**是两回事，
     所以怎么改都还能看到线。
     去掉后靠「白色页签栏 vs 灰色内容区(#f3f3f3)」的底色差区分层次，不需要分隔线。 */
  display: flex;
  align-items: center;
  padding: 0;

  @media (max-width: 768px) {
    display: none;
  }
}

.nav-arrow {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  background: #fff;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 10;
  flex-shrink: 0;

  &:hover {
    color: #409eff;
    background: #f5f7fa;
  }

  &.left {
    margin-left: 8px;
  }

  &.right {
    margin-right: 8px;
  }

  .el-icon {
    font-size: 14px;
  }
}

.tabs-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.custom-tabs {
  width: fit-content;
  min-width: 100%;

  :deep(.el-tabs__header) {
    margin: 0;
    border: none !important;
  }

  :deep(.el-tabs__nav) {
    border: none !important;
    background: transparent;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }

  :deep(.el-tabs__item) {
    height: 32px;
    line-height: 32px;
    padding: 0 12px !important;
    margin: 0 4px;
    border: none !important;
    border-radius: 4px;
    background: #f5f7fa;
    color: #303133;
    font-size: 13px;
    transition: background-color 0.2s, color 0.2s;
    flex-shrink: 0;
    position: relative;

    &:first-child {
      margin-left: 8px;
    }

    &:last-child {
      margin-right: 8px;
    }

    &:hover {
      background: #e4e7ed;
      color: #409eff;
    }

    &.is-active {
      background: #409eff;
      color: #fff;

      .tab-label {
        color: #fff;
      }
    }

    .is-icon-close {
      width: 14px;
      height: 14px;
      margin-left: 6px;
      border-radius: 50%;
      transition: all 0.2s;
      opacity: 1;
      visibility: visible;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
        transform-origin: center center;
      }
    }
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0;
  }

  :deep(.el-tabs__nav-scroll) {
    padding: 0;
    display: flex;
    align-items: center;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  .fixed-icon {
    font-size: 12px;
    opacity: 0.8;
  }

  .title {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.is-fixed {
    font-weight: 500;
  }
}

.context-menu {
  position: absolute;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 1px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  overflow: hidden;

  .menu-list {
    list-style: none;
    margin: 0;
    padding: 6px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f7fa;
      color: #409eff;
    }

    &.danger {
      color: #f56c6c;

      &:hover {
        background: #fef0f0;
        color: #f56c6c;
      }
    }

    .el-icon {
      font-size: 14px;
    }

    span {
      flex: 1;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

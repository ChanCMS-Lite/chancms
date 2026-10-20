import { defineStore } from 'pinia'

/**
 * TagView 状态管理
 * - visitedViews: 标签页列表，持久化到 localStorage
 * - cachedViews: keep-alive include 数组，不持久化（刷新后根据 visitedViews 重新计算）
 */
export const tagViewStore = defineStore('tagView', {
  state: () => ({
    visitedViews: [],
    cachedViews: [],
  }),

  actions: {
    // 初始化：刷新后重建 cachedViews
    initTags() {
      this.updateCachedViews()
    },

    // 添加标签
    addView(view) {
      // view = { name, path, fullPath, title, meta, routePattern }
      if (this.visitedViews.some(v => v.fullPath === view.fullPath)) {
        // 已存在则更新标题
        const idx = this.visitedViews.findIndex(v => v.fullPath === view.fullPath)
        if (idx > -1) {
          this.visitedViews[idx] = { ...this.visitedViews[idx], ...view }
        }
        return
      }

      // 同类页面（如编辑页切换不同 id），更新该标签而不是新增
      if (view.routePattern) {
        const existingByPattern = this.visitedViews.findIndex(
          v => v.routePattern === view.routePattern
        )
        if (existingByPattern >= 0) {
          this.visitedViews[existingByPattern] = { ...view, fixed: view.fixed || false }
          this.updateCachedViews()
          return
        }
      }

      // 新页面，添加标签
      this.visitedViews.push({ ...view, fixed: view.fixed || false })
      this.updateCachedViews()
    },

    // 关闭单个标签
    delView(view) {
      this.visitedViews = this.visitedViews.filter(v => v.fullPath !== view.fullPath)
      this.updateCachedViews()
      return Promise.resolve({ visitedViews: [...this.visitedViews] })
    },

    // 关闭左侧标签
    delLeftViews(view) {
      const idx = this.visitedViews.findIndex(v => v.fullPath === view.fullPath)
      if (idx <= 0) return Promise.resolve()

      this.visitedViews = [
        ...this.visitedViews.slice(0, idx).filter(v => v.fixed),
        ...this.visitedViews.slice(idx),
      ]
      this.updateCachedViews()
      return Promise.resolve({ visitedViews: [...this.visitedViews] })
    },

    // 关闭右侧标签
    delRightViews(view) {
      const idx = this.visitedViews.findIndex(v => v.fullPath === view.fullPath)
      if (idx === -1 || idx >= this.visitedViews.length - 1) return Promise.resolve()

      this.visitedViews = [
        ...this.visitedViews.slice(0, idx + 1),
        ...this.visitedViews.slice(idx + 1).filter(v => v.fixed),
      ]
      this.updateCachedViews()
      return Promise.resolve({ visitedViews: [...this.visitedViews] })
    },

    // 关闭其他标签
    delOthersViews(view) {
      this.visitedViews = this.visitedViews.filter(
        v => v.fixed || v.fullPath === view.fullPath
      )
      this.updateCachedViews()
      return Promise.resolve({ visitedViews: [...this.visitedViews] })
    },

    // 关闭全部标签（保留固定标签）
    delAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.fixed)
      this.updateCachedViews()
      return Promise.resolve({ visitedViews: [...this.visitedViews] })
    },

    // 更新 keep-alive include 数组
    updateCachedViews() {
      this.cachedViews = this.visitedViews
        .filter(v => {
          // meta.noCache 为 true 时不缓存
          const noCache = v.meta?.noCache === true
          // 必须有 name 才能缓存
          return !noCache && v.name
        })
        .map(v => v.name)
    },

    // 临时移除缓存（用于刷新）
    delCachedView(view) {
      const idx = this.cachedViews.indexOf(view.name)
      if (idx > -1) this.cachedViews.splice(idx, 1)
    },
  },

  // 持久化标签列表，刷新后恢复
  persist: {
    key: 'tagViews',
    storage: localStorage,
    paths: ['visitedViews'],
  },
})
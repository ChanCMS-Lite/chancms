<template>
  <div class="comments-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">我的评论</h2>
        <span class="comment-count" v-if="totalItems > 0">{{ totalItems }} 条</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索评论"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
        <el-select
          v-model="sortBy"
          placeholder="排序"
          @change="handleSort"
          class="sort-select"
        >
          <el-option label="最新" value="newest" />
          <el-option label="最早" value="oldest" />
        </el-select>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-content" v-loading="loading">
      <!-- 批量操作工具栏 -->
      <div class="batch-toolbar" v-if="selectedIds.length > 0">
        <el-button
          type="primary"
          @click="handleBatchDelete"
          :loading="batchDeleting"
        >
          <el-icon><Delete /></el-icon>
          删除 {{ selectedIds.length }} 条
        </el-button>
      </div>
      <el-table
        ref="tableRef"
        :data="commentsList"
        style="width: 100%"
        max-height="calc(100vh - 240px)"
        @selection-change="handleSelectionChange"
        row-key="id"
        :border="false"
      >
        <el-table-column type="selection" width="40" />
        
        <el-table-column label="评论内容" min-width="280">
          <template #default="{ row }">
            <div class="comment-cell">
              <span v-if="row.reply_to_username" class="reply-to">回复 @{{ row.reply_to_username }}：</span>
              <span class="comment-text">{{ row.content }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="文章" min-width="140">
          <template #default="{ row }">
            <el-link
              type="primary"
              :href="getArticleUrl(row)"
              target="_blank"
              :underline="'never'"
            >
              {{ row.articleTitle }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="100">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="点赞" width="90" align="center">
          <template #default="{ row }">
            <el-button
              :type="isLiked(row.id) ? 'primary' : 'default'"
              :class="['like-btn', { 'is-liked': isLiked(row.id) }]"
              size="small"
              :loading="likingId === row.id"
              :disabled="isLiked(row.id) || likingId === row.id"
              @click="handleLikeComment(row)"
            >
              <el-icon v-if="likingId !== row.id"><Star /></el-icon>
              <span class="like-count-num">{{ row.likeCount || 0 }}</span>
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="plain" >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="handleDeleteComment(row.id)"
              :loading="deletingId === row.id"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <el-icon class="empty-icon"><ChatDotRound /></el-icon>
            <div class="empty-text">暂无评论</div>
            <el-button type="primary" @click="goToArticle">去评论</el-button>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="totalItems > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalItems"
          :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next'"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ChatDotRound, Star, Delete } from '@element-plus/icons-vue'
import { useContentStore } from '../store'

const contentStore = useContentStore()

// 响应式判断是否为移动端
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 状态
const loading = ref(false)
const deletingId = ref(null)
const batchDeleting = ref(false)
const likingId = ref(null)
const likedIds = ref(new Set())
const searchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const comments = ref([])
const selectedIds = ref([])
const tableRef = ref(null)

// 计算属性
const commentsList = computed(() => {
  let list = [...comments.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item =>
      item.content.toLowerCase().includes(query) ||
      item.articleTitle?.toLowerCase().includes(query)
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'newest':
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
  }

  return list
})

// 监听搜索和排序变化，重置分页（搜索/排序由计算属性本地处理，无需重新请求后端）
watch([searchQuery, sortBy], () => {
  currentPage.value = 1
  selectedIds.value = []
})

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  loadComments()
})

// 组件卸载时移除 resize 监听，避免内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 加载评论列表
async function loadComments() {
  try {
    loading.value = true
    const result = await contentStore.getComments(currentPage.value, pageSize.value)
    comments.value = result.items || []
    totalItems.value = result.total || 0
    selectedIds.value = []
    // 初始化已点赞状态（基于后端返回的 isLiked 字段）
    const likedSet = new Set()
    comments.value.forEach(item => {
      if (item.isLiked) likedSet.add(item.id)
    })
    likedIds.value = likedSet
  } catch (error) {
    console.error('加载评论列表失败:', error)
    ElMessage.error('加载评论列表失败')
  } finally {
    loading.value = false
  }
}

// 判断评论是否已点赞
function isLiked(id) {
  return likedIds.value.has(id)
}

// 点赞评论
async function handleLikeComment(row) {
  // 防重复点击：已点赞或正在点赞中则直接返回
  if (isLiked(row.id) || likingId.value === row.id) return

  try {
    likingId.value = row.id
    await contentStore.likeComment(row.id)

    // 更新本地状态：标记为已点赞，点赞数 +1
    likedIds.value.add(row.id)
    row.likeCount = (row.likeCount || 0) + 1

    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    const errorMsg = error.code === 401 ? '登录已过期，请重新登录' : (error.message || '点赞失败')
    ElMessage.error(errorMsg)
  } finally {
    likingId.value = null
  }
}

// 处理搜索
function handleSearch() {
  // 搜索逻辑已在计算属性中实现
}

// 处理排序
function handleSort() {
  // 排序逻辑已在计算属性中实现
}

// 处理分页大小变化
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadComments()
}

// 处理页码变化
function handlePageChange(page) {
  currentPage.value = page
  loadComments()
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除评论
async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的评论')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 条评论？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    batchDeleting.value = true

    // 逐个删除选中的评论
    for (const id of selectedIds.value) {
      await contentStore.removeComment(id)
    }

    // 重新加载评论列表
    await loadComments()

    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除评论失败:', error)
      const errorMsg = error.code === 401 ? '登录已过期，请重新登录' : (error.message || '批量删除失败')
      ElMessage.error(errorMsg)
    }
  } finally {
    batchDeleting.value = false
  }
}

// 删除评论
async function handleDeleteComment(id) {
  try {
    await ElMessageBox.confirm(
      '确定删除这条评论？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deletingId.value = id
    await contentStore.removeComment(id)
    
    // 重新加载评论列表
    await loadComments()

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      const errorMsg = error.code === 401 ? '登录已过期，请重新登录' : (error.message || '删除失败')
      ElMessage.error(errorMsg)
    }
  } finally {
    deletingId.value = null
  }
}

// 获取文章链接（articlePath 为栏目 slug，无前导斜杠）
function getArticleUrl(item) {
  return item.articlePath
    ? `/${item.articlePath}/article-${item.articleId}.html`
    : `/article-${item.articleId}.html`
}

// 跳转到文章页面（文章在官网前台，非本用户中心应用）
function goToArticle() {
  const officialUrl = import.meta.env.VITE_OFFICIAL_URL || '/'
  window.open(officialUrl, '_blank')
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 获取状态类型
function getStatusType(status) {
  switch (status) {
    case '1':
      return 'warning'
    case '2':
      return 'success'
    case '3':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case '1':
      return '待审核'
    case '2':
      return '已通过'
    case '3':
      return '已拒绝'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.comments-container {

  min-height: 100%;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.comment-count {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 10px;
  border-radius: 10px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.sort-select {
  width: 100px;
}

/* 批量操作工具栏 */
.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 内容区 */
.comments-content {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 评论单元格 */
.comment-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-to {
  color: #409eff;
  font-weight: 500;
  flex-shrink: 0;
}

.comment-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-text {
  font-size: 13px;
  color: #606266;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f7ba2a;
  font-size: 13px;
}

.like-icon {
  font-size: 14px;
}

/* 点赞按钮 */
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.like-btn.is-liked,
.like-btn.is-liked:hover {
  background-color: #f7ba2a;
  border-color: #f7ba2a;
  color: #fff;
}

.like-btn.is-liked {
  cursor: not-allowed;
  opacity: 0.85;
}

.like-btn:not(.is-liked):hover {
  color: #f7ba2a;
  border-color: #f7ba2a;
}

.like-count-num {
  font-size: 12px;
  line-height: 1;
}

/* 空状态 */
.empty-state {
  padding: 60px 0;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 16px;
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .comments-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>

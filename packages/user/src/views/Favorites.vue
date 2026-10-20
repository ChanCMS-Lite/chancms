<template>
  <div class="favorites-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">我的收藏</h2>
        <span class="fav-count" v-if="totalItems > 0">{{ totalItems }} 条</span>
      </div>
      <div class="header-right">
        <el-select
          v-model="typeFilter"
          placeholder="全部分类"
          clearable
          @change="handleFilterChange"
          class="filter-select"
        >
          <el-option label="全部" value="" />
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-select
          v-model="categoryFilter"
          placeholder="全部栏目"
          clearable
          @change="handleFilterChange"
          class="filter-select"
        >
          <el-option label="全部" value="" />
          <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索收藏"
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

    
    <!-- 收藏列表 -->
    <div class="favorites-content" v-loading="loading">
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
        :data="favoritesList"
        style="width: 100%"
        max-height="calc(100vh - 240px)"
        @selection-change="handleSelectionChange"
        row-key="id"
        :border="false"
      >
        <el-table-column type="selection" width="40" />
        
        <el-table-column label="标题" min-width="300">
          <template #default="{ row }">
            <div class="title-cell">
              <el-link
                type="primary"
                :href="row.url"
                target="_blank"
                :underline="'never'"
              >
                {{ row.title }}
              </el-link>
              <div class="tag-row">
                <el-tag size="small" type="info" effect="plain">{{ typeLabel(row.type) }}</el-tag>
                <el-tag v-if="row.categoryName" size="small" type="warning" effect="plain">{{ row.categoryName }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="摘要" min-width="200">
          <template #default="{ row }">
            <span class="summary-text" :title="row.summary">{{ row.summary || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="收藏时间" width="120">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.favoriteTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="handleRemoveFavorite(row.id)"
              :loading="removingId === row.id"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <el-icon class="empty-icon"><Star /></el-icon>
            <div class="empty-text">暂无收藏</div>
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
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Star, Delete } from '@element-plus/icons-vue'
import { useContentStore } from '../store'

const contentStore = useContentStore()

// 响应式判断是否为移动端
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 状态
const loading = ref(false)
const removingId = ref(null)
const batchDeleting = ref(false)
const searchQuery = ref('')
const sortBy = ref('newest')
const typeFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const favorites = ref([])
const selectedIds = ref([])
const tableRef = ref(null)

// 分类(内容类型)选项
const typeOptions = [
  { value: 'article', label: '文章' },
  { value: 'picture', label: '图集' },
  { value: 'video', label: '视频' },
  { value: 'book', label: '书籍' },
  { value: 'special', label: '专题' },
  { value: 'product', label: '产品' },
  { value: 'doc', label: '文档' },
  { value: 'down', label: '下载' },
]

// 栏目选项（从收藏列表中聚合，随加载不断并集补充）
const categoryMap = ref(new Map())
const categoryOptions = computed(() =>
  [...categoryMap.value.values()].sort((a, b) => a.id - b.id)
)

function typeLabel(type) {
  return typeOptions.find(t => t.value === type)?.label || (type || '未知')
}

function mergeCategories(list) {
  list.forEach(item => {
    if (item.categoryId && item.categoryName) {
      categoryMap.value.set(item.categoryId, { id: item.categoryId, name: item.categoryName })
    }
  })
  // 触发 computed 更新
  categoryMap.value = new Map(categoryMap.value)
}

// 计算属性
const favoritesList = computed(() => {
  let list = [...favorites.value]

  // 排序（搜索已走后端 keyword 过滤，本地不再二次过滤，避免与后端 total 不一致）
  switch (sortBy.value) {
    case 'newest':
      list.sort((a, b) => new Date(b.favoriteTime) - new Date(a.favoriteTime))
      break
    case 'oldest':
      list.sort((a, b) => new Date(a.favoriteTime) - new Date(b.favoriteTime))
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
  loadFavorites()
})

// 组件卸载时移除 resize 监听，避免内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 处理分类/栏目筛选变化（需重新请求后端）
function handleFilterChange() {
  currentPage.value = 1
  selectedIds.value = []
  loadFavorites()
}

// 加载收藏列表
async function loadFavorites() {
  try {
    loading.value = true
    const result = await contentStore.getFavorites(currentPage.value, pageSize.value, {
      type: typeFilter.value,
      categoryId: categoryFilter.value,
      keyword: searchQuery.value
    })
    favorites.value = result.items || []
    mergeCategories(result.items || [])
    totalItems.value = result.total || 0
    selectedIds.value = []
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索（防抖 300ms，避免每敲一个字符就发一次后端请求）
let searchTimer = null
function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    selectedIds.value = []
    loadFavorites()
  }, 300)
}

// 处理排序
function handleSort() {
  // 排序逻辑已在计算属性中实现
}

// 处理分页大小变化
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadFavorites()
}

// 处理页码变化
function handleCurrentChange(page) {
  currentPage.value = page
  loadFavorites()
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 取消收藏
async function handleRemoveFavorite(id) {
  try {
    await ElMessageBox.confirm(
      '确定取消收藏这篇文章？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    removingId.value = id
    await contentStore.removeFavorite(id)
    favorites.value = favorites.value.filter(item => item.id !== id)
    totalItems.value--

    ElMessage.success('已取消收藏')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  } finally {
    removingId.value = null
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的收藏')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 条收藏？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchDeleting.value = true
    for (const id of selectedIds.value) {
      await contentStore.removeFavorite(id)
    }

    favorites.value = favorites.value.filter(item => !selectedIds.value.includes(item.id))
    totalItems.value -= selectedIds.value.length
    selectedIds.value = []
    tableRef.value?.clearSelection()

    ElMessage.success('批量删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    batchDeleting.value = false
  }
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
</script>

<style scoped>
.favorites-container {
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

.fav-count {
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

.filter-select {
  width: 120px;
}

.sort-select {
  width: 100px;
}

/* 标题单元格与标签 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 批量操作工具栏 */
.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

/* 内容区 */
.favorites-content {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 摘要文字 */
.summary-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

/* 时间文字 */
.time-text {
  font-size: 13px;
  color: #606266;
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
  .favorites-container {
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

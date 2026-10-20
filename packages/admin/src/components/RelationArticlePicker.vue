<template>
  <div class="relation-picker">
    <el-row :gutter="12">
      <!-- 左栏：已选文章 -->
      <el-col :span="12">
        <div class="picker-panel">
          <div class="panel-title">
            <span>已选文章</span>
            <span class="count-badge">{{ selected.length }}/{{ maxCount }}</span>
          </div>
          <div v-if="selected.length === 0" class="empty-tip">暂无关联文章，请从右侧添加</div>
          <div v-else class="list-wrap">
            <div
              v-for="(item, idx) in selected"
              :key="item.article_id"
              class="list-item"
            >
              <span class="item-index">{{ idx + 1 }}</span>
              <div class="item-main">
                <span class="item-title" :title="item.title">{{ item.title }}</span>
                <span v-if="item.category_name" class="item-cat">{{ item.category_name }}</span>
              </div>
              <el-input-number
                v-model="item.sort"
                :min="0"
                :controls="false"

                class="sort-input"
                @change="emitUpdate"
              />
              <div class="item-actions">
                <el-button
                  :icon="Top"
                  circle

                  :disabled="idx === 0"
                  @click="moveUp(idx)"
                />
                <el-button
                  :icon="Bottom"
                  circle

                  :disabled="idx === selected.length - 1"
                  @click="moveDown(idx)"
                />
                <el-button
                  :icon="Delete"
                  circle

                  @click="removeItem(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右栏：搜索 + 栏目筛选 -->
      <el-col :span="12">
        <div class="picker-panel">
          <div class="panel-title">添加文章</div>

          <!-- 栏目筛选：支持除单页(type=1)外的所有分类 -->
          <el-select
            v-model="filterCategory"
            placeholder="按栏目筛选"
            clearable
            filterable
            class="mb-10 picker-cat-select"
            @change="doSearch"
          >
            <el-option label="全部栏目" :value="0" />
            <el-option
              v-for="c in categoryOptions"
              :key="c.id"
              :label="c.name"
              :value="c.id"
              :disabled="c.disabled"
            />
          </el-select>

          <el-input
            v-model="keyword"
            placeholder="搜索文章标题"
            :suffix-icon="Search"
            clearable
            class="mb-10"
            @keyup.enter="doSearch"
            @clear="doSearch"
          />

          <div v-loading="loading" class="list-wrap">
            <div v-if="resultList.length === 0 && !loading" class="empty-tip">暂无数据</div>
            <div v-for="row in resultList" :key="row.id" class="list-item">
              <div class="item-main">
                <span class="item-title" :title="row.title">{{ row.title }}</span>
                <span v-if="row.name" class="item-cat">{{ row.name }}</span>
              </div>
              <el-button
                type="primary"

                round
                :disabled="hasSelected(row.id) || selected.length >= maxCount"
                @click="addItem(row)"
              >
                {{ hasSelected(row.id) ? '已添加' : '添加' }}
              </el-button>
            </div>
          </div>

          <div class="mt-10 flex justify-center">
            <el-pagination
              background
              layout="prev, pager, next"
              :current-page="page"
              :page-size="pageSize"
              :total="total"
              small
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Delete, Top, Bottom } from '@element-plus/icons-vue'
import { search } from '@/api/article.js'
import { find } from '@/api/category.js'
import { DOMAIN, markForeignDisabled } from '@/constants/contentTypes.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  relationConfig: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

// 已选文章本地副本
const selected = ref((props.modelValue || []).map((item) => ({ ...item })))

// 同步外部变更到内部
watch(
  () => props.modelValue,
  (val) => {
    selected.value = (val || []).map((item) => ({ ...item }))
  }
)

// 通知外部更新
const emitUpdate = () => {
  emit(
    'update:modelValue',
    selected.value.map((item) => ({ ...item }))
  )
}

const maxCount = computed(() => Number(props.relationConfig?.relationMaxCount) || 5)

// 是否已选
const hasSelected = (articleId) => {
  return selected.value.some((item) => Number(item.article_id) === Number(articleId))
}

// 添加文章
const addItem = (row) => {
  if (hasSelected(row.id)) return
  if (selected.value.length >= maxCount.value) {
    ElMessage.warning(`最多关联 ${maxCount.value} 篇`)
    return
  }
  selected.value.push({
    article_id: row.id,
    title: row.title,
    category_id: row.cid,
    category_name: row.name,
    sort: selected.value.length,
  })
  emitUpdate()
}

// 移除
const removeItem = (idx) => {
  selected.value.splice(idx, 1)
  emitUpdate()
}

// 上移
const moveUp = (idx) => {
  if (idx === 0) return
  const arr = selected.value
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  emitUpdate()
}

// 下移
const moveDown = (idx) => {
  const arr = selected.value
  if (idx === arr.length - 1) return
  ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
  emitUpdate()
}

// 右栏搜索
const keyword = ref('')
const filterCategory = ref(0)
const categoryOptions = ref([])
const resultList = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

const doSearch = () => {
  page.value = 1
  fetchResults()
}

const fetchResults = async () => {
  loading.value = true
  try {
    // 命中具体栏目时按 cid 精确过滤；选「全部栏目」时按文章类域过滤，排除单页/专题等
    const params = {
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    }
    if (filterCategory.value && filterCategory.value > 0) {
      params.cid = filterCategory.value
    } else {
      params.content_type = DOMAIN.relation
    }
    const res = await search(params)
    if (res.code === 0) {
      resultList.value = [...(res.data.list || [])]
      total.value = Number(res.data.total || 0)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p) => {
  page.value = p
  fetchResults()
}

// 加载栏目（完整展示，目录型 is_dir=1 disabled 不可选）
const loadCategories = async () => {
  try {
    // 取全量栏目树，非文章类域的节点标 disabled（不删减，保证结构完整可回显）
    const res = await find()
    if (res.code === 0) {
      const list = markForeignDisabled(res.data, DOMAIN.relation)
      // 注意：必须保留 markForeignDisabled 打的 disabled，否则跨域节点会被下面这行「洗白」
      categoryOptions.value = list.map((c) => ({
        ...c,
        disabled: !!c.disabled || Number(c.is_dir) === 1,
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadCategories()
  fetchResults()
})
</script>

<style scoped>
.relation-picker {
  width: 100%;
}
.picker-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 14px;
  min-height: 380px;
}
.panel-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}
.count-badge {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #475569;
  border-radius: 10px;
  text-align: center;
}
.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
.list-wrap {
  max-height: 300px;
  overflow-y: auto;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  border-bottom: 1px dashed #f1f5f9;
}
.list-item:hover {
  background: #f8fafc;
}
.item-index {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  margin-right: 8px;
  font-size: 12px;
  color: #475569;
  background: #f1f5f9;
  border-radius: 4px;
  text-align: center;
  flex-shrink: 0;
}
.item-main {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
}
.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #334155;
}
.item-cat {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
.picker-cat-select {
  width: 100%;
}
.sort-input {
  width: 60px;
}
.sort-input :deep(.el-input__inner) {
  text-align: center;
}
.item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>

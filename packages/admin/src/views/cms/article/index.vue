<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="栏目筛选" prop="categorySelected">
              <el-cascader
                v-model="params.categorySelected"
                :options="category"
                :props="{ value: 'value', label: 'label', children: 'children', disabled: 'disabled', checkStrictly: true }"
                placeholder="全部栏目"
                clearable
                filterable
                :show-all-levels="false"
                style="width: 100%"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="文章ID" prop="id">
              <el-input
                placeholder="请输入文章ID"
                v-model="params.id"
                clearable
                style="width: 100%"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标题" prop="keywords">
              <el-input
                placeholder="请输入文章标题"
                :suffix-icon="Search"
                v-model="params.keywords"
                clearable
                @clear="clearSearch"
                style="width: 100%"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="btn-group">
              <template #label>&nbsp;</template>
              <el-button type="primary" :icon="Search" @click="doSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="clearSearch('formRef')">清空</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="radius-6 bg-fff pd-20">
      <div class="flex justify-between align-c">
        <el-popconfirm
          confirm-button-text="确定"
          cancel-button-text="取消"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="此操作将永久删除, 是否继续?"
          @confirm="delSome"
          @cancel="cancelEvent"
        >
          <template #reference>
            <el-button v-permission="['cms:article:delete']" >删除</el-button>
          </template>
        </el-popconfirm>
        <router-link class="mt-10" to="/article/add">
          <el-button size="large" type="primary" round>新增</el-button>
        </router-link>
      </div>

      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          prop="id"
          label="编号"
          width="80"
          fixed
        ></el-table-column>
        <el-table-column prop="title" label="标题">
          <template #default="scope">
            <a
              class="block"
              v-if="scope.row.status === 0"
              :href="
                scope.row.type == '0'
                  ? `${domain}/article-${scope.row.id}.html`
                  : `${domain}${scope.row.path}/page-${scope.row.id}.html`
              "
              target="_blank"
            >
              {{ scope.row.title }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="栏目" width="180"></el-table-column>
        <el-table-column
          prop="created_at"
          label="更新时间"
          width="170"
        ></el-table-column>
        <el-table-column prop="status" label="状态" width="60">
          <template #default="scope">{{
            scope.row.status == 0 ? '显示' : '隐藏'
          }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button
              :icon="View"
              circle
              @click="handleClick(scope.row)"
            ></el-button>
            <el-button
              :icon="Edit"
              circle
              @click="toEdit(scope.row)"
            ></el-button>
            <el-button
              :icon="Delete" v-permission="['cms:article:delete']"
              circle
              @click="handleDel(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="mt-20 bg-fff pd-20 radius-6 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="count"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Delete, Edit, View, Search, InfoFilled, Refresh } from '@element-plus/icons-vue'
import { search, del } from '@/api/article.js'
import { find } from '@/api/category.js'
import { DOMAIN, markForeignDisabled } from '@/constants/contentTypes.js'
import { addLabelValue, tree } from '@/utils/tool.js'

const router = useRouter()
const route = useRoute()

const domain = ref(location.origin)
const formRef = ref(null)
const multipleTableRef = ref(null)
const loading = ref(true)
const tableData = ref([])
const multipleSelection = ref([])
const count = ref(0)
const page = ref(1)
const pageSize = ref(20)
const cid = ref(0)
const category = ref([])

const params = reactive({
  id: '',
  keywords: '',
  categorySelected: [],
})

// 清空搜索
const clearSearch = str => {
  if (str) {
    formRef.value.resetFields()
  }
  page.value = 1
  params.id = ''
  params.keywords = ''
  cid.value = 0
  searchArticles()
}

// 执行搜索
const doSearch = () => {
  page.value = 1 // 搜索时重置页码为1
  searchArticles()
}

// 查询文章
const searchArticles = async () => {
  try {
    loading.value = true
    const res = await search({
      page: page.value,
      keyword: params.keywords,
      cid: cid.value,
      pageSize: pageSize.value,
      id: params.id || undefined,
      // 文章管理仅显示文章类域（article/image/video）；单页/专题/商品归各自模块
      content_type: DOMAIN.article,
    })
    if (res.code === 0) {
      tableData.value = [...res.data.list]
      count.value = Number(res.data.total || 0)
      page.value = res.data.current
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 翻页
const handlePageChange = (newPage) => {
  page.value = newPage
  searchArticles()
}

// 切换每页条数
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  searchArticles()
}

// 处理选中变化
const handleSelectionChange = val => {
  multipleSelection.value = val
}

// 查询分类
const queryCategory = async () => {
  try {
    // 取全量栏目树，非本模块域的节点标 disabled（不删减，保证结构完整可回显）
    const res = await find()
    if (res.code === 0) {
      const rows = markForeignDisabled(res.data || [], DOMAIN.article)
      const childIds = new Set(rows.map(r => r.pid))
      // 完整栏目树全部展示（单页栏目下也可能有文章列表子栏目）。
      // 仅禁用「无子栏目的空目录型节点」(is_dir=1 且为叶子)；
      // 有子栏目的目录型父节点必须保留可展开，否则其下的文章栏目
      // (如 服务支持→资料下载) 在 cascader 里点不出来、无法选择。
      const data = rows.map(d => {
        if (Number(d.is_dir) === 1 && !childIds.has(d.id)) d.disabled = true
        return d
      })
      const dataTree = addLabelValue(tree(data))
      category.value = [...dataTree]
    }
  } catch (error) {
    console.error(error)
  }
}

// 选择栏目
const handleChange = e => {
  if (e && e.length > 0) {
    cid.value = e[e.length - 1]
  } else {
    cid.value = 0
  }
}

// 跳转到编辑
const toEdit = e => {
  router.push({ name: 'article-edit', params: { id: e.id } })
}

// 取消事件
const cancelEvent = () => {}

// 删除所选项
const delSome = async () => {
  const ids = multipleSelection.value.map(item => item.id).join(',')
  try {
    const res = await del(ids)
    if (res.code === 0) {
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      })
      searchArticles()
    }
  } catch (error) {
    console.error(error)
  }
}

// 查看详情
const handleClick = e => {
  const url =
    e.type == '0'
      ? `${domain.value}${e.path}/article-${e.id}.html`
      : `${domain.value}${e.path}/page-${e.id}.html`
  window.open(url)
}

// 删除文章
const handleDel = e => {

  ElMessageBox.confirm('此操作将永久删除, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await del(e.id)
        if (res.code === 0) {
          ElMessage({
            message: '文章删除成功 ^_^',
            type: 'success',
          })
          searchArticles()
        }
      } catch (error) {
        console.error(error)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

// 根据 cid 从分类树中查找完整路径
const findCategoryPath = (options, targetId) => {
  for (const option of options) {
    if (option.value === Number(targetId)) {
      return [option.value]
    }
    if (option.children && option.children.length > 0) {
      const childPath = findCategoryPath(option.children, targetId)
      if (childPath) {
        return [option.value, ...childPath]
      }
    }
  }
  return null
}

// 初始化查询参数
watch(
  () => route.query,
  newQuery => {
    page.value = newQuery.page || 1
    cid.value = newQuery.cid ? Number(newQuery.cid) : 0
    params.keywords = newQuery.keywords || ''
    // 根据 cid 还原级联选择器的选中值
    if (cid.value && category.value.length > 0) {
      const path = findCategoryPath(category.value, cid.value)
      if (path) {
        params.categorySelected = path
      } else {
        params.categorySelected = []
      }
    } else {
      params.categorySelected = []
    }
    searchArticles()
  },
  { immediate: true },
)

onMounted(() => {
  queryCategory()
})

// 分类数据加载后，如果已有 cid 需要还原级联选择器值
watch(category, (newCategory) => {
  if (newCategory.length > 0 && cid.value) {
    const path = findCategoryPath(newCategory, cid.value)
    if (path) {
      params.categorySelected = path
    }
  }
})
</script>

<style scoped>
:deep(a) {
  color: #1f1f1f;
}

:deep(a:hover) {
  color: #165dff;
}
.search-form :deep(.el-form-item) {
  width: 100%;
}
.search-form :deep(.el-form-item.btn-group) {
  width: auto;
}
.search-form :deep(.el-form-item.btn-group .el-form-item__content) {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
}
</style>

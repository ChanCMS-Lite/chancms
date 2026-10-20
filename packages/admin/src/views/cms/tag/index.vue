<template>
  <div>
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="分类" prop="cid">
              <el-cascader
                filterable
                :props="categoryProps"
                :show-all-levels="false"
                v-model="categorySelected"
                :options="categoryOptions"
                placeholder="全部分类"
                clearable
                @change="handleCategoryChange"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标题" prop="keywords">
              <el-input
                placeholder="请输入内容"
                :suffix-icon="Search"
                clearable
                @clear="clearSearch"
                v-model="params.keywords"
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

    <div class="bg-fff radius-6 pd-20">
      <div class="flex justify-end align-c">
        <router-link to="/tag/add">
          <el-button size="large" type="primary" round>新增</el-button>
        </router-link>
      </div>
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="id" label="编号"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="path" label="标识"></el-table-column>
        <el-table-column label="所属分类">
          <template #default="{ row }">
            {{ getCategoryName(row.cid) }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="100" label="操作">
          <template #default="scope">
            <el-button
              :icon="Edit"
              circle
              @click="navigateToEdit(scope.row)"
            ></el-button>
            <el-button
              :icon="Delete" v-permission="['cms:tag:delete']"
              circle
              @click="deleteTag(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-20 bg-fff pd-20 radius-6 flex justify-center">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="cur"
          @current-change="handlePageChange"
          :page-size="pageSize"
          :total="count"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'
import { search, del } from '@/api/tag.js'
import { find } from '@/api/category.js'
import { DOMAIN, markForeignDisabled } from '@/constants/contentTypes.js'
import { addLabelValue, tree, treeById } from '@/utils/tool.js'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const multipleTableRef = ref(null)

const params = reactive({
  keywords: '',
  cid: 0
})

const categorySelected = ref([])
const categoryOptions = ref([])
const categoryFlatData = ref([])
const categoryProps = { checkStrictly: true }

const tableData = ref([])
const multipleSelection = ref([])
const count = ref(0)
const cur = ref(1)
const pageSize = ref(20)

// 获取分类名称
const getCategoryName = (cid) => {
  if (!cid) return '全局'
  const found = categoryFlatData.value.find(item => item.id === cid)
  return found ? found.name : '-'
}

// 获取分类列表
const fetchCategory = async () => {
  try {
    // 取全量栏目树，非文章类域的节点标 disabled（不删减，保证结构完整可回显）
    const res = await find()
    if (res.code === 0) {
      categoryFlatData.value = markForeignDisabled(res.data || [], DOMAIN.tag)
      categoryOptions.value = addLabelValue(tree(categoryFlatData.value))
    }
  } catch (error) {
    console.error(error)
  }
}

// 分类选择变化
const handleCategoryChange = (e) => {
  params.cid = e && e.length > 0 ? e[e.length - 1] : 0
}

// 初始化加载数据
onMounted(() => {
  const { cur: current = 1, keywords = '', cid = 0 } = route.query
  cur.value = parseInt(current, 10)
  params.keywords = keywords
  params.cid = parseInt(cid, 10) || 0
  fetchCategory()
  fetchData()
})

// 监听路由变化（从其他页面返回时恢复状态）
watch(route, (to) => {
  if (to.name === 'tag-index') {
    const { cur: current = 1, keywords = '', cid = 0 } = to.query
    const newCid = parseInt(cid, 10) || 0
    cur.value = parseInt(current, 10)
    params.keywords = keywords
    params.cid = newCid
    // 恢复级联选择器选中状态
    if (newCid && categoryFlatData.value.length) {
      categorySelected.value = treeById(newCid, categoryFlatData.value)
    } else {
      categorySelected.value = []
    }
    fetchData()
  }
})

// 清空搜索
const clearSearch = (str) => {
  if (str) {
    formRef.value.resetFields()
  }
  params.cid = 0
  params.keywords = ''
  categorySelected.value = []
  cur.value = 1
  fetchData()
}

// 查询
const fetchData = async () => {
  try {
    const res = await search(cur.value, params.keywords, pageSize.value, params.cid)
    if (res.code === 0) {
      tableData.value = [...res.data.list];
      count.value = Number(res.data.total || 0);
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.error(error)
  }
}

// 搜索
const doSearch = () => {
  cur.value = 1
  fetchData()
}

// 分页切换
const handlePageChange = (page) => {
  cur.value = page
  fetchData()
}

// 选择改变
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 编辑跳转
const navigateToEdit = (row) => {
  const id = row.id
  router.push({ name: 'tag-edit', params: { id } })
}

// 删除
const deleteTag = async (row) => {
  const id = row.id
  try {
    const res = await del(id)
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success'
      })
      fetchData()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
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

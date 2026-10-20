<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="标题" prop="keywords">
              <el-input placeholder="请输入内容" :suffix-icon="Search" clearable @clear="doSearch"
                v-model="params.keywords" style="width: 100%"></el-input>
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

    <div class="bg-fff pd-20 radius-6">
      <div class="flex justify-end mb-10">
        <router-link class="mt-10" to="/frag/add">
          <el-button size="large" type="primary" round>新增</el-button>
        </router-link>
      </div>
      <el-table ref="multipleTableRef" :data="tableData" tooltip-effect="dark" row-key="id"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="id" width="60" label="编号"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="mark" label="标识"></el-table-column>
        <el-table-column label="归属" width="120">
          <template #default="scope">
            <el-tag v-if="!scope.row.cid" type="info" size="small">全局</el-tag>
            <el-tag v-else size="small">{{ categoryName(scope.row.cid) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间">
          <template #default="scope">{{ scope.row.updated_at }}</template>
        </el-table-column>
        <el-table-column fixed="right" width="120" label="操作">
          <template #default="scope">
            <el-button :icon="Edit" circle
              @click="toEdit(scope.row)"></el-button>
            <div class="inline-b ml-5">
              <el-popconfirm width="220" @confirm="handleDel(scope.row)" confirm-button-text="确定"
                cancel-button-text="取消" icon-color="#626AEF" title="确定删除吗？如果在使用，删掉会模板会报错">
                <template #reference>
                  <el-button :icon="Delete" v-permission="['cms:frag:delete']" circle></el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'
import { search, del } from '@/api/frag.js'
import { find } from '@/api/category.js'

const router = useRouter()
const formRef = ref(null)
const multipleTableRef = ref(null)

const params = reactive({
  keywords: ''
})

const tableData = ref([])
const multipleSelection = ref([])
const count = ref(0)
const cur = ref(1)
const pageSize = ref(20)

// 清空搜索
const clearSearch = (str) => {
  if (str) {
    formRef.value.resetFields()
  }
  doSearch()
}

// 查询
const doSearch = async () => {
  try {
    const res = await search(cur.value, params.keywords)
    if (res.code === 0) {
      const { list, total } = res.data
      tableData.value = list
      count.value = Number(total)
    }
  } catch (error) {
    console.log(error)
  }
}

// 翻页
const handlePageChange = (page) => {
  cur.value = page;
  doSearch();
}

// 选择改变
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 编辑跳转
const toEdit = (row) => {
  const id = row.id
  router.push({ name: 'frag-edit', params: { id } })
}

// 删除
const handleDel = async (row) => {
  const id = row.id
  try {
    const res = await del(id)
    if (res.code === 0) {
      ElMessage({
        message: '文章删除成功 ^_^',
        type: 'success'
      })
      doSearch()
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 初始化加载数据
onMounted(() => {
  doSearch()
  loadCategoryNames()
})

// 栏目名映射（归属列展示用）
const categoryMap = ref({})
const loadCategoryNames = async () => {
  try {
    const res = await find()
    if (res.code === 0) {
      const m = {}
      ;(res.data || []).forEach((c) => { m[c.id] = c.name })
      categoryMap.value = m
    }
  } catch (e) {
    console.log(e)
  }
}
const categoryName = (cid) => categoryMap.value[cid] || `栏目${cid}`
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

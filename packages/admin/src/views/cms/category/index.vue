<template>
  <div >
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="名称" prop="keywords">
              <el-input
                placeholder="请输入栏目名称"
                :suffix-icon="Search"
                v-model="params.keywords"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内容类型">
              <el-select v-model="params.contentType" placeholder="全部" clearable style="width: 100%">
                <el-option label="全部" value="" />
                <el-option v-for="(label, key) in CONTENT_TYPE_LABEL" :key="key" :label="label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="btn-group">
              <template #label>&nbsp;</template>
              <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
              <el-button :icon="Refresh" @click="clearSearch">清空</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="bg-fff radius-6 pd-20">

      <div class="flex justify-end">
        <el-button size="large" type="primary" round @click="handleAdd()">新增</el-button>
      </div>
      <!-- 新增/编辑/添加下级已改为独立页面 /category/add、/category/edit/:id，不再使用弹窗 -->
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
      >
        <el-table-column
          prop="name"
          label="栏目名称"
          width="180"
        ></el-table-column>



        <el-table-column prop="type" label="类型" width="80">
          <template #default="scope">
            <p v-if="scope.row.type == 0">栏目</p>
            <p v-else>单页</p>
          </template>
        </el-table-column>

        <el-table-column prop="content_type" label="内容类型" width="100">
          <template #default="scope">
            <el-tag size="small">{{ CONTENT_TYPE_LABEL[scope.row.content_type] || '文章' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="model" label="模型" width="80">
          <template #default="scope">
            <p v-if="scope.row.model">{{ scope.row.model }}</p>
            <p v-else>文章</p>
          </template>
        </el-table-column>
         <el-table-column
          prop="id"
          align="center"
          label="编号"
        ></el-table-column>
        <el-table-column prop="orderBy" align="center" label="排序">
          <template #default="scope">{{ scope.row.orderBy }}</template>
        </el-table-column>

        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <p v-if="scope.row.status == 0">显示</p>
            <p v-else>隐藏</p>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <!-- <el-button
              :icon="View"
              circle
              @click="handleClick(scope.row)"
            ></el-button> -->
            <el-button type="primary" link v-if="scope.row.path !== '/home'" @click="handleAddChild(scope.row)">添加下级</el-button>
            <el-button type="primary" link
              circle
              @click="toEdit(scope.row)"
            >编辑</el-button>
            <el-button type="danger" link
               v-permission="['cms:category:delete']"
              circle
              @click="handleDel(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryIndex'
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { destroy, search as searchApi } from '@/api/category.js'
import { CONTENT_TYPE_LABEL } from '@/constants/contentTypes.js'
import { tree, addLabelValue } from '@/utils/tool.js'

const router = useRouter()

const params = reactive({
  keywords: '',
  contentType: '',
})
const loading = ref(true)
const tableData = ref([])
const multipleTableRef = ref(null)
const multipleSelection = ref([])

// 清空
const clearSearch = () => {
  params.keywords = ''
  tableData.value = []
  multipleSelection.value = []
  search()
}

// 查询
const search = async () => {
  loading.value = true
  try {
    const q = params.keywords
    const res = await searchApi(q)
    if (res.code === 0) {
      // 内容类型过滤：每行自带 content_type（根栏目声明、子孙继承），按行过滤即整棵筛选
      const type = params.contentType
      const rows = (res.data || []).filter(r => !type || r.content_type === type)
      if (q) {
        // 搜索结果直接显示，不需要构建树形结构
        tableData.value = addLabelValue(rows)
      } else {
        // 空搜索时构建完整树形结构
        tableData.value = addLabelValue(tree(rows))
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 新增根栏目
const handleAdd = () => {
  router.push('/category/add')
}

// 添加下级栏目
const handleAddChild = (row) => {
  router.push(`/category/add?parentId=${row.id}`)
}

// 编辑
const toEdit = (e) => {
  router.push(`/category/edit/${e.id}`)
}

// 删除
const del = async id => {
  try {
    const res = await destroy(id)
    if (res.code === 0) {
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      })
      clearSearch()
    }
  } catch (error) {
    console.log(error)
  }
}

// 删除栏目
const handleDel = async e => {
  const id = e.id
  ElMessageBox.confirm('此操作将永久删除栏目, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      del(id)
    })
    .catch(() => {
      // 用户取消删除
    })
}

onMounted(() => {
  search()
})
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

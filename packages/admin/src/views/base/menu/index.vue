<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="名称" prop="keywords">
              <el-input placeholder="请输入菜单名称" :suffix-icon="Search" v-model="params.keywords" clearable style="width: 100%" />
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
      <div class="flex justify-end mb-10">
        <el-button size="large" type="primary"  @click="handleAdd" round>新增</el-button>
      </div>
      <!-- //@selection-change="handleSelectionChange" -->
      <el-table ref="multipleTableRef" :data="tableData" tooltip-effect="dark" row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading">
        <!-- <el-table-column type="selection"></el-table-column> -->

        <el-table-column prop="title" label="菜单管理" width="180"></el-table-column>

        <el-table-column prop="path" align="center" label="路由"></el-table-column>

        <el-table-column prop="type" align="center" width="100" label="节点类型">
          <template #default="scope">
            <p v-if="scope.row.type == 'M'">目录</p>
            <p v-else>菜单</p>
          </template>
        </el-table-column>

        <el-table-column prop="order_num" align="center" width="60" label="排序"></el-table-column>

        <el-table-column prop="is_show" width="60" label="状态">
          <template #default="scope">
            <p v-if="scope.row.is_show == '1'">显示</p>
            <p v-else>隐藏</p>
          </template>
        </el-table-column>


        <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">

            <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>
            <el-button :icon="Delete" v-permission="['base:menu:delete']"  circle @click="handleDel(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增&编辑弹窗 -->
    <Dialog v-model:visible="state.dialogVisible" :id="state.id" @success="getList">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'

import { tree, addLabelValue } from '@/utils/tool.js'
import Dialog from './components/dialog.vue'
import { list, remove } from './api/index.js'

const state = reactive({
  dialogVisible: false,
  id: 0,
  params: {},
  list: [],
})

const params = reactive({
  keywords: '',
})
const loading = ref(true)
const tableData = ref([])
const multipleTableRef = ref(null)
const multipleSelection = ref([])

watch(() => state.dialogVisible, (newValue) => {
  if (!newValue) {
    getList()
  }
})

onMounted(() => {
  search()
})

const getList = async () => {
  try {
    const res = await list()
    if (res.code === 0) {
      res.data.list.forEach(item => {
        item.id = Number(item.id)
      })
      const data = tree(res.data.list)
      tableData.value = addLabelValue(data)
      loading.value = false
    }
  } catch (error) {
    console.log(error)
  }
}



//编辑
const toEdit = row => {
  state.id = parseInt(row.id)
  state.dialogVisible = true
}
//新增
const handleAdd = () => {
  state.id = 0
  state.dialogVisible = true
}

//删除
const handleDel = async row => {
  console.log(row)
  try {
    const res = await remove({ id: row.id })
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '删除成功',
        type: 'success',
      })
      getList()
    }
  } catch (error) {
    console.log(error)
  }
}

// 清空
const clearSearch = () => {
  params.keywords = ''
  tableData.value = []
  multipleSelection.value = []
  search()
}

// 查询
const search = async () => {
  try {
    const res = await list()
    if (res.code === 0) {
      res.data.list.forEach(item => {
        item.id = Number(item.id)
      })
      const data = tree(res.data.list)
      tableData.value = addLabelValue(data)
      loading.value = false
    }
  } catch (error) {
    console.log(error)
  }
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

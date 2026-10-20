<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="名称" prop="keywords">
              <el-input placeholder="请输入角色名称" :suffix-icon="Search" v-model="params.keywords" clearable style="width: 100%" />
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
      <el-table ref="multipleTableRef" :data="state.list" tooltip-effect="dark" row-key="id" v-loading="loading">
        <!-- <el-table-column type="selection"></el-table-column> -->

        <el-table-column prop="id" label="角色编号"></el-table-column>

        <el-table-column prop="name" align="center" label="角色名称"></el-table-column>

        <el-table-column prop="key" align="center" label="权限标识"></el-table-column>

        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <p v-if="scope.row.status == '1'">启用</p>
            <p v-else>停用</p>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
            <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>
            <el-button :icon="Delete" v-permission="['base:role:delete']" circle :disabled="isBuiltin(scope.row)" @click="handleDel(scope.row)"></el-button>
            <el-tooltip v-if="isBuiltin(scope.row)" content="系统内置角色不可删除" effect="light" placement="top-start">
              <el-icon class="ml-10 t-4 pointer">
                <QuestionFilled class="c-165dff" />
              </el-icon>
            </el-tooltip>
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
import { Delete, Edit, Search, Refresh, QuestionFilled } from '@element-plus/icons-vue'

import Dialog from './components/dialog.vue'
import { list, remove } from './api/index.js'
import dayjs from 'dayjs';
const state = reactive({
  dialogVisible: false,
  id: 0,
  params: {},
  list: [],
})

onMounted(() => {
  getList()
})

watch(() => state.dialogVisible, (newValue) => {
  if (!newValue) {
    getList()
  }
})


const getList = async () => {
  try {
    const res = await list()
    if (res.code === 0) {
      res.data.list.forEach(item => {
        item.id = Number(item.id);
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
      })
      state.list = res.data.list
      loading.value = false
    }
  } catch (error) {
    console.log(error)
  }
}

//编辑
const toEdit = row => {
  state.id = row.id
  state.dialogVisible = true
}
//新增
const handleAdd = () => {
  state.id = 0
  state.dialogVisible = true
}

//系统内置角色（不可删除）
const BUILTIN_ROLE_KEYS = ['super', 'admin', 'visitor', 'editor']
const isBuiltin = (row) => BUILTIN_ROLE_KEYS.includes(row.key)

//删除
const handleDel = async row => {
  if (isBuiltin(row)) {
    ElMessage({ message: '系统内置角色不可删除', type: 'warning' })
    return
  }
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

const params = reactive({
  keywords: '',
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
  try {
    const res = await list()
    if (res.code === 0) {
      res.data.list.forEach(item => {
        item.id = Number(item.id);
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
      })
      state.list = res.data.list
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

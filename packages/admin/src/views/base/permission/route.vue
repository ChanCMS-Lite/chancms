<template>
  <div>
    <!-- 搜索 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="路径/归属" prop="keywords">
              <el-input placeholder="接口路径或归属权限码" :suffix-icon="Search" v-model="params.keywords" clearable style="width: 100%" @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="请求方法" prop="method">
              <el-select v-model="params.method" placeholder="全部" clearable style="width: 100%">
                <el-option v-for="m in ['GET', 'POST', 'PUT', 'DELETE']" :key="m" :label="m" :value="m" />
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

    <!-- 列表 -->
    <div class="bg-fff radius-6 pd-20">
      <div class="flex justify-between mb-10">
        <span class="ts">新增接口后点「同步权限」自动归类，或手动「新增」；未配置归属的接口访问会被拒绝</span>
        <div>
          <el-button size="large" v-permission="['base:permission:update']" :loading="syncing" @click="handleSync" round>同步权限</el-button>
          <el-button size="large" type="primary" @click="handleAdd" round>新增</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="method" label="方法" width="90" align="center">
          <template #default="scope">
            <el-tag :type="methodTagType(scope.row.method)" size="small">{{ scope.row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="接口路径" min-width="260" />
        <el-table-column prop="perm_code" label="归属权限码" min-width="200">
          <template #default="scope">
            <code class="perm-code">{{ scope.row.perm_code }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120">
          <template #default="scope">{{ scope.row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="170" align="center">
          <template #default="scope">{{ scope.row.updated_at ? dayjs(scope.row.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-' }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
            <el-button :icon="Edit" circle @click="toEdit(scope.row)" />
            <el-button :icon="Delete" v-permission="['base:permission:delete']" circle @click="handleDel(scope.row)" />
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-10">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="params.pageSize" :current-page="params.current" @current-change="handlePage" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <RouteDialog v-model:visible="dialogVisible" :id="dialogId" :row="dialogRow" @success="getList" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'
import RouteDialog from './components/route-dialog.vue'
import { routeList, routeDelete, syncPerm } from './api/index.js'
import dayjs from 'dayjs'

const params = reactive({ keywords: '', method: '', current: 1, pageSize: 20 })
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const syncing = ref(false)
const dialogVisible = ref(false)
const dialogId = ref(0)
const dialogRow = ref(null)

onMounted(getList)

async function getList() {
  loading.value = true
  try {
    const res = await routeList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const search = () => { params.current = 1; getList() }
const clearSearch = () => { params.keywords = ''; params.method = ''; params.current = 1; getList() }
const handlePage = (page) => { params.current = page; getList() }
const handleAdd = () => { dialogId.value = 0; dialogRow.value = null; dialogVisible.value = true }
const toEdit = (row) => { dialogId.value = parseInt(row.id); dialogRow.value = row; dialogVisible.value = true }

const methodTagType = (m) => (m === 'GET' ? 'success' : m === 'POST' ? 'warning' : 'danger')

async function handleSync() {
  syncing.value = true
  try {
    const res = await syncPerm()
    if (res.code === 0) {
      ElMessage({ message: res.msg, type: 'success' })
      getList()
    } else {
      ElMessage({ message: res.msg, type: 'error' })
    }
  } catch (error) {
    console.error(error)
  } finally {
    syncing.value = false
  }
}

async function handleDel(row) {
  try {
    const res = await routeDelete({ id: row.id })
    if (res.code === 0) {
      ElMessage({ message: '删除成功', type: 'success' })
      getList()
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

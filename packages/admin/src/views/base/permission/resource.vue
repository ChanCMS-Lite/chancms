<template>
  <div>
    <!-- 搜索 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="名称/标识" prop="keywords">
              <el-input placeholder="资源名称或资源标识" :suffix-icon="Search" v-model="params.keywords" clearable style="width: 100%" @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模块" prop="module">
              <el-select v-model="params.module" placeholder="全部" clearable filterable style="width: 100%">
                <el-option v-for="m in moduleOptions" :key="m" :label="m" :value="m" />
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
        <span class="ts">新增资源后，角色编辑的权限树与接口归属选择器都会出现这一项</span>
        <el-button size="large" type="primary" @click="handleAdd" round>新增资源</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" row-key="id">
        <el-table-column prop="module" label="模块" width="110" align="center">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource_key" label="资源标识" width="150">
          <template #default="scope"><code class="perm-code">{{ scope.row.resource_key }}</code></template>
        </el-table-column>
        <el-table-column prop="name" label="资源名称" min-width="140" />
        <el-table-column label="勾选动作" min-width="220">
          <template #default="scope">
            <el-tag v-for="a in (scope.row.actions || [])" :key="a" size="small" type="success" class="mr-5">{{ ACTION_LABELS[a] || a }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限编码" min-width="260">
          <template #default="scope">
            <el-tag v-for="a in (scope.row.actions || [])" :key="a" size="small" type="info" class="mr-5">{{ scope.row.module }}:{{ scope.row.resource_key }}:{{ a }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="menu_title" label="挂靠菜单" width="140" align="center">
          <template #default="scope">{{ scope.row.menu_title || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
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
    <ResourceDialog v-model:visible="dialogVisible" :id="dialogId" :row="dialogRow" @success="getList" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'
import ResourceDialog from './components/resource-dialog.vue'
import { resourceList, resourceDelete, permResources } from './api/index.js'

const ACTION_LABELS = { list: '查看', create: '新增', update: '修改', delete: '删除' }

const params = reactive({ keywords: '', module: '', current: 1, pageSize: 20 })
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const moduleOptions = ref([])
const dialogVisible = ref(false)
const dialogId = ref(0)
const dialogRow = ref(null)

onMounted(() => {
  getList()
  getModuleOptions()
})

async function getList() {
  loading.value = true
  try {
    const res = await resourceList(params)
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

async function getModuleOptions() {
  try {
    const res = await permResources()
    if (res.code === 0) {
      moduleOptions.value = (res.data || []).map((m) => m.module)
    }
  } catch (error) {
    console.error(error)
  }
}

const search = () => { params.current = 1; getList() }
const clearSearch = () => { params.keywords = ''; params.module = ''; params.current = 1; getList() }
const handlePage = (page) => { params.current = page; getList() }
const handleAdd = () => { dialogId.value = 0; dialogRow.value = null; dialogVisible.value = true }
const toEdit = (row) => { dialogId.value = parseInt(row.id); dialogRow.value = row; dialogVisible.value = true }

async function handleDel(row) {
  try {
    const res = await resourceDelete({ id: row.id })
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

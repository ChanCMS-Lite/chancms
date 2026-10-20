<template>
  <div>
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="params.status" placeholder="请选择状态" clearable style="width: 100%">
                <el-option label="待审核" value="1"></el-option>
                <el-option label="已通过" value="2"></el-option>
                <el-option label="已拒绝" value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="btn-group">
              <template #label>&nbsp;</template>
              <el-button type="primary" :icon="Search" @click="doSearch">查询</el-button>
              <el-button :icon="Refresh" @click="clearSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="radius-6 bg-fff pd-20">
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" width="80" label="编号" fixed></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="100">
          <template #default="scope">
            {{ scope.row.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="100">
          <template #default="scope">
            {{ scope.row.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="articleTitle" label="文章标题" min-width="200">
          <template #default="scope">
            {{ scope.row.articleTitle || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="scope">
            <div class="line-clamp-2">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              effect="plain"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="评论时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="审核操作" width="180" align="center">
          <template #default="scope">
            <div class="audit-switch-wrapper">
              <el-switch
                v-model="scope.row.status"
                :active-value="'2'"
                :inactive-value="'3'"
                active-text="通过"
                inactive-text="拒绝"
                inline-prompt
                style="--el-switch-on-color: #67c23a; --el-switch-off-color: #f56c6c;"
                :disabled="scope.row.status === '1'"
                @change="(val) => handleStatusChange(scope.row, val)"
              />
              <el-button
                v-if="scope.row.status === '1'"
                type="primary"

                @click="handleAudit(scope.row, '2')"
                class="ml-10" v-permission="['member:user:update']">
                审核
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)" v-permission="['member:user:update']">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-20 flex justify-center">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="currentPage"
          @current-change="handlePageChange"
          :page-size="pageSize"
          :total="totalCount"
        ></el-pagination>
      </div>
    </div>

    <el-dialog
      v-model="auditDialogVisible"
      title="审核备注"
      width="500px"
    >
      <el-form :model="auditForm" label-width="84px" label-position="top">
        <el-form-item label="备注">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注（可选）"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAudit" :loading="auditing" v-permission="['member:user:update']">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Delete, Search, Refresh } from '@element-plus/icons-vue';

import { list, audit, deleteComment } from './api/index.js';

const loading = ref(false);
const auditing = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const auditDialogVisible = ref(false);
const currentAuditRow = ref(null);
const auditStatus = ref('');
const auditForm = reactive({
  auditRemark: ''
});

const params = reactive({
  status: ''
});

onMounted(() => {
  loadList();
});

async function loadList() {
  loading.value = true;
  try {
    const res = await list(currentPage.value, pageSize.value, params.status);
    if (res.code === 0) {
      tableData.value = res.data.list || [];
      totalCount.value = Number(res.data.total || 0);
    }
  } catch (error) {
    console.error('加载评论列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function doSearch() {
  currentPage.value = 1;
  loadList();
}

function clearSearch() {
  params.status = '';
  currentPage.value = 1;
  loadList();
}

function handlePageChange(page) {
  currentPage.value = page;
  loadList();
}

function handleStatusChange(row, val) {
  const statusText = val === '2' ? '通过' : '拒绝';
  ElMessageBox.confirm(
    `确定要${statusText}这条评论吗？`,
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    auditing.value = true;
    try {
      const res = await audit({
        id: row.id,
        status: val,
        auditRemark: ''
      });
      if (res.code === 0) {
        ElMessage.success('审核成功');
        loadList();
      }
    } catch (error) {
      console.error('审核失败:', error);
      // 恢复原状态
      loadList();
    } finally {
      auditing.value = false;
    }
  }).catch(() => {
    // 取消时恢复原状态
    loadList();
  });
}

function getStatusType(status) {
  const statusMap = {
    '1': 'warning',
    '2': 'success',
    '3': 'danger'
  };
  return statusMap[status] || 'info';
}

function getStatusText(status) {
  const statusMap = {
    '1': '待审核',
    '2': '已通过',
    '3': '已拒绝'
  };
  return statusMap[status] || '未知';
}

function handleAudit(row, status) {
  ElMessageBox.confirm(
    `确定要${status === '2' ? '通过' : '拒绝'}这条评论吗？`,
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    auditing.value = true;
    try {
      const res = await audit({
        id: row.id,
        status: status,
        auditRemark: ''
      });
      if (res.code === 0) {
        ElMessage.success('审核成功');
        loadList();
      }
    } catch (error) {
      console.error('审核失败:', error);
    } finally {
      auditing.value = false;
    }
  }).catch(() => {});
}

function handleConfirmAudit() {
  if (!currentAuditRow.value) return;

  auditing.value = true;
  audit({
    id: currentAuditRow.value.id,
    status: auditStatus.value,
    auditRemark: auditForm.auditRemark
  }).then(res => {
    if (res.code === 0) {
      ElMessage.success('审核成功');
      auditDialogVisible.value = false;
      loadList();
    }
  }).catch(error => {
    console.error('审核失败:', error);
  }).finally(() => {
    auditing.value = false;
  });
}

function handleDelete(row) {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteComment(row.id);
      if (res.code === 0) {
        ElMessage.success('删除成功');
        loadList();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  }).catch(() => {});
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateString;
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

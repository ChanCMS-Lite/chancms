<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="params" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="用户名" prop="keywords">
              <el-input
                placeholder="请输入用户名"
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
      <div class="flex justify-between mb-10">
        <el-popconfirm
          title="确定删除选中的会员吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon-color="#626AEF"
          width="220"
          @confirm="delSome"
          @cancel="cancelEvent"
        >
          <template #reference>
            <el-button v-permission="['member:user:delete']" :disabled="multipleSelection.length === 0">删除</el-button>
          </template>
        </el-popconfirm>
      </div>
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" width="80" label="编号" fixed></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="100">
          <template #default="scope">
            {{ scope.row.nickname || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="scope">
            {{ scope.row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="120">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'" effect="plain">
              {{ scope.row.status == 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="130">
          <template #default="scope">
            <el-button
             :icon="Edit"
              circle
              @click="handleDetail(scope.row)"
            ></el-button>
            <el-popconfirm
              width="220"
              @confirm="() => del(scope.row.id)"
              confirm-button-text="确定"
              cancel-button-text="取消"
              icon-color="#626AEF"
              title="确定删除该会员吗？删除后其评论、收藏一并清除，且不可恢复。"
            >
              <template #reference>
                <el-button :icon="Delete" v-permission="['member:user:delete']" circle></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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

    <!-- 会员信息弹窗 -->
    <MemberDetail
      v-model:visible="detailDialogVisible"
      :member-data="currentMember"
      @save="handleSave"
      ref="memberDetailRef"
    ></MemberDetail>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Edit, Refresh, Delete } from '@element-plus/icons-vue';

import { list, search, detail, remove } from './api/index.js';
import MemberDetail from './components/MemberDetail.vue';

const multipleTableRef = ref(null);
const multipleSelection = ref([]);
const formRef = ref(null);
const tableData = ref([]);
const loading = ref(false);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

const params = reactive({
  keywords: '',
});

// 详情弹窗
const detailDialogVisible = ref(false);
const currentMember = ref({});
const memberDetailRef = ref(null);

onMounted(() => {
  fetchData();
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 清空搜索
const clearSearch = (str) => {
  if (str) {
    formRef.value?.resetFields();
  }
  params.keywords = '';
  currentPage.value = 1;
  fetchData();
};

// 执行搜索
const doSearch = () => {
  currentPage.value = 1;
  fetchData();
};

// 获取列表数据
const fetchData = async () => {
  loading.value = true;
  try {
    let res;
    if (params.keywords) {
      res = await search(params.keywords, currentPage.value, pageSize.value);
    } else {
      res = await list(currentPage.value, pageSize.value);
    }
    if (res.code === 0) {
      tableData.value = res.data.list || [];
      totalCount.value = Number(res.data.total || 0);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 翻页
const handlePageChange = (page) => {
  currentPage.value = page;

  fetchData();
};

// 查看详情
const handleDetail = async (row) => {
  try {
    const res = await detail(row.id);
    if (res.code === 0) {
      currentMember.value = res.data;
      detailDialogVisible.value = true;
      setTimeout(() => {
        memberDetailRef.value?.initFormData();
      }, 0);
    }
  } catch (error) {
    console.error(error);
  }
};

// 保存成功回调
const handleSave = () => {
  fetchData();
};

// 删除单个会员
const del = async (id) => {
  try {
    const res = await remove(id)
    if (res.code === 0) {
      ElMessage({ message: '删除成功', type: 'success' })
      fetchData()
    }
  } catch (error) {
    console.error(error)
  }
}

// 批量删除
const delSome = async () => {
  try {
    const ids = multipleSelection.value.map(item => item.id).join(',')
    if (!ids) return
    const res = await remove(ids)
    if (res.code === 0) {
      ElMessage({ message: '删除成功', type: 'success' })
      multipleSelection.value = []
      fetchData()
    }
  } catch (error) {
    console.error(error)
  }
}

// 批量删除取消
const cancelEvent = () => {
  ElMessage({ message: '取消删除', type: 'info' })
}

// 勾选变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
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

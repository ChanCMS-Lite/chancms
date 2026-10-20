<template>
  <div>
    <!-- 搜索区 -->
    <div class="radius-6 bg-fff pd-20 mb-10">
      <el-form  @submit.prevent>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="关键词" class="mb-0">
          <el-input
            v-model="keyword"
            placeholder="请输入文章标题/用户名/昵称"
            clearable
            @keyup.enter="handleSearch"
            style="width: 260px"
          ></el-input>
        </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item class="mb-0">
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">清空</el-button>
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
        <el-table-column prop="article_id" label="文章ID" width="100">
          <template #default="scope">
            {{ scope.row.article_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="article_title" label="文章标题" min-width="200">
          <template #default="scope">
            <el-link
              v-if="scope.row.article_title"
              type="primary"
              :href="`/article-${scope.row.article_id}.html`"
              target="_blank"
              underline="hover"
            >
              {{ scope.row.article_title }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="article_cover" label="文章封面" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.article_cover"
              :src="scope.row.article_cover"
              :preview-src-list="[scope.row.article_cover]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            ></el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="收藏时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template #default="scope">
            <el-button
              type="danger"

              @click="handleDelete(scope.row)" v-permission="['member:user:update']">
              删除
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';


import { list, deleteFavorite } from './api/index.js';

const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const keyword = ref('');

onMounted(() => {
  loadList();
});

async function loadList() {
  loading.value = true;
  try {
    const res = await list(currentPage.value, pageSize.value, keyword.value);
    if (res.code === 0) {
      tableData.value = res.data.list || [];
      totalCount.value = Number(res.data.total || 0);
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error);
  } finally {
    loading.value = false;
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadList();
};

// 清空
const handleReset = () => {
  keyword.value = '';
  currentPage.value = 1;
  loadList();
};

const handlePageChange = (page) => {
  currentPage.value = page;

  loadList();
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要删除用户"${row.nickname || row.username}"的这条收藏记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteFavorite(row.id);
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
  } catch (error) {
    console.log(error)
    return dateString;
  }
}
</script>

<style scoped>
.el-image {
  cursor: pointer;
}
</style>

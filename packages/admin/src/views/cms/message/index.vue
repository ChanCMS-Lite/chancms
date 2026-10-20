<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="关键词" prop="keyword">
              <el-input
                placeholder="请输入标题或内容"
                :suffix-icon="Search"
                v-model="searchForm.keyword"
                clearable
                style="width: 100%"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="btn-group">
              <template #label>&nbsp;</template>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="handleReset">清空</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="bg-fff radius-6 pd-20">
      <div class="flex justify-between mb-10">
        <el-popconfirm
          title="确定删除选中的留言吗？"
          @confirm="delSome"
          @cancel="cancelEvent"
          width="220"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon-color="#626AEF"
          :icon="InfoFilled"
        >
          <template #reference>
            <el-button v-permission="['cms:message:delete']" :disabled="multipleSelection.length === 0">删除</el-button>
          </template>
        </el-popconfirm>
        <router-link to="/message/add">
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
      <el-table-column prop="id" width="80" label="编号"></el-table-column>
      <el-table-column prop="title" width="300" label="标题"></el-table-column>
      <el-table-column prop="type" label="留言类型">
        <template #default="scope">
          <span v-if="scope.row.type == 1">咨询</span>
          <span v-else-if="scope.row.type == 2">建议</span>
          <span v-else-if="scope.row.type == 3">投诉</span>
          <span v-else>其它</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="联系人"></el-table-column>
      <el-table-column prop="tel" label="手机号"></el-table-column>
      <el-table-column prop="company" label="公司单位"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="created_at" label="发布时间">
        <template #default="scope">{{ scope.row.created_at }}</template>
      </el-table-column>
      <el-table-column fixed="right" width="100" label="操作">
        <template #default="scope">
          <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>
          <el-button
            :icon="Delete" v-permission="['cms:message:delete']"
            circle
            @click="handleDelete(scope.row)"
          ></el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Refresh as RefreshIcon, InfoFilled } from '@element-plus/icons-vue';
import { list, search, del } from '@/api/message.js';
import dayjs from 'dayjs';

const multipleTableRef = ref(null);
const tableData = ref([]);
const multipleSelection = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const router = useRouter();

const Edit = EditIcon;
const Delete = DeleteIcon;
const Search = SearchIcon;
const Refresh = RefreshIcon;

const searchForm = reactive({
  keyword: '',
});

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  try {
    const keyword = searchForm.keyword.trim();
    const res = keyword
      ? await search(currentPage.value, keyword)
      : await list(currentPage.value);
    if (res.code === 0) {
      tableData.value = (res.data.list || []).map(item => ({
        ...item,
        created_at: item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') : '-',
      }));
      totalCount.value = Number(res.data.total || 0);
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.keyword = '';
  currentPage.value = 1;
  fetchData();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchData();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

// 批量删除（勾选行 id 逗号拼接，后端 whereIn 批量删）
const delSome = async () => {
  const ids = multipleSelection.value.map((item) => item.id).join(',');
  if (!ids) return;
  try {
    const res = await del(ids);
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      });
      fetchData();
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const cancelEvent = () => {};

const toEdit = (row) => {
  router.push({ name: 'message-edit', params: { id: row.id } });
};

const handleDelete = async (row) => {
  try {
    const res = await del(row.id);
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      });
      fetchData();
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>

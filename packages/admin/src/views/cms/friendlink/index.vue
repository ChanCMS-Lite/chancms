<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="关键词" prop="keyword">
              <el-input
                placeholder="请输入标题或链接"
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
      <div class="mt-10 mb-10 flex justify-end">
        <router-link to="/friendlink/add">
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
      <el-table-column prop="id" width="60" label="编号"></el-table-column>
      <el-table-column prop="title" width="120" label="标题"></el-table-column>
      <el-table-column prop="link" width="260" label="链接"></el-table-column>
      <el-table-column prop="orderBy" label="排序"></el-table-column>
      <el-table-column prop="created_at" label="发布时间">
        <template #default="scope">{{ scope.row.created_at }}</template>
      </el-table-column>
      <el-table-column fixed="right" width="100" label="操作">
        <template #default="scope">
          <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>
          <el-button
            :icon="Delete" v-permission="['cms:friendlink:delete']"
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
import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue';
import { list, del } from '@/api/friendlink.js';
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
    const res = await list(currentPage.value, searchForm.keyword.trim());
    if (res.code === 0) {
      tableData.value = (res.data.list || []).map(item => ({
        ...item,
        created_at: item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss') : '-',
      }));
      totalCount.value = Number(res.data.total || 0);
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
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const toEdit = (row) => {
  router.push({ name: 'friendlink-edit', params: { id: row.id } });
};

const handleDelete = async (row) => {
  try {
    const res = await del(row.id);
    if (res.code === 0) {
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      });
      fetchData();
    } else {
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

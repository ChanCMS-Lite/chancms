<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="关键词" prop="keyword">
              <el-input
                placeholder="请输入标题"
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
        <router-link to="/slide/add" >
          <el-button size="large" type="primary" round>新增</el-button>
        </router-link>
      </div>
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="id" label="编号"></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="imgUrl" label="图片链接">
          <template #default="scope">
            <el-popover
              v-if="scope.row.imgUrl"
              placement="right"
              :width="600"
              trigger="hover"
            >
              <template #reference>
                <el-image
                  class="table-thumb pointer ml-10"
                  :src="scope.row.imgUrl"
                />
              </template>
              <el-image style="width: 100%" :src="scope.row.imgUrl" />
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="linkUrl" label="跳转链接"> </el-table-column>
        <el-table-column label="归属" width="120">
          <template #default="scope">
            <el-tag v-if="!scope.row.cid" type="info" size="small">全局</el-tag>
            <el-tag v-else size="small">{{ categoryName(scope.row.cid) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="100" label="操作">
          <template #default="scope">
            <el-button :icon="Edit" circle @click="toEdit(scope.row)"></el-button>
            <el-button
              :icon="Delete" v-permission="['cms:slide:delete']"
              circle
              @click="handleDel(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="mt-20 flex justify-center">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="cur"
          @current-change="handlePageChange"
          :page-size="pageSize"
          :total="count"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue';
import { list, del } from '@/api/slide.js';
import { find } from '@/api/category.js';

const router = useRouter();

const Edit = EditIcon;
const Delete = DeleteIcon;
const Search = SearchIcon;
const Refresh = RefreshIcon;

const tableData = ref([]);
const multipleSelection = ref([]);
const count = ref(0);
const cur = ref(1);
const pageSize = ref(20);

const searchForm = reactive({
  keyword: '',
});

// 查询
const fetchData = async () => {
  try {
    const res = await list(cur.value, searchForm.keyword.trim());
    if (res.code === 0) {
      tableData.value = [...res.data.list];
      count.value = Number(res.data.total || 0);
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

// 搜索
const handleSearch = () => {
  cur.value = 1;
  fetchData();
};

// 清空
const handleReset = () => {
  searchForm.keyword = '';
  cur.value = 1;
  fetchData();
};

// 监听分页变化
const handlePageChange = (page) => {
  cur.value = page;
  fetchData();
}

// 切换选中项

// 处理选中变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

// 编辑
const toEdit = (e) => {
  const id = e.id;
  router.push({ name: 'slide-edit', params: { id: id } });
};

// 删除
const handleDel = async (e) => {
  const id = e.id;
  try {
    const res = await del(id);
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

const multipleTable = ref(null);

onMounted(() => {
  fetchData();
  loadCategoryNames();
});

// 栏目名映射（归属列展示用）
const categoryMap = ref({});
const loadCategoryNames = async () => {
  try {
    const res = await find();
    if (res.code === 0) {
      const m = {};
      (res.data || []).forEach((c) => { m[c.id] = c.name; });
      categoryMap.value = m;
    }
  } catch (e) {
    console.log(e);
  }
};
const categoryName = (cid) => categoryMap.value[cid] || `栏目${cid}`;
</script>

<style scoped></style>

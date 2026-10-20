<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="模型名称" prop="keyword">
              <el-input
                placeholder="请输入模型名称"
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
      <div class="mt-10 mb-10 flex justify-between">
        <el-popconfirm
          title="确定删除选中的模型吗？"
          confirm-button-text="确定"
          cancel-button-text="取消"
          icon-color="#626AEF"
          width="220"
          @confirm="delSome"
          @cancel="cancelEvent"
        >
          <template #reference>
            <el-button v-permission="['cms:model:delete']" :disabled="multipleSelection.length === 0">删除</el-button>
          </template>
        </el-popconfirm>
        <router-link to="/model/add">
          <el-button size="large" type="primary" round>新增</el-button>
        </router-link>
      </div>

      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="id" width="60" label="编号"></el-table-column>
        <el-table-column prop="model" label="模型名称"></el-table-column>
        <el-table-column prop="model_code" label="模型编码"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">{{
            scope.row.status == 1 ? "启用" : "禁用"
          }}</template>
        </el-table-column>
        <el-table-column fixed="right" width="150" label="操作">
          <template #default="scope">
            <el-button
              :icon="View"
              circle
              @click="handleClick(scope.row)"
            ></el-button>
            <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>
            <el-button
              :icon="Delete" v-permission="['cms:model:delete']"
              circle
              @click="handleDel(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-20 flex justify-center" v-if="count > 0">
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
import { Delete, Edit, View, Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue';
import { list, search, hasUse, del } from '@/api/model.js';

const router = useRouter();

const Search = SearchIcon;
const Refresh = RefreshIcon;

const multipleTable = ref(null);
const multipleSelection = ref([]);
const tableData = ref([]);
const count = ref(0);
const cur = ref(1);
const pageSize = ref(1000);
const loading = ref(true);

const searchForm = reactive({
  keyword: '',
});

onMounted(() => {
  listData();
});

const listData = async () => {
  try {
    const keyword = searchForm.keyword.trim();
    // 注意：list(page, pageSize) 与 search(page, keyword) 的第二个参数语义不同，
    // 不能用同一个 fn(cur.value, keyword) 调用，否则会把 keyword 误当 pageSize 传给 list。
    const res = keyword ? await search(cur.value, keyword) : await list(cur.value);
    if (res.code === 0) {
      tableData.value = res.data.list || [];
      count.value = Number(res.data.total || 0);
      loading.value = false;
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// 搜索
const handleSearch = () => {
  cur.value = 1;
  listData();
};

// 清空
const handleReset = () => {
  searchForm.keyword = '';
  cur.value = 1;
  listData();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handlePageChange = (page) => {
  cur.value = page;
  sessionStorage.setItem('cur', page);
  listData();
};

const toEdit = (e) => {
  const id = e.id;
  router.push({ name: 'model-edit', params: { id: id } });
};

const handleClick = (e) => {
  const { id } = e;
  router.push({ name: 'field-index', query: { mid: id } });
};

const handleDel = async (e) => {
  const { id, table } = e;
  try {
    const res = await hasUse(id);
    if (res.code === 0) {
      if (res.data.total === 0) {
        const res = await del(id, table);
        if (res.code === 0) {
          ElMessage({
            message: '删除成功 ^_^',
            type: 'success',
          });
          listData();
        } else {
          ElMessage({
            message: res.msg,
            type: 'error',
          });
        }
      } else {
        ElMessage({
          message: '当前模型已经使用，不能删除！',
          type: 'error',
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// 批量删除选中模型
const delSome = async () => {
  const rows = multipleSelection.value;
  if (!rows.length) return;
  // 逐个校验是否被使用，未使用的进入删除
  const usable = [];
  for (const row of rows) {
    try {
      const res = await hasUse(row.id);
      if (res.code === 0 && res.data.total === 0) usable.push(row);
    } catch (error) {
      console.error(error);
    }
  }
  const refused = rows.length - usable.length;
  if (!usable.length) {
    ElMessage({ message: refused ? '所选模型均已被使用，不能删除' : '无可删除的模型', type: 'warning' });
    return;
  }
  try {
    const res = await del(usable.map((r) => r.id).join(','), '');
    if (res.code === 0) {
      ElMessage({
        message: refused ? `删除成功，${refused} 个被使用的模型已跳过` : '删除成功 ^_^',
        type: 'success',
      });
      multipleSelection.value = [];
      listData();
    } else {
      ElMessage({ message: res.msg, type: 'error' });
    }
  } catch (error) {
    console.error(error);
  }
};

// 批量删除取消
const cancelEvent = () => {
  ElMessage({ message: '取消删除', type: 'info' });
};
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

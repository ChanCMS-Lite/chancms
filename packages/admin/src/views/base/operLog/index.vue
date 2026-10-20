<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form label-position="top" :model="search" ref="formRef" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="操作模块" prop="title">
              <el-input v-model="search.title" placeholder="请输入操作模块" clearable style="width: 100%"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作人员" prop="oper_name">
              <el-input v-model="search.oper_name" placeholder="请输入操作人员" clearable style="width: 100%"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务类型" prop="business_type">
              <el-select v-model="search.business_type" placeholder="请选择" clearable style="width: 100%">
                <el-option label="新增" :value="1"></el-option>
                <el-option label="修改" :value="2"></el-option>
                <el-option label="删除" :value="3"></el-option>
                <el-option label="其它" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作类别" prop="operator_type">
              <el-select v-model="search.operator_type" placeholder="请选择" clearable style="width: 100%">
                <el-option label="登录" :value="3"></el-option>
                <el-option label="后台用户" :value="1"></el-option>
                <el-option label="手机端" :value="2"></el-option>
                <el-option label="其它" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" prop="status">
              <el-select v-model="search.status" placeholder="请选择" clearable style="width: 100%">
                <el-option label="正常" :value="1"></el-option>
                <el-option label="异常" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="btn-group">
              <template #label>&nbsp;</template>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 列表区域 -->
    <div class="radius-6 bg-fff pd-20">
      <div class="flex justify-between align-c mb-10">
        <el-popconfirm
          confirm-button-text="确定"
          cancel-button-text="取消"
          title="确定要批量删除选中的日志吗？"
          @confirm="handleBatchDel"
        >
          <template #reference>
            <el-button type="danger" :disabled="!selectedIds.length" v-permission="['base:operLog:delete']">批量删除</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          confirm-button-text="确定"
          cancel-button-text="取消"
          title="确定要清空所有日志吗？此操作不可恢复！"
          @confirm="handleClear"
        >
          <template #reference>
            <el-button type="warning" v-permission="['base:operLog:delete']">清空日志</el-button>
          </template>
        </el-popconfirm>
      </div>

      <el-table :data="state.list" tooltip-effect="dark" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" width="80" label="编号"></el-table-column>
        <el-table-column prop="title" label="操作模块" width="120"></el-table-column>
        <el-table-column prop="business_type" label="业务类型" width="90">
          <template #default="scope">
            <el-tag :type="businessTypeMap[scope.row.business_type]?.type">
              {{ businessTypeMap[scope.row.business_type]?.label || '其它' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator_type" label="操作类别" width="110">
          <template #default="scope">
            <el-tag :type="operatorTypeMap[scope.row.operator_type]?.type">
              {{ operatorTypeMap[scope.row.operator_type]?.label || '其它' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="request_method" label="请求方式" width="90"></el-table-column>
        <el-table-column prop="oper_name" label="操作人员" width="120"></el-table-column>
        <el-table-column prop="oper_url" label="请求URL" show-overflow-tooltip min-width="200"></el-table-column>
        <el-table-column prop="oper_ip" label="IP地址" width="130"></el-table-column>
        <el-table-column prop="region" label="归属地" width="170" show-overflow-tooltip>
          <template #default="scope">
            {{ formatRegion(scope.row) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="oper_time" label="操作时间" width="170"></el-table-column>
      </el-table>

      <div class="mt-20 flex justify-center">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="count"
          :page-size="pageSize"
          :current-page="cur"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { list, remove, clear } from "./api/index.js";

defineOptions({
  name: 'OperLogIndex',
});

const businessTypeMap = {
  0: { label: '其它', type: 'info' },
  1: { label: '新增', type: 'success' },
  2: { label: '修改', type: 'primary' },
  3: { label: '删除', type: 'danger' },
};

const operatorTypeMap = {
  0: { label: '其它', type: 'info' },
  1: { label: '后台用户', type: 'primary' },
  2: { label: '手机端', type: 'warning' },
  3: { label: '登录', type: 'success' },
};

const isPrivateIp = (ip) => {
  if (!ip) return false;
  return /^(127\.0\.0\.1|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc00:|fd00:)/.test(ip);
};

const formatRegion = (row) => {
  if (isPrivateIp(row.oper_ip)) {
    return '内网';
  }
  const parts = [row.country, row.prov, row.city, row.district]
    .filter(Boolean)
    .filter((v, i, arr) => v !== '内网' && arr.indexOf(v) === i);
  if (row.isp && row.isp !== '内网') parts.push(row.isp);
  return parts.join(' ') || '-';
};

const count = ref(0);
const cur = ref(1);
const pageSize = ref(20);
const selectedIds = ref([]);

const search = reactive({
  title: '',
  oper_name: '',
  business_type: '',
  operator_type: '',
  status: '',
});

const state = reactive({
  list: [],
});

const fetchList = async () => {
  try {
    const res = await list({
      cur: cur.value,
      pageSize: pageSize.value,
      ...search,
    });
    if (res.code === 0) {
      state.list = res.data.list || [];
      count.value = Number(res.data.total || 0);
    }
  } catch (error) {
    console.log(error);
  }
};

const handlePageChange = (page) => {
  cur.value = page;
  fetchList();
};

const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id);
};

const handleSearch = () => {
  cur.value = 1;
  fetchList();
};

const resetSearch = () => {
  search.title = '';
  search.oper_name = '';
  search.business_type = '';
  search.operator_type = '';
  search.status = '';
  cur.value = 1;
  fetchList();
};

const handleBatchDel = async () => {
  try {
    const res = await remove({ ids: selectedIds.value });
    if (res.code === 0) {
      ElMessage.success('删除成功 ^_^');
      fetchList();
    }
  } catch (error) {
    console.log(error);
  }
};

const handleClear = async () => {
  try {
    const res = await clear();
    if (res.code === 0) {
      ElMessage.success('清空成功 ^_^');
      fetchList();
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  fetchList();
});
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

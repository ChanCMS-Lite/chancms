<template>
  <div class="bg-fff radius-6 pd-20">
    <div class="flex justify-end mb-10">
      <router-link
        :to="{
          name: 'field-edit',
          query: {
            mid: query.mid,
            table: tableName,
            model: modelName,
          },
        }"
      >
        <el-button size="large" type="primary" round>新增</el-button>
      </router-link>
    </div>

    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      row-key="id"
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="field_label" label="字段名称">
        <template #default="scope">
          {{ scope.row.field_label || scope.row.cname }}
        </template>
      </el-table-column>
      <el-table-column prop="field_name" label="字段标识">
        <template #default="scope">
          {{ scope.row.field_name || scope.row.ename }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="字段类型" width="120"></el-table-column>
      <el-table-column prop="group_name" label="字段分组" width="120"></el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80">
        <template #default="scope">
          {{ scope.row.sort_order ?? scope.row.orderBy ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="必填" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.is_required ? 'danger' : 'info'">
            {{ scope.row.is_required ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button :icon="Edit" circle @click="toEdit(scope.row)"></el-button>
          <el-button
            :icon="Delete" v-permission="['cms:field:delete']"
            circle
            @click="handleDel(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

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
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Delete, Edit } from '@element-plus/icons-vue';
import { list, del } from '@/api/field.js';

const route = useRoute();
const router = useRouter();

const query = ref({ mid: route.query.mid });
const modelName = ref('');
const tableName = ref('');
const multipleSelection = ref([]);
const tableData = ref([]);
const count = ref(0);
const cur = ref(1);
const pageSize = ref(20);
const loading = ref(true);

const fetchData = async () => {
  try {
    const res = await list(query.value.mid, cur.value);
    if (res.code === 0) {
      const data = res.data;
      tableData.value = data.list || [];
      count.value = Number(data.total || 0);

      // 适配新的 model 结构
      if (data.model && data.model.length > 0) {
        modelName.value = data.model[0].model;
        tableName.value = data.model[0].tableName;
      } else if (data.model) {
        modelName.value = data.model.model;
        tableName.value = data.model.tableName;
      }

      loading.value = false;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const handlePageChange = (page) => {
  cur.value = page;
  sessionStorage.setItem('cur', page);
  fetchData();
};

const toEdit = (e) => {
  const { id } = e;
  const fieldName = e.field_name || e.ename;
  router.push({
    name: 'field-edit',
    query: {
      fid: id,
      mid: query.value.mid,
      table: fieldName,
      model: modelName.value,
    },
  });
};

const handleDel = async (e) => {
  let { id } = e;
  try {
    let res = await del(id);
    if (res.code === 0) {
      ElMessage({
        message: '删除成功 ^_^',
        type: 'success',
      });
      fetchData();
    } else {
      ElMessage({
        message: '当前模型正在使用，字段不能删除 ^_^',
        type: 'warning',
      });
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchData();
});

onActivated(() => {
  fetchData();
});
</script>

<style scoped></style>

<template>
  <div class="bg-fff radius-6 pd-20">
    <div class="flex justify-end mb-10">
      <el-button size="large" type="primary" @click="handleAdd" round>新增</el-button>
    </div>

    <div class="mr-10 ml-10">
      <el-table :data="state.list" tooltip-effect="dark" row-key="id" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="id" width="100" label="编号"></el-table-column>
        <el-table-column prop="type_code" label="标识"></el-table-column>
        <el-table-column prop="config_key" label="配置名称"></el-table-column>
        <el-table-column prop="remark" label="描述"></el-table-column>
        <el-table-column prop="status" label="是否启用">
          <template #default="scope">
            {{ scope.row.status == 1 ? "启用" : "关闭" }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="200" label="操作">
          <template #default="scope">

            <el-button :icon="Edit"  circle @click="toEdit(scope.row)"></el-button>

            <el-popconfirm width="220" @confirm="() => handleDel(scope.row)" confirm-button-text="确定"
              cancel-button-text="取消" icon-color="#626AEF" title="你确定吗？要删除该配置？">
              <template #reference>
                <el-button :icon="Delete" v-permission="['base:config:delete']" :disabled="scope.row.is_system === 1" circle></el-button>
              </template>
            </el-popconfirm>
            <el-tooltip v-if="scope.row.is_system === 1" content="系统内置配置不可删除，仅可修改" effect="light"
              placement="top-start">
              <el-icon class="ml-10 t-4 pointer">
                <QuestionFilled class="c-165dff" />
              </el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 新增&编辑弹窗 -->
    <Dialog v-model:visible="state.dialogVisible" :id="state.id" :type_code="state.params.type_code">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router'
import {Delete, Edit, QuestionFilled } from "@element-plus/icons-vue";
import { list, remove } from "./api/index.js";
import Dialog from './components/dialog.vue'

const multipleSelection = ref([]);
const count = ref(0);
const cur = ref(1);
const pageSize = ref(20);

const state = reactive({
  dialogVisible: false,
  id: 0,
  params: {
    type_code: '',
  },
  list: [],
})

const route = useRoute()

watch(() => state.dialogVisible, (newVal) => {
  if (!newVal) {
    getConfigTypeList();
  }
});

const getConfigTypeList = async () => {
  try {
    let params = state.params;
    const res = await list(params);
    if (res.code === 0) {
      state.list = [...res.data.list];
      count.value = Number(res.data.total || 0);
      cur.value = 1;
      pageSize.value = res.data.pageSize || 20;
    }
  } catch (error) {
    console.log(error);
  }
};

const handlePageChange = (page) => {
  cur.value = page;
  getConfigTypeList();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

//编辑
const toEdit = row => {
  state.id = row.id
  state.dialogVisible = true
}
//新增
const handleAdd = () => {
  state.id = 0
  state.dialogVisible = true
}

const handleDel = async (e) => {
  try {
    const { id } = e;
    const res = await remove({ id });
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage.success('删除成功 ^_^');
      getConfigTypeList();
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  state.params.type_code = route.params.id;
  getConfigTypeList();
});
</script>
<style scoped></style>

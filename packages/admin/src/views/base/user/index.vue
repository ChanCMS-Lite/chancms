<template>
  <div class="bg-fff radius-6 pd-20">
    <div class="flex justify-end mb-10">
      <el-button v-if="isSuper" size="large" type="primary"  @click="handleAdd" round>新增</el-button>
    </div>

    <div class="mr-10 ml-10">
      <el-table :data="state.list" tooltip-effect="dark" row-key="id" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="id" width="100" label="编号"></el-table-column>
        <el-table-column prop="username" label="管理员"></el-table-column>
        <el-table-column prop="roles" label="角色">
          <template #default="scope">
            {{ scope.row.roles?.map(r => r.name).join('，') || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            {{ scope.row.status == 1 ? "启用" : "关闭" }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="240" label="操作">
          <template #default="scope">
            <el-button :icon="Edit" circle title="编辑 / 修改密码" @click="toDetail(scope.row)"></el-button>
            <el-button :icon="View" circle title="浏览" @click="toDetail(scope.row)"></el-button>

            <el-popconfirm v-if="isSuper" width="220"  @confirm="() => handleDel(scope.row)" confirm-button-text="确定"
              cancel-button-text="取消" icon-color="#626AEF" title="你确定吗？要删管理员？">
              <template #reference>
                <el-button :icon="Delete" v-permission="['base:user:delete']"  :disabled="username === scope.row.username" circle></el-button>
              </template>
            </el-popconfirm>
            <el-tooltip v-if="username === scope.row.username" content="当前登录用户不可删除" effect="light"
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

    <!-- 新增弹窗（编辑统一走「用户详情」页，弹窗只服务新增） -->
    <Dialog v-model:visible="state.dialogVisible">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Delete, View, Edit, QuestionFilled } from "@element-plus/icons-vue";
import { list, remove } from "./api/index.js";
import { userStore } from "@/stores/user.js";
import Dialog from './components/dialog.vue';

const user = userStore();
const router = useRouter();
const username = user.userInfo?.username;
// 超管判定：权限列表含 *:*:* 通配（与后端 permMatches 一致）
const isSuper = computed(() => user.perms.includes('*:*:*'));
const multipleSelection = ref([]);
const count = ref(0);
const cur = ref(1);
const pageSize = ref(20);

const state = reactive({
  dialogVisible: false,
  params: {},
  list: [],
})

watch(() => state.dialogVisible, (newVal) => {
  if (!newVal) {
    fetchUsers();
  }
});

const fetchUsers = async () => {
  try {
    const res = await list({ cur: cur.value, pageSize: pageSize.value });
    if (res.code === 0) {
      state.list = [...res.data.list];
      count.value = Number(res.data.total || 0);
    }
  } catch (error) {
    console.log(error);
  }
};

const handlePageChange = (page) => {
  cur.value = page;
  fetchUsers();
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

//浏览：进「用户详情」页
// · 看自己（任何角色）→ 只改密码（新密码 + 确认密码）
// · 超管看别人      → 编辑 用户名 / 角色 / 状态 + 重置密码
// 「编辑」不再单独开弹窗 —— 原弹窗只服务于「新增」，避免同一件事两套界面
const toDetail = (row) => {
  router.push(`/user/detail/${row.id}`)
}
//新增（编辑统一走「用户详情」页，不再开弹窗）
const handleAdd = () => {
  state.dialogVisible = true
}


const handleDel = async (e) => {
  try {
    const { id } = e;
    const res = await remove({ id });
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage.success('删除成功 ^_^');
      fetchUsers();
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
<style scoped></style>

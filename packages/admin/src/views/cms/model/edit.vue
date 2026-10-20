<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form ref="formRef" :model="params" label-width="84px" label-position="top" class="mt-20">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="模型名称" prop="model" :rules="rules.model">
            <el-input v-model="params.model" placeholder="请输入模型名称"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="模型编码" prop="model_code" :rules="rules.model_code">
            <el-input v-model="params.model_code" placeholder="请输入模型编码"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="是否启用">
            <el-radio-group v-model="params.status">
              <el-radio :value="1">开启</el-radio>
              <el-radio :disabled="disable" :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注" prop="remark" :rules="rules.remark">
            <el-input v-model="params.remark" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="handleSubmit" v-permission="['cms:model:create', 'cms:model:update']">保存</el-button>
      <el-button size="large" @click="handleCancel">取消</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { create, update, hasUse, detail } from '@/api/model.js';

const router = useRouter();
const route = useRoute();
const isEdit = computed(() => !!route.params.id);

const formRef = ref(null);

const params = reactive({
  id: 0,
  model: '',
  model_code: '',
  remark: '',
  status: 1,
});

const disable = ref(false);

const rules = reactive({
  model: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  model_code: [
    { required: true, message: '请输入模型编码', trigger: 'blur' }
  ],
  remark: [
    { required: true, message: '请输入备注', trigger: 'blur' }
  ]
});

function handleCancel() {
  router.go(-1);
}

const fetchDetail = async () => {
  if (!isEdit.value) return;
  try {
    const res = await detail(params.id);
    if (res.code === 0) {
      const data = res.data;
      data.status = +data.status;
      Object.assign(params, { ...data });
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

const checkUsage = async (id) => {
  if (!id) return;
  try {
    const res = await hasUse(id);
    if (res.code === 0) {
      disable.value = res.data.total > 0;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        saveChanges();
      } else {
        createModel();
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

async function createModel() {
  try {
    const res = await create({ ...params });
    if (res.code === 0) {
      ElMessage.success('创建成功^_^');
      router.go(-1);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

async function saveChanges() {
  try {
    const res = await update(params);
    if (res.code === 0) {
      ElMessage.success('更新成功^_^');
      router.go(-1);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const id = route.params.id;
    params.id = id;
    await fetchDetail();
    await checkUsage(id);
  }
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.id = newId;
    await fetchDetail();
    await checkUsage(newId);
  }
});
</script>

<style scoped>
/* 你可以在这里添加样式 */
</style>

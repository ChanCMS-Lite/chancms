<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form
        ref="formRef"
        :model="params"
        :rules="paramsRules"
        label-position="top"
        class="mt-20"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="params.title"></el-input>
      </el-form-item>

      <el-form-item label="链接">
        <el-input v-model="params.link"></el-input>
      </el-form-item>

      <el-form-item label="排序">
        <el-input v-model="params.orderBy"></el-input>
      </el-form-item>

      <el-form-item label="发布时间">
        <el-date-picker
          v-model="params.created_at"
          type="datetime"
          placeholder="选择发布时间"
          style="width: 100%"
        />
      </el-form-item>


    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="handleSubmit" v-permission="['cms:friendlink:create', 'cms:friendlink:update']">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { create, update, detail } from '@/api/friendlink.js';
import DynamicForm from '@/components/DynamicForm.vue'
import { useExtModel } from '@/composables/useExtModel.js'

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);

const formRef = ref(null);

// 通用扩展模型（选择模型 → 渲染 DynamicForm → 收集 ext_data）
const {
  modelOptions,
  field,
  extData,
  dynamicFormRef,
  selectedMid,
  loadModels,
  handleModelChange,
  initExtData,
  buildExtData,
} = useExtModel({ locked: true });

const params = reactive({
  id: 0,
  title: '',
  link: '',
  orderBy: 0,
  // 发布时间（后台可编辑；不填则由 DB 默认写入创建时间）
  created_at: null,
});

const paramsRules = reactive({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 20, message: '标题长度在 2 到 20 个字符之间', trigger: 'blur' },
  ],
});

onMounted(async () => {
  await loadModels();
  if (isEdit.value) {
    params.id = route.params.id;
    await fetchDetail();
  }
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.id = newId;
    await fetchDetail();
  }
});

const fetchDetail = async () => {
  if (!params.id) return;
  try {
    const res = await detail(params.id);
    if (res.code === 0) {
      Object.assign(params, res.data);
      // 发布时间回填为 Date（el-date-picker 需要 Date 对象才能正确显示）；无值则留空
      params.created_at = res.data.created_at ? new Date(res.data.created_at) : null;
      // 初始化扩展模型字段
      selectedMid.value = res.data.mid ? Number(res.data.mid) : 0;
      initExtData(res.data.ext_data);
      await handleModelChange(selectedMid.value);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 校验扩展字段
      if (field.value.length > 0 && dynamicFormRef.value) {
        const r = dynamicFormRef.value.validate();
        if (!r.valid) {
          ElMessage({ message: r.messages[0] || '请填写必填扩展字段', type: 'warning' });
          return false;
        }
      }
      if (isEdit.value) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } else {
      return false;
    }
  });
};

const handleCreate = async () => {
  try {
    const payload = { ...params, mid: selectedMid.value, ext_data: buildExtData() };
    const res = await create(payload);
    if (res.code === 0) {
      ElMessage({
        message: '新增成功^_^',
        type: 'success',
      });
      router.go(-1);
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

const handleUpdate = async () => {
  try {
    const payload = { ...params, mid: selectedMid.value, ext_data: buildExtData() };
    const res = await update(payload);
    if (res.code === 0) {
      ElMessage({
        message: '更新成功^_^',
        type: 'success',
      });
      router.go(-1);
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

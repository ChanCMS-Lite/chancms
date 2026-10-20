<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form ref="paramsForm" :model="params" label-width="84px" label-position="top" class="mt-20">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="留言类型" prop="type">
            <el-select v-model="params.type" placeholder="请选择类型" style="width: 100%">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="留言标题" prop="title">
            <el-input v-model="params.title"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="姓名" prop="name" :rules="[
          {
            required: true,
            message: '请输入姓名',
            trigger: 'blur',
          },
        ]">
            <el-input v-model="params.name"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="tel" :rules="[
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
        ]">
            <el-input v-model="params.tel"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="公司单位">
            <el-input v-model="params.company"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="微信">
            <el-input v-model="params.wechat"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="邮箱">
            <el-input v-model="params.email" placeholder="选填"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="留言内容" prop="content" :rules="[
          {
            required: true,
            message: '请输入内容',
            trigger: 'blur',
          },
        ]">
            <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="params.content"></el-input>
          </el-form-item>
        </el-col>

      </el-row>

    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit" v-permission="['cms:message:update']">保存</el-button>
      <el-button size="large" @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { create, update, detail } from "@/api/message.js";
import DynamicForm from '@/components/DynamicForm.vue'
import { useExtModel } from '@/composables/useExtModel.js'

const router = useRouter();
const route = useRoute();
const isEdit = computed(() => !!route.params.id);

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

const params = ref({
  id: 0,
  type: '',
  title: '',
  name: '',
  tel: '',
  company: '',
  wechat: '',
  email: '',
  content: ''
});

const paramsForm = ref(null);

const options = [
  { label: "咨询", value: "1" },
  { label: "建议", value: "2" },
  { label: "投诉", value: "3" },
  { label: "其他", value: "4" }
];

onMounted(async () => {
  await loadModels();
  if (isEdit.value) {
    params.value.id = route.params.id;
    await fetchDetail();
  }
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.value.id = newId;
    await fetchDetail();
  }
});

const fetchDetail = async () => {
  if (!params.value.id) return;
  try {
    const res = await detail(params.value.id);
    if (res.code === 0) {
      delete res.data.updated_at;
      Object.assign(params.value, res.data);
      // 初始化扩展模型字段
      selectedMid.value = res.data.mid ? Number(res.data.mid) : 0;
      initExtData(res.data.ext_data);
      await handleModelChange(selectedMid.value);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取详情失败');
  }
};

const goBack = () => {
  router.go(-1);
};

const submit = () => {
  paramsForm.value.validate((valid) => {
    if (valid) {
      // 校验扩展字段
      if (field.value.length > 0 && dynamicFormRef.value) {
        const r = dynamicFormRef.value.validate();
        if (!r.valid) {
          ElMessage({ message: r.messages[0] || '请填写必填扩展字段', type: 'warning' });
          return;
        }
      }
      // 空字符串统一转 null，避免 type(enum) 列插入空串报错；varchar 列 null 也安全
      const payload = { ...params.value };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') payload[k] = null;
      });
      // 并入扩展模型数据
      payload.mid = selectedMid.value;
      payload.ext_data = buildExtData();
      if (isEdit.value) {
        handleUpdate(payload);
      } else {
        handleCreate(payload);
      }
    } else {
      console.log("error submit!!");
    }
  });
};

const handleCreate = async (payload) => {
  try {
    const res = await create(payload);
    if (res.code == 0) {
      ElMessage.success('新增成功^_^');
      router.go(-1);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('新增失败');
  }
};

const handleUpdate = async (payload) => {
  try {
    const res = await update(payload);
    if (res.code == 0) {
      ElMessage.success('更新成功^_^');
      router.go(-1);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('更新失败');
  }
};
</script>

<style scoped>
.w-90 {
  width: 90px;
  display: inline-block;
}
</style>

<template>
  <div class="mr-10 ml-10">
    <el-tab-pane label="应用配置" class="mt-20" name="config">
      <el-form ref="setFormRef" :model="state.set" label-width="84px" label-position="top">
        <el-row :gutter="20" class="w-full">
          <el-col :span="12">
        <el-form-item prop="template" label="模板">
          <el-select v-model="state.set.template" placeholder="请选择模板">
            <el-option
              v-for="(item, index) in state.folderList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="12">

        <el-form-item label="上传方式">
          <!-- Lite：仅保留本地上传（普通），云存储已裁剪，锁死为普通 -->
          <el-radio-group v-model="state.set.uploadWay" class="ml-4" disabled>
            <el-radio value="1">普通（本地）</el-radio>
          </el-radio-group>
        </el-form-item>
        </el-col>
        <!-- Lite 裁剪：站点全局模型下拉已移除（仅文章挂模型） -->
        </el-row>
      </el-form>
    </el-tab-pane>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

import { getSiteInfo } from "../api/index.js";
import { folder } from '@/api/sys_config.js';
import { loadUploadConfig } from "@/utils/upload.js";
import { useExtModel } from "@/composables/useExtModel.js";
import DynamicForm from "@/components/DynamicForm.vue";
import { QuestionFilled } from "@element-plus/icons-vue";

const state = reactive({
  loading: true,
  folderList: [],
  set: {
    id: 0,
    template: 'default',
    uploadWay: '1', // 1->普通 2->七牛云 3->阿里云OSS 4->腾讯云COS
  },
});

const setFormRef = ref(null);

// 模型与扩展字段(已裁剪)
const safeParse = (str) => {
  if (!str) return {};
  if (typeof str !== 'string') return str;
  try { return JSON.parse(str); } catch { return {}; }
};

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

onMounted(async () => {
  await loadUploadConfig();
  await loadModels();
  await query();
  await getFolder();
});

async function getFolder() {
  try {
    const res = await folder();
    if (res.code === 0) {
      res.data.forEach((item) => {
        state.folderList.push({ label: item, value: item });
      });
    }
  } catch (error) {
    console.log(error);
  }
}

// 查询
async function query() {
  try {
    const res = await getSiteInfo();

    if (res.code === 0) {
      const { id, template, uploadWay, ext_data } = res.data;
      state.loading = false;
      state.set = { id, template, uploadWay };
      // 同步页面模型：ext_data 内嵌 mid
      initExtData(ext_data);
      const parsedExt = ext_data && (typeof ext_data === 'string' ? safeParse(ext_data) : ext_data);
      selectedMid.value = parsedExt?.mid ?? 0;
      await handleModelChange(selectedMid.value);
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({ message: res.msg, type: 'error' });
    }
  } catch (error) {
    console.log(error);
  }
}

// 暴露给父组件，用于合并保存
const buildSiteExtData = () => {
  return selectedMid.value
    ? { mid: Number(selectedMid.value), ...buildExtData() }
    : null;
};

defineExpose({
  validate: () => setFormRef.value.validate(),
  getSet: () => ({
    ...state.set,
    ext_data: buildSiteExtData()
  })
});
</script>

<style scoped>
.qrcode {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  overflow: hidden;
}
.qrcode:hover {
  border: 1px dashed #f6f6f6;
}

.ml-20 {
  margin-left: 20px;
}
.pointer {
  cursor: pointer;
}
.c-165dff {
  color: #2563eb;
}
</style>

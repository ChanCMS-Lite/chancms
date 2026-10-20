<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form
        ref="formRef"
        :model="params"
        label-width="84px"
        class="mt-20"
      v-loading="loading"
      :rules="rules"
      >
      <el-row :gutter="20">
      <el-col :span="24">
      <el-form-item
        label="轮播标题"
        prop="title"
      >
        <el-input v-model="params.title"></el-input>
      </el-form-item>
      </el-col>

      <el-col :span="24">
      <el-form-item label="轮播图">
        <div class="thumb-input-row">
          <el-upload
            class="avatar-uploader"
            :http-request="getUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-popover
              placement="top-start"
              title="上传"
              :width="200"
              trigger="hover"
              :content="uploadTip('image', '上传图片作为封面图')"
            >
              <template #reference>
                <el-icon class="avatar-uploader-icon">
                  <MostlyCloudy />
                </el-icon>
              </template>
            </el-popover>
          </el-upload>

          <el-popover
            v-if="params.imgUrl"
            placement="right"
            :width="600"
            trigger="hover"
          >
            <template #reference>
              <el-image
                class="avatar-uploader-icon pointer"
                :src="params.imgUrl"
              />
            </template>
            <el-image style="width: 100%" :src="params.imgUrl" />
          </el-popover>

          <el-input v-model="params.imgUrl" />
        </div>
      </el-form-item>
      </el-col>

      <el-col :span="24">
      <el-form-item label="轮播链接">
        <el-input v-model="params.linkUrl"></el-input>
      </el-form-item>
      </el-col>

      <!-- Lite 裁剪：轮播全局展示，不绑归属栏目 -->

      <el-col :span="24">
      <el-form-item label="轮播文案">
          <vue3-tinymce
            v-model="params.content"
            :setting="setting"
            @init="tinymce"
            script-src="/public/admin/tinymce/tinymce.min.js"
          />
      </el-form-item>
      </el-col>

      <el-col :span="24">
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="params.created_at"
          type="datetime"
          placeholder="选择发布时间"
          style="width: 100%"
        />
      </el-form-item>
      </el-col>

      </el-row>

    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit" v-permission="['cms:slide:create', 'cms:slide:update']">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { create, update, detail } from '@/api/slide.js';
import { find } from '@/api/category.js';
import { tree, addLabelValue } from '@/utils/tool.js';
import { upload } from '@/api/upload.js';
import { loadUploadConfig, beforeImageUpload, uploadTip, resolveOssUrl } from '@/utils/upload.js';
import Vue3Tinymce from '@/components/Vue3Tinymce/src/Main.vue'
import DynamicForm from '@/components/DynamicForm.vue'
import { useExtModel } from '@/composables/useExtModel.js'
import { tinymceSet, getTinymceUploadUrl } from '@/config/tinymce.js'

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);

const formRef = ref(null);
const setting = reactive(tinymceSet)
const loading = ref(true)

// 扩展字段(已裁剪)
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

const rules = {
  imgUrl: [
    {
      required: true,
      message: '请上传图片',
      trigger: 'blur',
    },
  ],
};

const params = reactive({
  id: 0,
  title: "",
  imgUrl: "",
  content: "",
  linkUrl: "",
  // 归属栏目：null = 全局；N = 绑定栏目（含子孙可见，同位置优先于全局轮播）
  cid: null,
  // 发布时间（后台可编辑；不填则由 DB 默认写入创建时间）
  created_at: null,
});

// 归属栏目树（全量，不做域过滤——轮播是横切展示内容，可绑任意栏目页）
const categoryOptions = ref([]);
const loadCategories = async () => {
  try {
    const res = await find();
    if (res.code === 0) {
      categoryOptions.value = addLabelValue(tree(res.data || []));
    }
  } catch (e) {
    console.error(e);
  }
};

// TinyMCE 初始化
const tinymce = () => {
  loading.value = false
}

onMounted(async () => {
  setting.images_upload_url = await getTinymceUploadUrl()
  await loadUploadConfig()
  await loadModels()
  await loadCategories()
  loading.value = false
  if (isEdit.value) {
    params.id = parseInt(route.params.id, 10);
    await fetchDetail();
  }
});

watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.id = parseInt(newId, 10);
    await fetchDetail();
  }
});

async function fetchDetail() {
  if (!params.id) return;
  try {
    let res = await detail(params.id);
    if (res.code === 0) {
      Object.assign(params, res.data);
      // 发布时间回填为 Date（el-date-picker 需要 Date 对象才能正确显示）；无值则留空
      params.created_at = res.data.created_at ? new Date(res.data.created_at) : null;
      // 归属栏目回显（null = 全局）
      params.cid = res.data.cid ? Number(res.data.cid) : null;
      // 回填 mid(已裁剪)
      selectedMid.value = res.data.mid ? Number(res.data.mid) : 0;
      initExtData(res.data.ext_data);
      await handleModelChange(selectedMid.value);
    } else {
      ElMessage({
        message: res.msg,
        type: "error",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function beforeUpload(rawFile) {
  return beforeImageUpload(rawFile, 'image');
}

async function getUpload(file) {
  const formData = new FormData();
  formData.append("file", file.file);
  try {
    let res = await upload(formData, 'image');
    if (res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
      params.imgUrl = resolveOssUrl(res.data[0], res.provider);
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleCreate() {
  try {
    const payload = { ...params, mid: selectedMid.value, ext_data: buildExtData() };
    let res = await create(payload);
    if (res.code === 0) {
      ElMessage({
        message: "新增成功^_^",
        type: "success",
      });
      router.back();
    } else {
      ElMessage({
        message: res.msg,
        type: "error",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateSlide() {
  try {
    const payload = { ...params, mid: selectedMid.value, ext_data: buildExtData() };
    let res = await update(payload);
    if (res.code == 0) {
      ElMessage({
        message: "更新成功^_^",
        type: "success",
      });
      router.go(-1);
    } else {
      ElMessage({
        message: res.msg,
        type: "error",
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function submit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        updateSlide();
      } else {
        handleCreate();
      }
    } else {
      console.log("error submit!!");
      return false;
    }
  });
}
</script>

<style scoped>
.thumb-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.thumb-input-row > .el-input {
  flex: 1;
}
</style>

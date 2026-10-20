<template>
  <div class="image-uploader">
    <!-- 统一多图模式，maxCount=1 即单图 -->
    <div class="image-list-horizontal">
      <div
        v-for="(item, index) in imageList"
        :key="index"
        class="image-thumb"
      >
        <div class="thumb-preview">
          <template v-if="item.url">
            <el-image
              :src="item.url"
              :preview-src-list="previewList"
              :initial-index="index"
              fit="cover"
              class="preview-image"
            >
              <!-- 🔴 加载失败占位（2026-09-01）：与 v-else 的"点击编辑"区分，
                告诉用户图存在但 URL 失效/不可访问，需要重新编辑而不是重新上传 -->
              <template #error>
                <div class="empty-thumb thumb-error" @click.stop="openEditDialog(index)">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败，点击编辑</span>
                </div>
              </template>
            </el-image>
          </template>
          <div v-else class="empty-thumb">
            <el-icon><Picture /></el-icon>
            <span>点击编辑</span>
          </div>
          <span class="thumb-index">{{ index + 1 }}</span>
          <el-icon class="thumb-edit" title="编辑" @click.stop="openEditDialog(index)"><Edit /></el-icon>
          <el-icon class="thumb-close" title="删除" @click.stop="removeImage(index)"><CircleCloseFilled /></el-icon>
        </div>
      </div>

      <!-- 上传按钮（支持一次选择多张） -->
      <el-upload
        v-if="imageList.length < maxCount"
        class="upload-thumb-btn"
        :http-request="handleUpload"
        :show-file-list="false"
        :before-upload="beforeUpload"
        accept="image/*"
        multiple
      >
        <div class="thumb-add" title="按住 Ctrl/Cmd 可一次选择多张">
          <el-icon><Plus /></el-icon>
        </div>
      </el-upload>

      <!-- 添加链接按钮 -->
      <div
        v-if="imageList.length < maxCount"
        class="upload-thumb-btn"
        @click="addImageUrl"
      >
        <div class="thumb-add link-add" title="添加图片链接">
          <el-icon><Link /></el-icon>
        </div>
      </div>
    </div>

    <div v-if="maxCount > 1" class="upload-tip">
      最多 {{ maxCount }} 张，当前 {{ imageList.length }} 张
    </div>

    <!-- 编辑弹窗：预览 + 改标题/链接 -->
    <el-dialog
      v-model="editDialogVisible"
      title="图片编辑"
      width="460px"
      align-center
      destroy-on-close
    >
      <div v-if="editItem" class="edit-dialog-body">
        <div class="edit-preview">
          <template v-if="editItem.url">
            <el-image
              :src="editItem.url"
              :preview-src-list="[editItem.url]"
              fit="contain"
              class="edit-preview-image"
            />
          </template>
          <div v-else class="empty-preview">
            <el-icon><Picture /></el-icon>
            <span>暂无图片，请填写链接或上传</span>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="图片链接">
            <el-input
              v-model="editItem.url"
              placeholder="图片 URL，支持粘贴网络地址"
              clearable
            >
              <template #append>
                <el-upload
                  class="inline-upload"
                  :http-request="(opts) => handleUpload(opts, editIndex)"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  accept="image/*"
                >
                  <el-button :icon="Upload" />
                </el-upload>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item v-if="showDescription" label="图片标题/描述">
            <el-input
              v-model="editItem.description"
              placeholder="输入图片描述"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { Plus, CircleCloseFilled, Upload, Link, Picture, Edit } from '@element-plus/icons-vue';
import { upload } from '@/api/upload.js';
import { checkUploadSize, loadUploadConfig, extractUrl } from '@/utils/upload.js';

const props = defineProps({
  modelValue: {
    type: [String, Array, Object],
    default: ''
  },
  // 最大图片数，1=单图模式，>1=多图模式
  maxCount: {
    type: Number,
    default: 10
  },
  fieldConfig: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// 配置项（兼容旧 fieldConfig.maxCount 用法）
const computedMax = computed(() => props.fieldConfig?.maxCount || props.maxCount);
const maxCount = computedMax;
const showDescription = computed(() => props.fieldConfig?.showDescription !== false);

// 统一用数组管理
const imageList = ref([]);
const editDialogVisible = ref(false);
const editIndex = ref(-1);
const editItem = ref(null);

// 是否单图模式
const isSingle = computed(() => maxCount.value === 1);

// 大图预览列表（只包含有 url 的图片）
const previewList = computed(() => imageList.value.map(item => item.url).filter(Boolean));

// 初始化数据：把 string/{url,desc}/array 统一转成内部数组
const initData = () => {
  const list = [];
  if (Array.isArray(props.modelValue)) {
    props.modelValue.forEach(item => {
      if (typeof item === 'string') list.push({ url: item, description: '' });
      else if (item && typeof item === 'object') list.push({ url: item.url || '', description: item.description || '' });
    });
  } else if (typeof props.modelValue === 'string' && props.modelValue) {
    list.push({ url: props.modelValue, description: '' });
  } else if (props.modelValue && typeof props.modelValue === 'object') {
    list.push({ url: props.modelValue.url || '', description: props.modelValue.description || '' });
  }
  imageList.value = list;
};

initData();

let syncVersion = 0;
// 🔴 回声指纹（根因修复 2026-08-21）：记录最后一次 emit 的 JSON。
// 本组件 emit → DynamicForm.formData 更新 → 本组件 watch(modelValue) 又收到同一份数据。
// 若不识别回声：initData 重建 imageList → watch(imageList) 再次 emit（新数组）→ 无限回声循环，
// 导致 DynamicForm 的 150ms 防抖 emit 永不触发 → 父组件 ext_data 永不更新 → 保存丢失。
let lastEmittedJson = null;
// 占位上传中数量，避免外部回灌冲掉占位项
let uploadingCount = 0;

watch(() => props.modelValue, (val) => {
  // 收到的 modelValue 与上次自身 emit 完全一致 → 是本组件自己的回声，跳过重同步（打破循环）
  if (lastEmittedJson != null && (typeof val === 'string' || Array.isArray(val) || (val && typeof val === 'object'))) {
    try {
      if (JSON.stringify(val) === lastEmittedJson) return;
    } catch { /* 序列化失败不拦截，走正常同步 */ }
  }
  syncVersion++;
  if (uploadingCount > 0) return;
  initData();
}, { deep: true });

const beforeUpload = async (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  // 上传前确保已加载后台 sys_config.upload_config（幂等：全局仅请求一次，之后走内存缓存）。
  // 由组件自身兜底拉取，不再依赖宿主页面是否调用过 loadUploadConfig，
  // 避免未加载时回落到 utils/upload.js 的硬编码默认值，导致后台配置看起来「不生效」。
  await loadUploadConfig();
  return checkUploadSize(file, 'image');
};

const handleUpload = async (options, index = -1) => {
  const { file } = options;

  // 多图新增：先占位再上传，保证并发时按选择顺序入列
  let placeholderIndex = -1;
  if (index < 0) {
    if (imageList.value.length >= maxCount.value) {
      ElMessage.warning(`最多 ${maxCount.value} 张图片`);
      return;
    }
    placeholderIndex = imageList.value.push({ url: '', description: '', _uid: file.uid }) - 1;
    uploadingCount++;
    updateValue();
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await upload(formData, 'image');
    const url = extractUrl(result);

    if (!url) throw new Error('未获取到图片地址');

    const clearUploading = (target) => {
      if (target) {
        delete target._uploading;
        delete target._progress;
        delete target._uid;
      }
    };

    if (index >= 0) {
      // 替换指定位置图片
      imageList.value[index].url = url;
      clearUploading(imageList.value[index]);
      if (editIndex.value === index && editItem.value) {
        editItem.value.url = url;
      }
    } else if (placeholderIndex >= 0) {
      // 回填占位项
      const item = imageList.value[placeholderIndex];
      if (item && item._uid === file.uid) {
        item.url = url;
        clearUploading(item);
      } else {
        const idx = imageList.value.findIndex(it => it._uid === file.uid);
        if (idx >= 0) {
          imageList.value[idx].url = url;
          clearUploading(imageList.value[idx]);
        } else {
          imageList.value.push({ url, description: '' });
        }
      }
    } else {
      imageList.value.push({ url, description: '' });
    }

    updateValue();
    ElMessage.success('上传成功');
  } catch (error) {
    if (placeholderIndex >= 0) {
      const idx = imageList.value.findIndex(it => it._uid === file.uid);
      if (idx >= 0) imageList.value.splice(idx, 1);
      updateValue();
    }
    console.error('上传失败:', error);
    ElMessage.error(error.message || '上传失败');
  } finally {
    if (placeholderIndex >= 0) {
      // 🔴 不再无条件 initData（2026-09-01 修复）：
      // 原 finally 在 uploadingCount→0 时用 props.modelValue 覆盖 imageList，
      // 但 finally 是同步执行、props.modelValue 的更新走 DynamicForm 异步链路（150ms 防抖），
      // 此时 props.modelValue 仍是旧值 → 覆盖掉刚回填的 url → 页面显示占位而非图片。
      // 修复：只减计数。DynamicForm 链路回传的 modelValue 会被 watch(modelValue) 正常 initData（uploadingCount 已归 0）。
      uploadingCount = Math.max(0, uploadingCount - 1);
    }
  }
};

const addImageUrl = () => {
  if (imageList.value.length >= maxCount.value) {
    ElMessage.warning(`最多 ${maxCount.value} 张图片`);
    return;
  }
  imageList.value.push({ url: '', description: '' });
  updateValue();
  openEditDialog(imageList.value.length - 1);
};

const openEditDialog = (index) => {
  if (index < 0 || index >= imageList.value.length) return;
  editIndex.value = index;
  editItem.value = {
    url: imageList.value[index].url || '',
    description: imageList.value[index].description || ''
  };
  editDialogVisible.value = true;
};

const confirmEdit = () => {
  if (editIndex.value < 0 || !editItem.value) return;

  // 兼容弹窗打开期间外部数据被清空导致索引失效的情况
  if (!imageList.value[editIndex.value]) {
    // 如果 url 非空，当作新增补到末尾；否则仅关闭弹窗
    if (editItem.value.url) {
      imageList.value.push({
        url: editItem.value.url,
        description: editItem.value.description || ''
      });
      updateValue();
    }
    editDialogVisible.value = false;
    return;
  }

  imageList.value[editIndex.value].url = editItem.value.url || '';
  imageList.value[editIndex.value].description = editItem.value.description || '';
  updateValue();
  editDialogVisible.value = false;
};

// 对外 emit：
// - 单图模式 + 无描述：emit string
// - 单图模式 + 有描述：emit {url, description}
// - 多图模式：emit array
const updateValue = () => {
  const list = imageList.value.map(item => ({
    url: item.url || '',
    description: item.description || ''
  })).filter(item => item.url);  // 过滤掉空 url

  let out;
  if (isSingle.value) {
    if (list.length === 0) {
      out = '';
    } else {
      const first = list[0];
      out = (showDescription.value && first.description) ? { url: first.url, description: first.description } : first.url;
    }
  } else {
    out = list;
  }
  lastEmittedJson = JSON.stringify(out);
  emit('update:modelValue', out);
};

const removeImage = (index) => {
  imageList.value.splice(index, 1);
  updateValue();
};

// 防抖同步
watch(imageList, () => {
  const ver = syncVersion;
  setTimeout(() => {
    if (syncVersion === ver) updateValue();
  }, 50);
}, { deep: true });
</script>

<style scoped>
.image-list-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}
.image-thumb {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 80px;
}
.thumb-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: visible;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.thumb-preview:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}
.preview-image {
  width: 100%;
  height: 100%;
  display: block;
}
.preview-image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}
.thumb-edit,
.thumb-close {
  position: absolute;
  top: 2px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  padding: 4px;
  width: 18px;
  height: 18px;
  font-size: 14px;
  color: #fff;
  opacity: 1;
}
.thumb-edit {
  right: 24px;
}
.thumb-close {
  right: 2px;
}
.thumb-edit:hover,
.thumb-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}
.thumb-close:hover {
  background: rgba(245, 34, 45, 0.9);
}
.thumb-index {
  position: absolute;
  bottom: 2px;
  left: 2px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}
.empty-thumb {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 12px;
  gap: 4px;
}
.empty-thumb .el-icon {
  font-size: 24px;
}

/* 加载失败（复用 empty-thumb 布局，文字颜色稍深以区分"未传"灰色占位） */
.thumb-error {
  color: #909399;
  cursor: pointer;
}
.thumb-error:hover {
  color: #f56c6c;
  background: #fef0f0;
}

/* 编辑弹窗 */
.edit-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-preview {
  width: 100%;
  height: 220px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-preview-image {
  width: 100%;
  height: 100%;
}
.edit-preview-image :deep(.el-image__inner) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 14px;
  gap: 8px;
}
.empty-preview .el-icon {
  font-size: 48px;
}

/* 行内上传 */
.inline-upload :deep(.el-upload) {
  display: block;
}

/* 添加按钮 */
.upload-thumb-btn {
  display: inline-block;
  cursor: pointer;
}
.upload-thumb-btn :deep(.el-upload) {
  display: block;
}
.thumb-add {
  width: 80px;
  height: 80px;
  border: 1px dashed #f6f6f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.thumb-add.link-add {
  background: #f0f9ff;
  border-color: #b3d8ff;
  color: #409eff;
}
.thumb-add:hover {
  border-color: #409eff;
  color: #409eff;
  background: #f5f7fa;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>

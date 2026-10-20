<template>
  <div class="file-uploader">
    <!-- 统一多文件模式，maxCount=1 即单文件 -->
    <div class="file-list-vertical">
      <!-- 已有文件列表（含上传中占位） -->
      <div
        v-for="(item, index) in fileList"
        :key="index"
        class="file-item"
        :class="{ 'file-item-uploading': item._uploading }"
        @click="openEditDialog(index)"
      >
        <div class="file-item-left">
          <el-icon class="file-item-icon"><Document /></el-icon>
          <div class="file-item-info">
            <span class="file-item-name" :title="item.name">{{ item.name || '未命名文件' }}</span>
            <div v-if="item._uploading" class="file-item-progress">
              <el-progress :percentage="item._progress || 0" :show-text="true" :stroke-width="6" />
              <div v-if="item._syncing" class="sync-tip">{{ UPLOAD_TEXT.syncing }}</div>
            </div>
          </div>
        </div>
        <el-icon v-if="!item._uploading" class="file-item-close" @click.stop="removeFile(index)"><Close /></el-icon>
      </div>

      <!-- 上传按钮 + 添加链接 -->
      <div v-if="fileList.length < maxCount" class="file-actions">
        <el-upload
          class="file-upload-inline"
          :http-request="handleUpload"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :accept="accept"
          multiple
        >
          <el-button type="primary" plain>
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-upload>

        <el-button plain @click="addFileUrl">
          <el-icon><Link /></el-icon>
          添加链接
        </el-button>
      </div>

      <div v-if="maxCount > 1" class="upload-tip">
        最多 {{ maxCount }} 个，当前 {{ fileList.length }} 个
      </div>
    </div>

    <!-- 编辑弹窗：改名称/链接 -->
    <el-dialog
      v-model="editDialogVisible"
      title="文件编辑"
      width="460px"
      align-center
      destroy-on-close
    >
      <div v-if="editItem" class="edit-dialog-body">
        <div class="edit-preview">
          <div class="preview-icon-box">
            <el-icon class="preview-doc-icon"><Document /></el-icon>
            <span class="preview-filename">{{ editItem.name || '未命名文件' }}</span>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="文件名称">
            <el-input
              v-model="editItem.name"
              placeholder="文件名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="文件链接">
            <el-input
              v-model="editItem.url"
              placeholder="文件 URL，支持粘贴网络地址"
              clearable
            >
              <template #append>
                <el-upload
                  class="inline-upload"
                  :http-request="(opts) => handleUpload(opts, editIndex)"
                  :show-file-list="false"
                  :before-upload="beforeUpload"
                  :accept="accept"
                >
                  <el-button :icon="Upload" />
                </el-upload>
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <!-- 弹窗内上传进度：放在表单底部，上传时显示 -->
        <div v-if="editUploading" class="edit-upload-progress">
          <el-progress :percentage="editUploadProgress" :stroke-width="8" :show-text="true" />
          <div class="edit-upload-tip">
            <template v-if="editSyncing">{{ UPLOAD_TEXT.syncing }}</template>
            <template v-else>正在上传文件…</template>
          </div>
        </div>
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
import { Upload, Document, Close, Link } from '@element-plus/icons-vue';
import { upload } from '@/api/upload.js';
import { checkUploadSize, loadUploadConfig, extractUrl } from '@/utils/upload.js';
import { UPLOAD_TEXT } from '@/config/upload.js';

const props = defineProps({
  modelValue: {
    type: [String, Array, Object],
    default: ''
  },
  // 最大文件数，1=单文件模式，>1=多文件模式
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

// 兼容旧 fieldConfig.maxCount
const maxCount = computed(() => props.fieldConfig?.maxCount || props.maxCount);
const accept = computed(() => props.fieldConfig?.accept || '');

// 统一用数组管理
const fileList = ref([]);
const editDialogVisible = ref(false);
const editIndex = ref(-1);
const editItem = ref(null);
const editUploading = ref(false);
const editUploadProgress = ref(0);
// 进度到达 100% 后（服务器同步到第三方 OSS 阶段）的标志
const editSyncing = ref(false);

// 是否单文件模式
const isSingle = computed(() => maxCount.value === 1);

// 初始化数据：string/{url,name}/array 统一转成内部数组
const initData = () => {
  const list = [];
  if (Array.isArray(props.modelValue)) {
    props.modelValue.forEach((item, index) => {
      if (typeof item === 'string') {
        list.push({ name: item.split('/').pop() || `文件${index + 1}`, url: item });
      } else if (item && typeof item === 'object') {
        list.push({
          name: item.name || item.url?.split('/').pop() || `文件${index + 1}`,
          url: item.url || ''
        });
      }
    });
  } else if (typeof props.modelValue === 'string' && props.modelValue) {
    list.push({ name: props.modelValue.split('/').pop() || '文件1', url: props.modelValue });
  } else if (props.modelValue && typeof props.modelValue === 'object') {
    const url = props.modelValue.url || '';
    list.push({
      name: props.modelValue.name || (url ? url.split('/').pop() : '文件1'),
      url
    });
  }
  fileList.value = list;
};

initData();

let syncVersion = 0;
// 🔴 回声指纹（根因修复 2026-08-21）：记录最后一次 emit 的 JSON。
// 本组件 emit → DynamicForm.formData 更新 → 本组件 watch(modelValue) 又收到同一份数据。
// 若不识别回声：initData 重建 fileList → watch(fileList) 再次 emit（新数组）→ 无限回声循环，
// 导致 DynamicForm 的 150ms 防抖 emit 永不触发 → 父组件 ext_data 永不更新 → 保存丢失。
let lastEmittedJson = null;
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
  // 上传前确保已加载后台 sys_config.upload_config（幂等：全局仅请求一次，之后走内存缓存）。
  // 由组件自身兜底拉取，不再依赖宿主页面是否调用过 loadUploadConfig，
  // 避免未加载时回落到 utils/upload.js 的硬编码默认值，导致后台配置看起来「不生效」。
  await loadUploadConfig();
  if (!checkUploadSize(file, 'file')) return false;
  // 如果配置了 accept，进行二次校验
  if (accept.value) {
    const acceptedExts = accept.value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
    const isAccepted = acceptedExts.some(ext => {
      if (ext.startsWith('.')) return ext === fileExt;
      if (ext.includes('/*')) return file.type.startsWith(ext.replace('/*', '/'));
      return file.type === ext;
    });
    if (!isAccepted) {
      ElMessage.error(`仅支持 ${accept.value} 格式的文件`);
      return false;
    }
  }
  return true;
};

const handleUpload = async (options, index = -1) => {
  const { file } = options;

  // 多文件新增：先占位再上传
  let placeholderIndex = -1;
  if (index < 0) {
    if (fileList.value.length >= maxCount.value) {
      ElMessage.warning(`最多 ${maxCount.value} 个文件`);
      return;
    }
    placeholderIndex = fileList.value.push({
      name: file.name,
      url: '',
      _uid: file.uid,
      _uploading: true,
      _progress: 0,
    }) - 1;
    uploadingCount++;
    updateValue();
  }

  // 弹窗内替换上传：初始化弹窗级进度
  if (index >= 0) {
    editUploading.value = true;
    editUploadProgress.value = 0;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await upload(formData, 'file', {
      max: maxCount.value,
      onUploadProgress: (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        if (index >= 0) {
          editUploadProgress.value = percent;
          // 100% 仅代表文件已发到服务器，服务器还在同步到第三方 OSS，给提示避免误判完成
          if (percent >= 100) editSyncing.value = true;
        } else {
          const item = fileList.value.find(it => it._uid === file.uid);
          if (item) {
            item._progress = percent;
            if (percent >= 100) item._syncing = true;
          }
        }
      },
    });
    const url = extractUrl(result);

    if (!url) throw new Error('未获取到文件地址');

    // 上传成功，清理进度标记
    const clearUploading = (target) => {
      if (target) {
        delete target._uploading;
        delete target._progress;
        delete target._uid;
        delete target._syncing;
      }
    };

    if (index >= 0) {
      // 替换指定位置
      fileList.value[index].url = url;
      if (!fileList.value[index].name) fileList.value[index].name = file.name;
      clearUploading(fileList.value[index]);
      if (editIndex.value === index && editItem.value) {
        editItem.value.url = url;
        if (!editItem.value.name) editItem.value.name = file.name;
      }
      // 弹窗内替换上传完成：清理进度与同步态
      editUploading.value = false;
      editSyncing.value = false;
    } else if (placeholderIndex >= 0) {
      // 回填占位项
      const item = fileList.value[placeholderIndex];
      if (item && item._uid === file.uid) {
        item.url = url;
        if (!item.name) item.name = file.name;
        clearUploading(item);
      } else {
        const idx = fileList.value.findIndex(it => it._uid === file.uid);
        if (idx >= 0) {
          fileList.value[idx].url = url;
          if (!fileList.value[idx].name) fileList.value[idx].name = file.name;
          clearUploading(fileList.value[idx]);
        } else {
          fileList.value.push({ name: file.name, url });
        }
      }
    } else {
      const pushed = { name: file.name, url };
      fileList.value.push(pushed);
    }

    updateValue();
    ElMessage.success('上传成功');
  } catch (error) {
    if (placeholderIndex >= 0) {
      const idx = fileList.value.findIndex(it => it._uid === file.uid);
      if (idx >= 0) fileList.value.splice(idx, 1);
      updateValue();
    }
    console.error('上传失败:', error);
    ElMessage.error(error.message || '上传失败');
    // 失败也清理弹窗进度与同步态
    editUploading.value = false;
    editSyncing.value = false;
  } finally {
    if (placeholderIndex >= 0) {
      // 🔴 不再无条件 initData（2026-09-01 修复，参考 ImageUploader 同款 bug）：
      // 同步 finally + 异步 props.modelValue 链路 → 旧值覆盖刚回填的 url → 第一个上传不显示。
      uploadingCount = Math.max(0, uploadingCount - 1);
    }
  }
};

const addFileUrl = () => {
  if (fileList.value.length >= maxCount.value) {
    ElMessage.warning(`最多 ${maxCount.value} 个文件`);
    return;
  }
  fileList.value.push({ name: '', url: '' });
  updateValue();
  openEditDialog(fileList.value.length - 1);
};

const openEditDialog = (index) => {
  if (index < 0 || index >= fileList.value.length) return;
  editIndex.value = index;
  editItem.value = {
    name: fileList.value[index].name || '',
    url: fileList.value[index].url || ''
  };
  editDialogVisible.value = true;
};

const confirmEdit = () => {
  if (editIndex.value < 0 || !editItem.value || !fileList.value[editIndex.value]) return;
  fileList.value[editIndex.value].name = editItem.value.name || '';
  fileList.value[editIndex.value].url = editItem.value.url || '';
  updateValue();
  editDialogVisible.value = false;
};

// 对外 emit：
// - 单文件模式：emit string 或 {url, name}
// - 多文件模式：emit array
const updateValue = () => {
  const list = fileList.value.map(item => ({
    name: item.name || '',
    url: item.url || ''
  })).filter(item => item.url);

  let out;
  if (isSingle.value) {
    if (list.length === 0) {
      out = '';
    } else {
      const first = list[0];
      out = (first.name && first.name !== first.url.split('/').pop()) ? { url: first.url, name: first.name } : first.url;
    }
  } else {
    out = list;
  }
  lastEmittedJson = JSON.stringify(out);
  emit('update:modelValue', out);
};

const removeFile = (index) => {
  fileList.value.splice(index, 1);
  updateValue();
};

// 防抖同步
watch(fileList, () => {
  const ver = syncVersion;
  setTimeout(() => {
    if (syncVersion === ver) updateValue();
  }, 50);
}, { deep: true });
</script>

<style scoped>
.file-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.file-item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}
.file-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.file-item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 4px;
}
.file-item-progress {
  width: 100%;
}
.file-item-progress :deep(.el-progress__text) {
  font-size: 12px;
  min-width: 32px;
}
.file-item-uploading {
  cursor: default;
  background: #f5f7fa;
}
.file-item-icon {
  font-size: 18px;
  color: #409eff;
  flex-shrink: 0;
}
.file-item-name {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-item-close {
  font-size: 16px;
  color: #f56c6c;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
}
.file-item-close:hover {
  opacity: 1;
  transform: scale(1.1);
}
.file-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.file-upload-inline :deep(.el-upload) {
  display: inline-block;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
}

/* 编辑弹窗 */
.edit-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.edit-preview {
  width: 100%;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-icon-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.preview-doc-icon {
  font-size: 48px;
  color: #409eff;
}
.preview-filename {
  font-size: 13px;
  color: #606266;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.inline-upload :deep(.el-upload) {
  display: block;
}
</style>

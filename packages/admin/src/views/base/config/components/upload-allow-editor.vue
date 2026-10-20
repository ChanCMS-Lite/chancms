<template>
  <div class="upload-allow-editor">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="mb-15"
      title="允许上传的文件类型（MIME 白名单）"
      description="按分类勾选即可，保存后后台即时生效；如需要列表外的类型，开启「高级模式」手动补充 MIME。所有类型均经过服务端安全校验（MIME + 扩展名双重校验，拦截可执行脚本）。"
    />

    <div v-for="cat in categories" :key="cat.key" class="cat-block">
      <div class="cat-title">{{ cat.label }}</div>
      <el-checkbox-group v-model="selected">
        <el-checkbox
          v-for="opt in cat.options"
          :key="opt.mime"
          :value="opt.mime"
          class="opt-item"
        >
          <span class="opt-label">{{ opt.label }}</span>
          <span class="opt-ext">.{{ opt.ext }}</span>
          <span class="opt-mime">{{ opt.mime }}</span>
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <el-divider />

    <div class="advanced">
      <el-switch v-model="advanced" active-text="高级模式（手动补充 MIME）" />
      <template v-if="advanced">
        <el-input
          type="textarea"
          v-model="customText"
          :rows="4"
          class="mt-10"
          placeholder="每行一个 MIME，如 application/msword&#10;application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <div class="hint">自定义 MIME 会与上方勾选项合并保存（去重）。不确定的 MIME 不要添加，避免安全风险。</div>
      </template>
    </div>

    <div class="selected-count">已选 <b>{{ combined.length }}</b> 项</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  // 来自 sys_config.upload_allow_config 的 JSON 数组字符串
  modelValue: {
    type: String,
    default: "[]",
  },
});

const emit = defineEmits(["update:modelValue"]);

// 预置可选项（覆盖后端 FALLBACK_ALLOWED_TYPES 全部项，保证不丢配置）
const categories = [
  {
    key: "image",
    label: "图片",
    options: [
      { mime: "image/jpeg", label: "JPG 图片", ext: "jpg" },
      { mime: "image/png", label: "PNG 图片", ext: "png" },
      { mime: "image/gif", label: "GIF 动图", ext: "gif" },
      { mime: "image/webp", label: "WebP 图片", ext: "webp" },
      { mime: "image/svg+xml", label: "SVG 矢量", ext: "svg" },
    ],
  },
  {
    key: "video",
    label: "视频",
    options: [
      { mime: "video/mp4", label: "MP4 视频", ext: "mp4" },
      { mime: "video/quicktime", label: "MOV 视频", ext: "mov" },
      { mime: "video/x-msvideo", label: "AVI 视频", ext: "avi" },
      { mime: "video/x-matroska", label: "MKV 视频", ext: "mkv" },
    ],
  },
  {
    key: "audio",
    label: "音频",
    options: [
      { mime: "audio/mpeg", label: "MP3 音频", ext: "mp3" },
      { mime: "audio/wav", label: "WAV 音频", ext: "wav" },
      { mime: "audio/ogg", label: "OGG 音频", ext: "ogg" },
      { mime: "audio/x-m4a", label: "M4A 音频", ext: "m4a" },
    ],
  },
  {
    key: "document",
    label: "文档 / 文本",
    options: [
      { mime: "application/pdf", label: "PDF 文档", ext: "pdf" },
      { mime: "text/plain", label: "TXT 文本", ext: "txt" },
      { mime: "text/css", label: "CSS 样式", ext: "css" },
    ],
  },
  {
    key: "font",
    label: "字体",
    options: [
      { mime: "font/ttf", label: "TTF 字体", ext: "ttf" },
      { mime: "font/otf", label: "OTF 字体", ext: "otf" },
      { mime: "font/woff", label: "WOFF 字体", ext: "woff" },
      { mime: "font/woff2", label: "WOFF2 字体", ext: "woff2" },
      { mime: "application/x-font-ttf", label: "TTF(备用)", ext: "ttf" },
      { mime: "application/x-font-otf", label: "OTF(备用)", ext: "otf" },
      { mime: "application/font-woff", label: "WOFF(备用)", ext: "woff" },
      { mime: "application/font-woff2", label: "WOFF2(备用)", ext: "woff2" },
    ],
  },
  {
    key: "archive",
    label: "压缩包",
    options: [
      { mime: "application/zip", label: "ZIP 压缩包", ext: "zip" },
      { mime: "application/x-zip-compressed", label: "ZIP(备用)", ext: "zip" },
      { mime: "application/x-rar-compressed", label: "RAR 压缩包", ext: "rar" },
      { mime: "application/x-7z-compressed", label: "7Z 压缩包", ext: "7z" },
      { mime: "application/x-tar", label: "TAR 归档", ext: "tar" },
      { mime: "application/gzip", label: "GZ 归档", ext: "gz" },
    ],
  },
];

// 所有预置 MIME 集合（用于区分「勾选项」与「自定义项」）
const presetMimes = categories.flatMap((c) => c.options.map((o) => o.mime));

const selected = ref([]);
const customText = ref("");
const advanced = ref(false);

// 解析外部传入值（JSON 数组字符串）
function parseValue(val) {
  let arr = [];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) arr = parsed;
  } catch {
    arr = [];
  }
  // 预置项 → 勾选；其余 → 自定义文本框
  const preset = arr.filter((m) => presetMimes.includes(m));
  const custom = arr.filter((m) => !presetMimes.includes(m));
  selected.value = preset;
  customText.value = custom.join("\n");
  advanced.value = custom.length > 0;
}

// 自定义 MIME 解析（按行/逗号/分号拆分，去空白与空项）
const customMimes = computed(() =>
  customText.value
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
);

// 合并勾选 + 自定义，去重
const combined = computed(() => {
  const set = new Set([...selected.value, ...customMimes.value]);
  return [...set];
});

// 值变化时回写（JSON 数组字符串）
watch(
  combined,
  (val) => {
    emit("update:modelValue", JSON.stringify(val));
  },
  { deep: true }
);

// 外部值变化（切换编辑行）时重新解析
watch(
  () => props.modelValue,
  (val) => parseValue(val),
  { immediate: true }
);
</script>

<style scoped>
.cat-block {
  margin-bottom: 14px;
}
.cat-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}
.opt-item {
  margin-right: 18px;
  margin-bottom: 6px;
  height: auto;
}
.opt-label {
  font-weight: 500;
}
.opt-ext {
  color: #909399;
  margin-left: 4px;
  font-size: 12px;
}
.opt-mime {
  display: block;
  color: #c0c4cc;
  font-size: 11px;
  line-height: 1.2;
}
.advanced {
  margin-top: 4px;
}
.hint {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}
.selected-count {
  margin-top: 12px;
  color: #606266;
}
</style>

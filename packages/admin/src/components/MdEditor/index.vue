<template>
  <div class="md-editor-container">
    <MdEditor
      v-model="content"
      :preview="true"
      :toolbars="toolbars"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :language="language"
      :style="{ height: height + 'px' }"
      @onUploadImg="handleUpload"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { upload } from '@/api/upload.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 500
  },
  previewTheme: {
    type: String,
    default: 'default'
  },
  codeTheme: {
    type: String,
    default: 'atom'
  },
  language: {
    type: String,
    default: 'zh-CN'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const content = ref(props.modelValue)

const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog',
]

const handleUpload = async (files, callback) => {
  try {
    const urls = []

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])

      const res = await upload(formData, 'image')
      if (res.code === 0) {
        const uploadData = Array.isArray(res.data) ? res.data : [res.data]
        uploadData.forEach(item => {
          urls.push(item.url)
        })
      }
    }

    callback(urls)
  } catch (error) {
    console.error('上传失败:', error)
    callback([])
  }
}

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

watch(content, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
})

defineExpose({
  getValue: () => content.value,
  setValue: (value) => {
    content.value = value
  },
  insertValue: (value) => {
    content.value += value
  }
})
</script>

<style scoped>
.md-editor-container {
  width: 100%;
  position: relative;
}

:deep(.md-editor) {
  border: 1px solid #f6f6f6;
  border-radius: 4px;
}

:deep(.md-editor-toolbar) {
  border-bottom: 1px solid #f6f6f6;
}
</style>

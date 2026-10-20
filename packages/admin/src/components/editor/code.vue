<template>
  <div ref="editorRef" class="editor-container">
      <VAceEditor
        v-model:value="localContent"
        :lang="editorMode"
        theme="textmate"
        :options="editorOptions"
        @init="editorInit"
        @change="handleContentChange"
        style="height: 100%; width: 100%"
      />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, nextTick } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-textmate'
import 'ace-builds/css/ace.css'
import 'ace-builds/css/theme/textmate.css'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'

// ACE 编辑器本地化：所有 mode/theme/ext 已通过上面 import 引入本地依赖 ace-builds（@1.43.6）。
// 历史上这里曾通过 CDN（jsdelivr ace-builds@1.32.0）设置 basePath 拉取运行时资源，
// 与本地版本不一致且依赖外网，现已移除。useWorker:false 已禁用 worker，无需额外 basePath。
const props = defineProps({
  // 字段组件场景（文章编辑页）可直接用 v-model；文件编辑场景仍可用 contentId + content
  modelValue: {
    type: String,
    default: ''
  },
  contentId: {
    type: [String, Number],
    required: false
  },
  fileType: {
    type: String,
    default: 'json',
    validator: (val) =>
      ['html', 'css', 'js', 'javascript', 'json', 'text'].includes(val.toLowerCase())
  },
  content: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: '400px'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'refresh'])

const editorRef = ref(null)
const editorInstance = ref(null)
const initialContent = props.modelValue !== '' ? props.modelValue : props.content
const localContent = ref(initialContent)
const originalContent = ref(initialContent)
const hasChanges = ref(false)
const cursorPosition = ref(null)

const editorHeight = computed(() => {
  const h = props.height
  return typeof h === 'number' ? `${h}px` : h
})

const editorMode = computed(() => {
  const modeMap = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    javascript: 'javascript',
    json: 'json'
  }
  return modeMap[props.fileType.toLowerCase()] || 'text'
})

const editorOptions = ref({
  fontSize: 14,
  tabSize: 2,
  showLineNumbers: true,
  highlightActiveLine: true,
  wrap: true,
  useWorker: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  showPrintMargin: false,
  behavioursEnabled: true,
  readOnly: props.readonly
})

const editorInit = (editor) => {
  editorInstance.value = editor
  editor.selection.on('changeCursor', () => {
    cursorPosition.value = editor.selection.getCursor()
  })
  // ACE 在异步/条件渲染（DynamicForm v-if、tab 切换）时高度可能计算为 0，
  // 必须在初始化后强制 resize 一次，确保 editor 占满容器。
  nextTick(() => {
    try {
      editor.resize(true)
    } catch (e) {
      console.warn('[CodeEditor] resize failed', e)
    }
  })
}

const handleContentChange = () => {
  hasChanges.value = localContent.value !== originalContent.value
  emit('update:modelValue', localContent.value)
  emit('save', {content: localContent.value })
}

watch(
  () => [props.modelValue, props.content],
  ([mv, cv]) => {
    const newVal = mv !== '' ? mv : cv
    if (localContent.value !== newVal) {
      localContent.value = newVal
      originalContent.value = newVal
      hasChanges.value = false
    }
  }
)

// 容器尺寸变化或首次挂载后再次 resize，解决 tab 切换/条件渲染后高度为 0 的问题
watch(editorHeight, () => {
  nextTick(() => {
    if (editorInstance.value) {
      try { editorInstance.value.resize(true) } catch { /* resize 失败无碍（容器已销毁等），静默 */ }
    }
  })
})
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: v-bind(editorHeight);
  min-height: 200px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
  border: 1px solid #f6f6f6;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

.editor-container :deep(.ace_editor) {
  width: 100% !important;
  height: 100% !important;
  min-height: 200px !important;
  background-color: #fff;
}

.editor-container :deep(.ace_gutter) {
  background-color: #f5f7fa;
}

.editor-container :deep(.ace_text-layer) {
  color: #303133;
}
</style>

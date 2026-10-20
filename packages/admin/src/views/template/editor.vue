<template>
  <div class="editor-container">
    <!-- 顶部工具栏 -->
    <el-row class="toolbar bg-gray-800 text-white">
      <el-col :span="24" class="flex items-center">
        <el-button-group v-permission="['template:code:update']">
          <el-button
            type="primary"
            @click="emitSave"
            :disabled="!hasChanges"
            class="save-btn"
          >
            <el-icon><DocumentAdd /></el-icon>
            保存
          </el-button>
          <el-button @click="emitRefresh" class="refresh-btn">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-button-group>

        <!-- 状态信息 -->
        <div class="status-info ml-auto">
          <span>{{ syntaxLabel }}</span>
          <span class="mx-2">|</span>
          <span>UTF-8</span>
          <span class="mx-2">|</span>
          <span v-if="cursorPosition">
            行 {{ cursorPosition.row + 1 }}, 列 {{ cursorPosition.column + 1 }}
          </span>
        </div>
      </el-col>
    </el-row>

    <!-- 编辑器主区域 -->
    <div class="editor-area">
      <div class="editor-wrapper">
        <VAceEditor
          v-model:value="localContent"
          :lang="editorMode"
          theme="monokai"
          :options="editorOptions"
          @init="editorInit"
          @change="handleContentChange"
          style="height: 100%; width: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'

// ----------------------
// Props
// ----------------------
const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true
  },
  fileType: {
    type: String,
    default: 'text',
    validator: (val) =>
      ['html', 'css', 'js', 'javascript', 'json', 'text'].includes(val.toLowerCase())
  },
  content: {
    type: String,
    default: ''
  }
})

// ----------------------
// Emits
// ----------------------
const emit = defineEmits(['save', 'refresh'])

// ----------------------
// 编辑器状态
// ----------------------
const localContent = ref(props.content)
const originalContent = ref(props.content)
const hasChanges = ref(false)
const cursorPosition = ref(null)

// ----------------------
// 计算属性
// ----------------------
const syntaxLabel = computed(() => {
  const map = { html: 'HTML', css: 'CSS', js: 'JavaScript', javascript: 'JavaScript', json: 'JSON' }
  return map[props.fileType] || props.fileType.toUpperCase()
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

// ----------------------
// 编辑器配置
// ----------------------
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
  behavioursEnabled: true
})

// ----------------------
// 编辑器初始化
// ----------------------
const editorInit = (editor) => {
  editor.selection.on('changeCursor', () => {
    cursorPosition.value = editor.selection.getCursor()
  })
}

// ----------------------
// 内容变化处理
// ----------------------
const handleContentChange = () => {
  hasChanges.value = localContent.value !== originalContent.value
}

// ----------------------
// 事件处理
// ----------------------

// 通知父组件执行保存
const emitSave = () => {
  if (!hasChanges.value) return
  ElMessage.info('请求保存...')
  emit('save', { id: props.contentId, content: localContent.value })
}

// 通知父组件刷新内容
const emitRefresh = () => {
  ElMessage.info('请求刷新内容...')
  emit('refresh', props.contentId)
}

// ----------------------
// 监听外部 content 变化（如父组件重新加载）
// ----------------------
watch(
  () => props.content,
  (newVal) => {
    if (localContent.value !== newVal) {
      localContent.value = newVal
      originalContent.value = newVal
      hasChanges.value = false
    }
  }
)
</script>

<style lang="less" scoped>
.editor-container {
  width: 100%;
  height: calc(100vh - 109px);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1a202c;
  overflow: hidden;
}

.toolbar {
  background-color: #565656;
  flex-shrink: 0;

  .el-button-group {
    display: flex;

    .el-button {
      display: flex;
      align-items: center;
      gap: 5px;
      background-color: #565656;
      border: none;
      color: #e5eaef;
      transition: all 0.2s;
      height: 36px;
      padding: 0 15px;

      &.save-btn {
        background: center center #4a54ff;
        background-image: linear-gradient(315deg, #6772ff 0, #20c43d 100%);
        background-size: 104% 104%;
        color: #fff;

        &:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }

      &.refresh-btn:hover {
        background-color: rgb(62, 74, 94);
      }
    }
  }

  .status-info {
    color: #cbd5e0;
    font-size: 14px;
    display: flex;
    align-items: center;
    position: absolute;
    right: 10px;
    top: 5px;

    span {
      padding: 2px 6px;
      border-radius: 3px;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.editor-area {
  flex: 1;
  background-color: #1a202c;
}

.editor-wrapper {
  height: 100%;
  background-color: #272822;
  border-radius: 4px;
  overflow: hidden;
}
</style>

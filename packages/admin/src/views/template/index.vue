<template>
  <div class="editor-container" @click="handleOutsideClick">
    <!-- 顶部工具栏 -->
    <div class="header">
      <div class="header-left">
        <div class="template-selector">
          <span class="label">模板</span>
          <el-select v-model="currentTemplate" @change="handleTemplateChange" placeholder="选择模板">
            <el-option
              v-for="t in templateList"
              :key="t"
              :label="t"
              :value="t"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="header-right">
        <el-button
          v-permission="['template:code:update']"
          type="primary"
          @click="saveFile"
          :disabled="!hasChanges"
        >
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button @click="refreshFileTree">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="main-content">
      <!-- 左侧文件树 -->
      <div class="file-tree">
        <el-tree
          ref="treeRef"
          :data="filteredFiles"
          :props="treeProps"
          :filter-node-method="filterNode"
          node-key="path"
          highlight-current
          :current-node-key="currentFile?.path"
          @node-click="handleFileSelect">
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon class="node-icon">
                <Folder v-if="data.type === 'directory'" />
                <component
                  v-else
                  :is="getFileIcon(data.name)"
                  :class="getFileIconClass(data.name)"
                />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧编辑器 -->
      <div class="editor-area">
        <div v-if="currentFile" class="editor-wrapper">
          <!-- 文件信息 -->
          <div class="file-info-bar">
            <div class="file-info">
              <el-icon class="file-icon" :class="getFileIconClass(currentFile.name)">
                <component :is="getFileIcon(currentFile.name)" />
              </el-icon>
              <span class="file-name">{{ currentFile.name }}</span>
            </div>
          </div>

          <!-- 编辑器主体 -->
          <div class="editor-body">
            <VAceEditor
              v-model:value="fileContent"
              :lang="editorMode"
              theme="textmate"
              :style="{ height: '100%' }"
              :options="editorOptions"
              @init="editorInit"
              @change="handleContentChange"
            />
          </div>

          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-left">
              <span class="status-item">
                <el-icon><Document /></el-icon>
                {{ syntaxLabel }}
              </span>
              <span class="status-item">
                <el-icon><Setting /></el-icon>
                UTF-8
              </span>
              <span class="status-item">
                <el-icon><Position /></el-icon>
                行 {{ cursorPosition?.row + 1 }}, 列 {{ cursorPosition?.column + 1 }}
              </span>
            </div>
            <div class="status-right">
              <el-tag v-if="hasChanges" type="warning">未保存</el-tag>
            </div>
          </div>
        </div>

        <!-- 欢迎页面 -->
        <div v-else class="welcome-screen">
          <el-icon class="welcome-icon"><Edit /></el-icon>
          <h2>欢迎使用在线模板编辑器</h2>
          <p>从左侧选择一个文件开始编辑</p>
          <div class="welcome-tips">
            <div class="tip-item">
              <el-icon><Folder /></el-icon>
              <span>选择模板</span>
            </div>
            <div class="tip-item">
              <el-icon><Document /></el-icon>
              <span>编辑文件</span>
            </div>
            <div class="tip-item">
              <el-icon><Check /></el-icon>
              <span>保存更改</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-textmate'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'

// ACE 编辑器本地化：所有 mode/theme/ext 已通过上面 import 引入本地依赖 ace-builds（@1.43.6）。
// 历史上这里曾通过 CDN（jsdelivr ace-builds@1.32.0）设置 basePath 拉取运行时资源，
// 与本地版本不一致且依赖外网，现已移除。
import { getFileTree, getFileContent, saveFileContent } from './api/codefile'
import { folder } from '@/api/sys_config.js'


// 文件树数据
const fileTree = ref([])
const filteredFiles = ref([])
const currentFile = ref(null)
const fileContent = ref('')
const originalContent = ref('')
const hasChanges = ref(false)

// 当前模板（显示其下所有文件：html + css/js/images）
const currentTemplate = ref('default')

// 模板列表
const templateList = ref([])

// 编辑器相关
const treeRef = ref(null)
const editorInstance = ref(null)
const cursorPosition = ref(null)
const syntaxLabel = ref('')
const initialized = ref(false)

const handleTemplateChange = () => {
  currentFile.value = null
  fileContent.value = ''
  originalContent.value = ''
  hasChanges.value = false
  initialized.value = false
  refreshFileTree()
}

// 编辑器配置
const editorOptions = computed(() => ({
  fontSize: 14,
  tabSize: 2,
  useWorker: true,
  showPrintMargin: false,
  showLineNumbers: true,
  highlightActiveLine: true,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
  behavioursEnabled: true,
  wrap: false
}))

// Element Tree配置
const treeProps = {
  children: 'children',
  label: 'name',
}

// 计算编辑器模式
const editorMode = computed(() => {
  if (!currentFile.value) return 'text'

  const ext = getFileExtension(currentFile.value.name)
  switch (ext) {
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'js':
      return 'javascript'
    case 'json':
      return 'json'
    default:
      return 'text'
  }
})

// 文件过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

// 初始化加载
onMounted(() => {
  loadTemplateList()
  refreshFileTree()
})

// 加载模板列表（后端 getFolders 已只返回目录名，无需额外过滤）
const loadTemplateList = async () => {
  try {
    const res = await folder()
    if (res.code === 0) {
      templateList.value = Array.isArray(res.data) ? res.data : []
      if (templateList.value.length > 0 && !currentTemplate.value) {
        currentTemplate.value = templateList.value[0]
      }
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

// 获取文件扩展名
const getFileExtension = filename => {
  return filename.split('.').pop() || ''
}

// 获取文件图标组件
const getFileIcon = fileName => {
  const ext = fileName.split('.').pop().toLowerCase()
  const icons = {
    html: 'Document',
    css: 'Document',
    js: 'Document',
    json: 'Document',
    txt: 'Document',
    md: 'Document',
  }
  return icons[ext] || 'Document'
}

// 获取文件图标样式
const getFileIconClass = fileName => {
  const ext = fileName.split('.').pop().toLowerCase()
  const colorMap = {
    html: 'icon-html',
    css: 'icon-css',
    js: 'icon-js',
    json: 'icon-json',
    txt: 'icon-txt',
    md: 'icon-md',
  }
  return colorMap[ext] || 'icon-default'
}

// 编辑器初始化
const editorInit = editor => {
  editorInstance.value = editor
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  })

  // 更新光标位置
  editor.selection.on('changeCursor', () => {
    cursorPosition.value = editor.selection.getCursor()
  })
}

// 内容变化处理
const handleContentChange = () => {
  hasChanges.value = fileContent.value !== originalContent.value
}

// 可编辑的文件扩展名
const editableExtensions = ['html', 'css', 'js', 'json', 'md', 'txt', 'xml', 'svg']

// 检查文件是否可编辑
const isEditableFile = (fileName) => {
  const ext = getFileExtension(fileName).toLowerCase()
  return editableExtensions.includes(ext)
}

// 打开文件
const openFile = async file => {
  // 检查文件是否可编辑
  if (!isEditableFile(file.name)) {
    ElMessage.warning(`该文件类型不支持编辑: ${file.name}`)
    return
  }

  try {
    const res = await getFileContent({
      path: file.path,
      template: currentTemplate.value
    })
    if (res.code == 0) {
      const data = res.data
      fileContent.value = data
      originalContent.value = data
      hasChanges.value = false

      // 更新语法标签
      const ext = getFileExtension(file.name)
      syntaxLabel.value = ext.toUpperCase()

      // 更新当前文件
      currentFile.value = file
    }
  } catch (error) {
    console.error('打开文件失败:', error)
    ElMessage.error('打开文件失败，请重试')
  }
}

// 保存文件
const saveFile = async () => {
  if (!currentFile.value || !hasChanges.value) return

  try {
    await saveFileContent({
      path: currentFile.value.path,
      content: fileContent.value,
      template: currentTemplate.value,
    })
    originalContent.value = fileContent.value
    hasChanges.value = false
    ElMessage.success('文件保存成功')
  } catch (error) {
    console.error('保存文件失败:', error)
    ElMessage.error('保存文件失败，请重试')
  }
}

// 刷新文件树（按当前模板读 view/<template>/ 下所有文件，含 html/css/js/images）
const refreshFileTree = async () => {
  try {
    const response = await getFileTree({ template: currentTemplate.value })
    fileTree.value = response.data
    filteredFiles.value = response.data

    nextTick(() => {
      if (treeRef.value) {
        // 初始加载时选择根目录下的第一个文件（非目录）
        if (!initialized.value && filteredFiles.value.length > 0) {
          const firstFile = filteredFiles.value.find(item => item.type === 'file')

          if (firstFile) {
            handleFileSelect(firstFile)
            openFile(firstFile)
          }
          initialized.value = true
        }
      }
    })
  } catch (error) {
    console.error('加载文件树失败:', error)
  }
}

// 文件选择处理
const handleFileSelect = (data) => {
  if (treeRef.value && data.path) {
    treeRef.value.setCurrentKey(data.path)
  }

  if (data.type === 'file') {
    openFile(data)
  }
}

</script>

<style lang="less" scoped>
.editor-container {
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  background: #f5f5f5;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.template-selector {
  width: 220px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-selector .label {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
  white-space: nowrap;
}

.template-selector :deep(.el-select) {
  flex: 1;
}

.template-selector :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #d9d9d9 inset;
  border-radius: 6px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.header-right :deep(.el-button--primary) {
  background: #1890ff;
  border-color: #1890ff;
  border-radius: 6px;
}

.header-right :deep(.el-button--primary:hover) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.header-right :deep(.el-button:not(.el-button--primary)) {
  border-radius: 6px;
  border-color: #d9d9d9;
  color: #595959;
}

.header-right :deep(.el-button:not(.el-button--primary):hover) {
  border-color: #1890ff;
  color: #1890ff;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 16px;
}

.file-tree {
  width: 280px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.file-tree :deep(.el-tree) {
  background: transparent;
}

.file-tree :deep(.el-tree-node__content) {
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.file-tree :deep(.el-tree-node__content:hover) {
  background: #f5f5f5;
}

.file-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #e6f7ff;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.node-icon {
  font-size: 16px;
  color: #8c8c8c;
}

.file-tree :deep(.el-tree-node.is-current > .el-tree-node__content) .node-icon {
  color: #1890ff;
}

.file-tree :deep(.el-tree-node.is-current > .el-tree-node__content) .node-label {
  color: #1890ff;
  font-weight: 500;
}

.node-label {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #262626;
}

.icon-html { color: #ff4d4f; }
.icon-css { color: #1890ff; }
.icon-js { color: #faad14; }
.icon-json { color: #52c41a; }
.icon-txt { color: #8c8c8c; }
.icon-md { color: #722ed1; }
.icon-default { color: #8c8c8c; }

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.file-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.status-left {
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.status-right {
  display: flex;
  gap: 8px;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c8c8c;
}

.welcome-icon {
  font-size: 80px;
  color: #d9d9d9;
  margin-bottom: 24px;
}

.welcome-screen h2 {
  font-size: 24px;
  color: #262626;
  margin: 0 0 12px 0;
}

.welcome-screen p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
}

.welcome-tips {
  display: flex;
  gap: 48px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tip-item .el-icon {
  font-size: 24px;
  color: #1890ff;
}

.tip-item span {
  font-size: 12px;
  color: #8c8c8c;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-info-bar {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.file-icon {
  font-size: 16px;
  color: #8c8c8c;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #8c8c8c;
}

.status-left {
  display: flex;
  gap: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-item .el-icon {
  font-size: 14px;
}

.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
}

.welcome-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 24px;
}

.welcome-screen h2 {
  font-size: 20px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.welcome-screen p {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 32px;
}

.welcome-tips {
  display: flex;
  gap: 24px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 28px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.tip-item:hover {
  border-color: #1890ff;
  background: #e6f7ff;
}

.tip-item .el-icon {
  font-size: 28px;
  color: #1890ff;
}

.tip-item span {
  font-size: 13px;
  color: #595959;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c8c8c;
}

.welcome-icon {
  font-size: 80px;
  color: #d9d9d9;
  margin-bottom: 24px;
}

.welcome-screen h2 {
  font-size: 24px;
  color: #262626;
  margin: 0 0 12px 0;
}

.welcome-screen p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
}

.welcome-tips {
  display: flex;
  gap: 48px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tip-item .el-icon {
  font-size: 24px;
  color: #1890ff;
}

.tip-item span {
  font-size: 12px;
  color: #8c8c8c;
}
</style>

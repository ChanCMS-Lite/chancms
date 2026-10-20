<template>
  <div class="oss-manager" @click="handleOutsideClick">
    <!-- 顶部工具栏 -->
    <div class="header">
      <div class="header-left">
        <!-- 路径显示/编辑区域 -->
        <div class="folder-path-container">
          <!-- 显示模式 -->
          <div
            v-if="!isEditingPath"
            class="folder-path"
            @click="enablePathEdit"
            title="点击编辑路径"
          >
            <span class="path-item" @click.stop="changeFolder('')">根目录(/public)：</span>
            <template v-for="(item, index) in breadcrumbItems" :key="index">

              <span
                @click.stop="changeFolder(item.path)"
                class="path-item"
                :class="{ current: index === breadcrumbItems.length - 1 }"
                :title="item.displayPath"
              >
                {{ item.name }}
              </span>
              <span class="path-separator">></span>
            </template>
          </div>
          <!-- 编辑模式 -->
          <div v-else class="path-edit-mode">
            <el-input
              ref="pathInputRef"
              v-model="pathInputValue"

              class="path-input"
              placeholder="输入路径，如: folder/subfolder"
              @blur="finishPathEdit"
              @keyup.enter="finishPathEdit"
              @keyup.esc="cancelPathEdit"
            >
              <template #prefix>
                <el-icon><Folder /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div
      class="file-list"
      v-if="filteredFolders.length > 0 || filteredFiles.length > 0"
    >
      <!-- 列表工具栏 -->
      <div class="list-toolbar">
        <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        <el-button type="primary" @click="openUploadDialog">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
      </div>
      <!-- 文件列表内容区域 -->
      <div class="file-list-content" @contextmenu.prevent="handleBlankContextMenu($event)">
        <!-- 文件夹 -->
        <div
          v-for="folder in filteredFolders"
          :key="folder.id"
          class="file-item folder-item"
          :class="{ selected: selectedItems.has(folder.id) }"
          @contextmenu.prevent="handleContextMenu($event, folder, 'folder')"
          @click="handleFolderClick(folder, $event)"
        >
          <el-checkbox
            :model-value="selectedItems.has(folder.id)"
            @change="toggleSelect(folder.id)"
            @click.stop
            class="file-checkbox"
          />
          <div class="file-content">
            <el-icon class="file-icon folder-icon">
              <Folder />
            </el-icon>
            <span class="file-name" v-if="!folder.isEditing">{{ folder.name }}</span>
            <el-input
              v-else
              v-model="folder.editName"

              class="rename-input"
              @blur="finishRename(folder)"
              @keyup.enter="finishRename(folder)"
              @keyup.esc="cancelRename(folder)"
              v-focus
            />
          </div>
        </div>

        <!-- 文件 -->
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedItems.has(file.id) }"
          @contextmenu.prevent="handleContextMenu($event, file, 'file')"
          @click="handleFileClick(file, $event)"
        >
        <el-checkbox
          :model-value="selectedItems.has(file.id)"
          @change="toggleSelect(file.id)"
          @click.stop
          class="file-checkbox"
        />
        <div class="file-content">
          <el-icon class="file-icon" :class="getFileIconClass(file.name)">
            <component :is="getFileIcon(file.name)" />
          </el-icon>
          <span class="file-name" v-if="!file.isEditing">{{ file.name }}</span>
          <el-input
            v-else
            v-model="file.editName"

            class="rename-input"
            @blur="finishRename(file)"
            @keyup.enter="finishRename(file)"
            @keyup.esc="cancelRename(file)"
            v-focus
          />
        </div>
      </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else
      class="no-images"
      @contextmenu.prevent="handleBlankContextMenu($event)"
    >
      <el-icon :size="50">
        <FolderOpened />
      </el-icon>
      <p>暂无文件</p>
      <p class="no-images-hint">右键可新建文件夹</p>
    </div>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
    >
      <!-- 空白区域菜单 -->
      <template v-if="contextMenuType === 'blank'">
        <div class="menu-item" v-permission="['oss:file:create']" @click="handleCreateFolderContext">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </div>
        <div v-if="clipboardItem" class="menu-item" v-permission="['oss:file:create']" @click="handlePasteContext">
          <el-icon><DocumentCopy /></el-icon>
          粘贴
        </div>
      </template>
      <!-- 文件/文件夹菜单 -->
      <template v-else>
        <div class="menu-item" v-permission="['oss:file:create']" @click="handleCreateFolderContext">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" @click="handleCopyPath">
          <el-icon><CopyDocument /></el-icon>
          复制路径
        </div>
        <div class="menu-item" v-permission="['oss:file:create']" @click="handleRename">
          <el-icon><EditPen /></el-icon>
          重命名
        </div>
        <div class="menu-item" @click="handleCopy">
          <el-icon><DocumentCopy /></el-icon>
          复制
        </div>
        <div class="menu-item" @click="handleCut">
          <el-icon><Scissor /></el-icon>
          剪切
        </div>
        <div v-if="clipboardItem && clipboardItem.sourceUrl !== currentPath" class="menu-item" v-permission="['oss:file:create']" @click="handlePasteContext">
          <el-icon><DocumentCopy /></el-icon>
          粘贴
        </div>
        <div class="menu-divider"></div>
        <div v-if="contextMenuType === 'file'" class="menu-item" @click="handleCopyLink">
          <el-icon><Link /></el-icon>
          复制链接
        </div>
        <div class="menu-item" @click="handleDownloadContext">
          <el-icon><Download /></el-icon>
          下载
        </div>
        <div class="menu-item delete" v-permission="['oss:file:delete']" @click="handleDeleteContext">
          <el-icon><Delete /></el-icon>
          删除
        </div>
        <div v-if="contextMenuType === 'file' && getFileType(contextMenuItem?.name) === 'archive'" class="menu-item" v-permission="['oss:file:create']" @click="handleExtractContext">
          <el-icon><FolderOpened /></el-icon>
          解压
        </div>
        <div v-if="contextMenuType === 'file' || contextMenuType === 'folder'" class="menu-item" v-permission="['oss:file:create']" @click="handleCompressContext">
          <el-icon><FolderAdd /></el-icon>
          压缩
        </div>
      </template>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="600px" destroy-on-close>
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        multiple
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        v-model:file-list="fileList"
      >
        <el-icon class="el-icon--upload">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            <div>支持上传图片、文档、视频等文件{{ uploadConfig?.fileSize ? `，单个文件不超过 ${formatFileSize(uploadConfig.fileSize)}` : '（大小限制未配置，请先到「系统配置 → upload_config」设置）' }}</div>
            <div style="margin-top: 8px; color: #1890ff;">
              <el-icon><InfoFilled /></el-icon>
              文件将上传到: public/uploads/{{ currentPath || '根目录' }}
            </div>
          </div>
        </template>
      </el-upload>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" v-permission="['oss:file:create']" @click="submitUpload">开始上传</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="createFolderDialogVisible" title="新建文件夹" width="400px">
      <el-form :model="createFolderForm" label-width="84px" label-position="top">
        <el-form-item label="文件夹名">
          <el-input v-model="createFolderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createFolderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateFolder" v-permission="['oss:file:create']">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 压缩文件对话框 -->
    <el-dialog v-model="compressDialogVisible" title="压缩文件" width="400px" destroy-on-close>
      <el-form :model="compressForm" label-width="84px" label-position="top">
        <el-form-item label="压缩包名称">
          <el-input v-model="compressForm.name" placeholder="请输入压缩包名称，默认为 archive_时间戳.zip" />
        </el-form-item>
        <el-form-item label="选中文件">
          <div class="compress-file-list">
            <el-tag v-for="file in selectedFileItems" :key="file.id" class="compress-tag">
              {{ file.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="compressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCompress" v-permission="['oss:file:create']">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传进度 -->
    <div class="upload-progress" v-if="uploadQueue.length > 0">
      <div v-for="item in uploadQueue" :key="item.id" class="upload-item">
        <el-icon
          :size="24"
          :class="item.status === 'success'
            ? 'upload-success'
            : item.status === 'error'
              ? 'upload-error'
              : ''"
        >
          <Document v-if="item.status === 'uploading' || item.status === 'waiting'" />
          <CircleCheckFilled v-else-if="item.status === 'success'" />
          <CircleCloseFilled v-else />
        </el-icon>
        <div class="upload-info">
          <div class="upload-name">{{ item.file.name }}</div>
          <el-progress
            v-if="item.status === 'uploading'"
            :percentage="item.progress"
            :stroke-width="4"
            :show-text="false"
          />
          <div class="upload-status">
            <span v-if="item.status === 'waiting'">等待上传...</span>
            <span v-else-if="item.status === 'uploading' && item.progress < 100">上传中: {{ item.progress }}%</span>
            <span v-else-if="item.status === 'uploading' && item.progress >= 100">{{ UPLOAD_TEXT.syncing }}</span>
            <span v-else-if="item.status === 'success'" class="upload-success">上传成功</span>
            <span v-else-if="item.status === 'error'" class="upload-error">上传失败: {{ item.error }}</span>
          </div>
        </div>
        <el-button v-if="item.status === 'error'" type="danger" text @click="retryUpload(item)">
          重试
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup name="OssManager">
import { ref, computed, onMounted } from 'vue'
import { getUploadFile, deleteFile, extractArchive, copyFile, moveFile, renameFile, createFolder, compressFiles } from '../template/api/codefile.js'
import { upload, getUploadConfig } from '@/api/upload.js'
import { formatFileSize } from '@/utils/upload.js'
import { UPLOAD_TEXT } from '@/config/upload.js'


// 自定义指令：自动聚焦
const vFocus = {
  mounted: (el) => {
    const input = el.querySelector('input')
    if (input) {
      input.focus()
      input.select()
    }
  }
}

// 当前路径（使用相对路径）
const currentPath = ref('')

// 路径编辑相关
const isEditingPath = ref(false)
const pathInputValue = ref('')
const pathInputRef = ref(null)

// 文件树数据 - 改为扁平结构
const currentFolderContents = ref([])

// 搜索查询
const searchQuery = ref('')

// 文件类型过滤
const fileTypeFilter = ref('')

// 分页
const currentPage = ref(1)

// 上传对话框
const uploadDialogVisible = ref(false)
const fileList = ref([])
const uploadRef = ref(null)

// 新建文件夹对话框
const createFolderDialogVisible = ref(false)
const createFolderForm = ref({ name: '' })

// 压缩文件对话框
const compressDialogVisible = ref(false)
const compressForm = ref({ name: '' })

// 上传队列
const uploadQueue = ref([])
let uploadIdCounter = 0

// 上传配置
const uploadConfig = ref(null)

// 多选相关
const selectedItems = ref(new Set())
const selectAll = ref(false)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuItem = ref(null)
const contextMenuType = ref('')

// 剪贴板（用于复制/剪切）
const clipboardItem = ref(null)
const clipboardAction = ref('') // 'copy' 或 'cut'

// 初始化加载文件树
onMounted(async () => {
  await loadUploadConfig()
  refreshFileTree()
})

// 加载上传配置
const loadUploadConfig = async () => {
  try {
    const config = await getUploadConfig()
    if (config) {
      uploadConfig.value = config
    }
  } catch (error) {
    console.error('Failed to load upload config:', error)
  }
}

// 根据文件类型获取大小限制
const getFileSizeLimit = (file) => {
  // 配置未加载时返回 0（而非硬编码兜底），由调用方 fail-closed 拒绝上传
  if (!uploadConfig.value) return 0

  const ext = file.name.split('.').pop().toLowerCase()
  const mimetype = file.type || ''

  // 仅按「图片 / 视频 / 音频 / 通用文件」四类分派，与后端 upload-validator.js 保持一致。
  // PDF、压缩包、字体、CSS、JS、HTML、TXT 等统一归入 fileSize。
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimetype.startsWith('image/')) {
    return uploadConfig.value.imgSize || 0
  }
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext) || mimetype.startsWith('video/')) {
    return uploadConfig.value.videoSize || 0
  }
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || mimetype.startsWith('audio/')) {
    return uploadConfig.value.musicSize || 0
  }

  return uploadConfig.value.fileSize || 0
}

// 刷新文件树（适配扁平结构）
const refreshFileTree = async () => {
  try {
    const res = await getUploadFile({
      path: currentPath.value,
    })

    if (res.code === 0) {
      let data = res.data;
      data.forEach((item, index) => {
        if (item.type === 'file') {
          item.url = item.relativePath
        }
        // 使用 relativePath 作为唯一标识
        item.id = item.relativePath || item.name || index
        item.isEditing = false
        item.editName = item.name
      })
      currentFolderContents.value = data
    } else {
      ElMessage.error(`加载文件树失败: ${res.msg}`)
    }
  } catch (error) {
    console.error('加载文件树失败:', error)
    ElMessage.error('加载文件树失败，请检查网络连接')
  }
}

// 改变文件夹（增加刷新逻辑）
const changeFolder = (path) => {
  const normalizedPath = path ? path.replace(/\\/g, '/') : '';
  currentPath.value = normalizedPath;
  currentPage.value = 1;
  selectedItems.value.clear();
  selectAll.value = false;
  refreshFileTree();
}

// 处理文件选择
const handleFileChange = (file, uploadFileList) => {
  // 检查文件大小
  const maxSize = getFileSizeLimit(file)
  // fail-closed：后台未配置该类型上限时拒绝上传，避免 undefined 比较导致静默放行
  if (!Number.isFinite(maxSize) || maxSize <= 0) {
    ElMessage.error('上传大小限制未配置，请先在「系统配置 → upload_config」中设置后重试')
    const index = uploadFileList.findIndex(f => f.uid === file.uid)
    if (index !== -1) {
      uploadFileList.splice(index, 1)
    }
    return
  }
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    ElMessage.error(`文件大小超出限制: 当前 ${sizeMB}MB，最大 ${maxSizeMB}MB`)
    const index = uploadFileList.findIndex(f => f.uid === file.uid)
    if (index !== -1) {
      uploadFileList.splice(index, 1)
    }
    return
  }
}

// 处理文件移除
const handleFileRemove = file => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
  }
}

// 提交上传
const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  // 关闭上传对话框
  uploadDialogVisible.value = false

  // 添加文件到上传队列
  fileList.value.forEach(file => {
    uploadQueue.value.push({
      id: uploadIdCounter++,
      file: file.raw,
      progress: 0,
      status: 'waiting',
    })
  })

  // 开始上传
  startUpload()
}

const openUploadDialog = () => {
  fileList.value = []
  uploadDialogVisible.value = true
}

// 打开新建文件夹对话框
const openCreateFolderDialog = () => {
  createFolderForm.value.name = ''
  createFolderDialogVisible.value = true
}

// 提交新建文件夹
const submitCreateFolder = async () => {
  const folderName = createFolderForm.value.name.trim()
  if (!folderName) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  // 验证文件夹名合法性
  if (folderName.includes('/') || folderName.includes('\\') || folderName.includes('..')) {
    ElMessage.warning('文件夹名称不能包含特殊字符')
    return
  }

  const fullPath = currentPath.value ? `${currentPath.value}/${folderName}` : folderName

  try {
    const res = await createFolder({ folderPath: fullPath })
    if (res.code === 0) {
      ElMessage.success('文件夹创建成功')
      createFolderDialogVisible.value = false
      refreshFileTree()
    } else {
      ElMessage.error(res.msg || '创建失败')
    }
  } catch {
    ElMessage.error('创建文件夹失败')
  }
}

// 右键菜单创建文件夹
const handleCreateFolderContext = () => {
  contextMenuVisible.value = false
  openCreateFolderDialog()
}

// 提交压缩
const submitCompress = async () => {
  const files = selectedFileItems.value.map(item => item.relativePath)
  const zipName = compressForm.value.name.trim() || `archive_${Date.now()}.zip`

  // 确保文件名以.zip结尾
  const finalZipName = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`

  try {
    const res = await compressFiles({
      files,
      folderPath: currentPath.value,
      zipName: finalZipName
    })
    if (res.code === 0) {
      ElMessage.success('压缩成功')
      compressDialogVisible.value = false
      refreshFileTree()
    } else {
      ElMessage.error(res.msg || '压缩失败')
    }
  } catch {
    ElMessage.error('压缩失败')
  }
}

// 开始上传
const startUpload = async () => {
  const uploadItem = uploadQueue.value.find(item => item.status === 'waiting')
  if (!uploadItem) return

  uploadItem.status = 'uploading'

  try {
    const formData = new FormData()
    formData.append('file', uploadItem.file)

    const res = await upload(formData, 'file', {
      onUploadProgress: (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0
        uploadItem.progress = percent
      },
    })
    if (res.code === 0) {
      uploadItem.progress = 100
      uploadItem.status = 'success'

      setTimeout(() => {
        refreshFileTree()
        startUpload()
      }, 500)
    } else {
      throw new Error(res.msg || '上传失败')
    }
  } catch (error) {
    uploadItem.status = 'error'
    uploadItem.error = error.message || '上传失败'
    ElMessage.error(error.message || '上传失败')
  }
}

// 重试上传
const retryUpload = item => {
  item.status = 'waiting'
  item.progress = 0
  item.error = null
  startUpload()
}

// 处理文件夹点击 - 单击进入
const handleFolderClick = (folder, event) => {
  // 如果点击的是checkbox，不进入文件夹
  if (event.target.closest('.el-checkbox')) {
    return
  }
  // 单击直接进入文件夹
  changeFolder(folder.relativePath)
}

// 处理文件点击 - 单击选中
const handleFileClick = (file, event) => {
  // 如果点击的是checkbox，不切换选中状态
  if (event.target.closest('.el-checkbox')) {
    return
  }
  // 单击切换选中状态
  toggleSelect(file.id)
}

// 切换选中状态
const toggleSelect = (id) => {
  if (selectedItems.value.has(id)) {
    selectedItems.value.delete(id)
  } else {
    selectedItems.value.add(id)
  }
  // 更新全选状态
  const allIds = [...filteredFolders.value, ...filteredFiles.value].map(item => item.id)
  selectAll.value = allIds.every(id => selectedItems.value.has(id))
}

// 处理全选
const handleSelectAll = (checked) => {
  if (checked) {
    selectedItems.value.clear()
    filteredFolders.value.forEach(folder => selectedItems.value.add(folder.id))
    filteredFiles.value.forEach(file => selectedItems.value.add(file.id))
  } else {
    selectedItems.value.clear()
  }
}

// 处理右键菜单
const handleContextMenu = (event, item, type) => {
  event.preventDefault()
  event.stopPropagation()
  contextMenuItem.value = item
  contextMenuType.value = type
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true

  // 右键时不改变选中状态，保持当前选中
}

// 空白区域右键菜单
const handleBlankContextMenu = (event) => {
  event.stopPropagation()
  contextMenuItem.value = null
  contextMenuType.value = 'blank'
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
}

// 处理外部点击，关闭右键菜单
const handleOutsideClick = () => {
  contextMenuVisible.value = false
}

// 启用路径编辑
const enablePathEdit = () => {
  pathInputValue.value = currentPath.value
  isEditingPath.value = true
  // 自动聚焦
  setTimeout(() => {
    pathInputRef.value?.focus()
    pathInputRef.value?.select()
  }, 0)
}

// 校验 OSS 路径安全性：禁止路径穿越
const validateOssPath = (path) => {
  if (!path || typeof path !== 'string') return false
  if (path.includes('..') || path.startsWith('/') || path.includes('//')) return false
  return true
}

// 完成路径编辑
const finishPathEdit = () => {
  const newPath = pathInputValue.value.trim()
  if (newPath !== currentPath.value) {
    // 安全校验：禁止路径穿越
    if (!validateOssPath(newPath)) {
      ElMessage.error('路径非法：禁止包含 .. 或以 / 开头')
      return
    }
    // 规范化路径
    const normalizedPath = newPath.replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '')
    changeFolder(normalizedPath)
  }
  isEditingPath.value = false
}

// 取消路径编辑
const cancelPathEdit = () => {
  isEditingPath.value = false
  pathInputValue.value = currentPath.value
}

// 复制路径（右键菜单）- 纯前端操作
const handleCopyPath = async () => {
  if (contextMenuItem.value) {
    try {
      // 直接使用 relativePath，格式为 public/xxx 或 view/xxx
      const path = contextMenuItem.value.relativePath
      await navigator.clipboard.writeText(path)
      ElMessage.success('相对路径已复制到剪贴板')
    } catch {
      ElMessage.error('复制路径失败')
    }
    contextMenuVisible.value = false
  }
}

// 复制链接
const handleCopyLink = () => {
  if (contextMenuItem.value) {
    const fullUrl = window.location.origin + contextMenuItem.value.url
    navigator.clipboard.writeText(fullUrl)
    ElMessage.success('链接已复制到剪贴板')
    contextMenuVisible.value = false
  }
}

// 重命名
const handleRename = () => {
  if (contextMenuItem.value) {
    contextMenuItem.value.isEditing = true
    contextMenuItem.value.editName = contextMenuItem.value.name
    contextMenuVisible.value = false
  }
}

// 完成重命名
const finishRename = async (item) => {
  if (item.editName && item.editName !== item.name) {
    try {
      const res = await renameFile({
        sourceUrl: item.relativePath,
        newName: item.editName
      })
      if (res.code === 0) {
        ElMessage.success('重命名成功')
        item.name = item.editName
      } else {
        ElMessage.error(res.msg || '重命名失败')
        item.editName = item.name
      }
    } catch (error) {
      ElMessage.error(error.message || '重命名失败')
      item.editName = item.name
    }
  }
  item.isEditing = false
  refreshFileTree()
}

// 取消重命名
const cancelRename = (item) => {
  item.isEditing = false
  item.editName = item.name
}

// 复制
const handleCopy = () => {
  if (contextMenuItem.value) {
    clipboardItem.value = {
      sourceUrl: contextMenuItem.value.relativePath,
      name: contextMenuItem.value.name,
      type: contextMenuType.value
    }
    clipboardAction.value = 'copy'
    ElMessage.success(`已复制 ${contextMenuItem.value.name}`)
    contextMenuVisible.value = false
  }
}

// 剪切
const handleCut = () => {
  if (contextMenuItem.value) {
    clipboardItem.value = {
      sourceUrl: contextMenuItem.value.relativePath,
      name: contextMenuItem.value.name,
      type: contextMenuType.value
    }
    clipboardAction.value = 'cut'
    ElMessage.success(`已剪切 ${contextMenuItem.value.name}`)
    contextMenuVisible.value = false
  }
}


// 粘贴（右键菜单）
const handlePasteContext = async () => {
  if (!clipboardItem.value) {
    ElMessage.warning('剪贴板为空')
    return
  }

  await performPaste()
  contextMenuVisible.value = false
}

// 执行粘贴操作
const performPaste = async () => {
  const targetUrl = currentPath.value
    ? `${currentPath.value}/${clipboardItem.value.name}`
    : clipboardItem.value.name

  // 检查目标路径是否已存在同名文件/文件夹
  const allItems = [...filteredFolders.value, ...filteredFiles.value]
  const existingItem = allItems.find(item => item.name === clipboardItem.value.name)

  if (existingItem) {
    try {
      await ElMessageBox.confirm(
        `当前目录已存在 "${clipboardItem.value.name}"，是否覆盖？`,
        '覆盖确认',
        {
          confirmButtonText: '覆盖',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
    } catch {
      // 用户取消
      return
    }
  }

  try {
    if (clipboardAction.value === 'copy') {
      const res = await copyFile({
        sourceUrl: clipboardItem.value.sourceUrl,
        targetUrl: targetUrl
      })
      if (res.code === 0) {
        ElMessage.success('复制成功')
      } else {
        ElMessage.error(res.msg || '复制失败')
      }
    } else if (clipboardAction.value === 'cut') {
      const res = await moveFile({
        sourceUrl: clipboardItem.value.sourceUrl,
        targetUrl: targetUrl
      })
      if (res.code === 0) {
        ElMessage.success('移动成功')
        clipboardItem.value = null
        clipboardAction.value = ''
      } else {
        ElMessage.error(res.msg || '移动失败')
      }
    }
    refreshFileTree()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 右键菜单删除
// 右键菜单删除 - 支持批量删除选中的项目
const handleDeleteContext = async () => {
  // 获取所有选中的项目
  const selectedCount = selectedItems.value.size

  if (selectedCount === 0) {
    // 如果没有选中任何项，删除当前右键点击的项
    if (contextMenuItem.value) {
      await handleDeleteSingle(contextMenuItem.value)
    }
  } else if (selectedCount === 1) {
    // 如果只选中了一项
    const selectedId = Array.from(selectedItems.value)[0]
    const allItems = [...filteredFolders.value, ...filteredFiles.value]
    const selectedItem = allItems.find(item => item.id === selectedId)
    if (selectedItem) {
      await handleDeleteSingle(selectedItem)
    }
  } else {
    // 批量删除多个选中的项目
    await handleDeleteBatch()
  }
  contextMenuVisible.value = false
}

// 批量删除
const handleDeleteBatch = async () => {
  const selectedCount = selectedItems.value.size
  if (selectedCount === 0) return

  // 在确认前收集所有要删除的文件信息
  const selectedIds = Array.from(selectedItems.value)
  const allItems = [...filteredFolders.value, ...filteredFiles.value]
  const itemsToDelete = allItems.filter(item => selectedIds.includes(item.id))

  if (itemsToDelete.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${itemsToDelete.length} 个项目吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    let successCount = 0
    let failCount = 0
    const failedItems = []

    // 逐个删除，使用已收集的文件信息
    for (const item of itemsToDelete) {
      try {
        const res = await deleteFile({ url: item.relativePath })
        if (res.code === 0) {
          successCount++
        } else {
          failCount++
          failedItems.push(item.name)
          console.error(`删除失败: ${item.name}`, res.msg)
        }
      } catch (error) {
        failCount++
        failedItems.push(item.name)
        console.error(`删除失败: ${item.name}`, error)
      }
    }

    // 所有删除完成后统一刷新列表
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 个项目`)
      selectedItems.value.clear()
      selectAll.value = false
      await refreshFileTree()
    }

    if (failCount > 0) {
      ElMessage.error(`${failCount} 个项目删除失败: ${failedItems.join(', ')}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 右键菜单解压
const handleExtractContext = async () => {
  if (contextMenuItem.value) {
    await handleExtractSingle(contextMenuItem.value)
    contextMenuVisible.value = false
  }
}

// 右键菜单压缩 - 直接使用文件名压缩，不弹窗
const handleCompressContext = async () => {
  if (contextMenuItem.value) {
    contextMenuVisible.value = false

    // 使用当前项的名称作为压缩包名称
    const itemName = contextMenuItem.value.name
    const zipName = itemName.endsWith('.zip') ? itemName : `${itemName}.zip`

    try {
      // 构建文件路径列表（如果是文件夹，后端会处理子文件）
      const files = [contextMenuItem.value.relativePath]

      const res = await compressFiles({
        files,
        folderPath: currentPath.value,
        zipName: zipName
      })

      if (res.code === 0) {
        ElMessage.success('压缩成功')
        refreshFileTree()
      } else {
        ElMessage.error(res.msg || '压缩失败')
      }
    } catch {
      ElMessage.error('压缩失败')
    }
  }
}

// 右键菜单下载
const handleDownloadContext = async () => {
  if (contextMenuItem.value) {
    await handleDownloadSingle(contextMenuItem.value)
    contextMenuVisible.value = false
  }
}

// 删除单个文件
const handleDeleteSingle = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${item.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const res = await deleteFile({ url: item.relativePath })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      refreshFileTree()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 解压单个文件
const handleExtractSingle = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要解压 "${item.name}" 吗？`,
      '解压确认',
      {
        confirmButtonText: '确定解压',
        cancelButtonText: '取消',
        type: 'info',
      },
    )

    const res = await extractArchive({ url: item.relativePath })
    if (res.code === 0) {
      ElMessage.success(`解压成功，共解压 ${res.data.fileCount} 个文件`)
      refreshFileTree()
    } else {
      ElMessage.error(res.msg || '解压失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      const errorMsg = error.response?.data?.msg || error.message || '解压失败'
      ElMessage.error(errorMsg)
    }
  }
}

// 下载单个文件
const handleDownloadSingle = async (item) => {
  try {
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    link.click()
    ElMessage.success('开始下载')
  } catch (error) {
    ElMessage.error(error.message || '下载失败')
  }
}




// 获取文件类型
const getFileType = fileName => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext))
    return 'document'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) return 'font'
  return 'other'
}

// 获取文件图标组件
const getFileIcon = fileName => {
  const ext = fileName.split('.').pop().toLowerCase()
  const icons = {
    pdf: 'Document',
    doc: 'Document',
    docx: 'Document',
    xls: 'Tickets',
    xlsx: 'Tickets',
    ppt: 'Document',
    pptx: 'Document',
    txt: 'Document',
    zip: 'FolderOpened',
    rar: 'FolderOpened',
    '7z': 'FolderOpened',
    tar: 'FolderOpened',
    gz: 'FolderOpened',
    mp4: 'VideoPlay',
    mov: 'VideoPlay',
    avi: 'VideoPlay',
    mkv: 'VideoPlay',
    mp3: 'Headset',
    wav: 'Headset',
    ogg: 'Headset',
    js: 'Document',
    css: 'Document',
    html: 'Document',
    json: 'Document',
    xml: 'Document',
    md: 'Document',
  }
  return icons[ext] || 'Document'
}

// 获取文件图标样式
const getFileIconClass = fileName => {
  const ext = fileName.split('.').pop().toLowerCase()
  const colorMap = {
    pdf: 'icon-pdf',
    doc: 'icon-doc',
    docx: 'icon-doc',
    xls: 'icon-xls',
    xlsx: 'icon-xls',
    ppt: 'icon-ppt',
    pptx: 'icon-ppt',
    txt: 'icon-txt',
    zip: 'icon-zip',
    rar: 'icon-zip',
    '7z': 'icon-zip',
    tar: 'icon-zip',
    gz: 'icon-zip',
    mp4: 'icon-video',
    mov: 'icon-video',
    avi: 'icon-video',
    mkv: 'icon-video',
    mp3: 'icon-audio',
    wav: 'icon-audio',
    ogg: 'icon-audio',
    ttf: 'icon-font',
    otf: 'icon-font',
    woff: 'icon-font',
    woff2: 'icon-font',
    eot: 'icon-font',
    js: 'icon-code',
    css: 'icon-code',
    html: 'icon-code',
    json: 'icon-code',
    xml: 'icon-code',
    md: 'icon-code',
  }
  return colorMap[ext] || 'icon-other'
}

// 生成面包屑导航 - 增强路径处理
const breadcrumbItems = computed(() => {
  if (!currentPath.value) return [];

  const normalizedPath = currentPath.value.replace(/\\/g, '/');
  const parts = normalizedPath.split('/').filter(p => p);

  let pathAcc = '';
  const items = [];
  for (let i = 0; i < parts.length; i++) {
    pathAcc = pathAcc ? `${pathAcc}/${parts[i]}` : parts[i];
    items.push({
      name: parts[i],
      // 显示路径加上 /public 前缀
      path: pathAcc,
      displayPath: `/public/${pathAcc}`
    });
  }

  return items;
});

// 过滤文件列表 - 适配扁平结构
const filteredFiles = computed(() => {
  return currentFolderContents.value.filter(item => {
    // 只显示文件
    if (item.type !== 'file') return false

    // 类型匹配
    const typeMatch = fileTypeFilter.value
      ? getFileType(item.name) === fileTypeFilter.value
      : true

    // 搜索匹配
    const searchMatch = searchQuery.value
      ? item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    return typeMatch && searchMatch
  })
})

// 过滤文件夹列表 - 适配扁平结构
const filteredFolders = computed(() => {
  return currentFolderContents.value.filter(item => {
    // 只显示文件夹
    if (item.type !== 'directory') return false

    // 搜索匹配
    const searchMatch = searchQuery.value
      ? item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    return searchMatch
  })
})


// 选中的文件（不包含文件夹）
const selectedFileItems = computed(() => {
  return filteredFiles.value.filter(item => selectedItems.value.has(item.id))
})

</script>

<style scoped>
.oss-manager {
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
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
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 1200px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    width: 100%;
    margin-bottom: 12px;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.folder-path-container {
  flex: 1;
  min-width: 0;
}

.folder-path {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #595959;
  cursor: text;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.folder-path:hover {
  background: #f5f5f5;
}

.path-edit-mode {
  display: flex;
  align-items: center;
}

.path-input {
  width: 400px;
}

.path-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #1890ff;
}

.path-item {
  cursor: pointer;
  color: #1890ff;
  transition: all 0.2s;
  padding: 2px 6px;
  border-radius: 4px;
}

.path-item:hover {
  color: #40a9ff;
  background: #e6f7ff;
}

.path-item.current {
  color: #262626;
  cursor: default;
  background: transparent;
  font-weight: 500;
}

.path-separator {
  color: #d9d9d9;
  font-size: 12px;
}

.copy-path-btn {
  padding: 4px 8px;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.actions .el-checkbox {
  margin-right: 12px;
  padding-left: 4px;
}

.actions :deep(.el-button) {
  padding-left: 16px;
  padding-right: 16px;
}

.actions :deep(.el-button--primary) {
  background: #1890ff;
  border-color: #1890ff;
  border-radius: 6px;
}

.actions :deep(.el-button--primary:hover) {
  background: #40a9ff;
  border-color: #40a9ff;
}

.actions :deep(.el-button:not(.el-button--primary)) {
  border-radius: 6px;
  border-color: #d9d9d9;
  color: #595959;
}

.actions :deep(.el-button:not(.el-button--primary):hover) {
  border-color: #1890ff;
  color: #1890ff;
}

.actions :deep(.el-button.is-disabled) {
  border-color: #d9d9d9;
  color: #bfbfbf;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
}

.file-list-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}

.list-toolbar .el-checkbox {
  margin-right: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: white;
  border: 1px solid transparent;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item.selected {
  background-color: #f0f5ff;
}

.file-item.folder-item {
  color: #1890ff;
}

.file-item.folder-item .file-icon {
  color: #1890ff;
}

.file-checkbox {
  margin: 0 !important;
  flex-shrink: 0;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-icon {
  color: #faad14;
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
}

.rename-input {
  width: 200px;
}

.rename-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #1890ff;
}

.no-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #8c8c8c;
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s ease;
  cursor: pointer;
}

.no-images .el-icon {
  margin-bottom: 16px;
  color: #bfbfbf;
}

.no-images p {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.no-images-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #bfbfbf;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 140px;
  padding: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 14px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.menu-item.delete:hover {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.menu-item .el-icon {
  font-size: 16px;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

.upload-progress {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  z-index: 1000;
}

.compress-file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.compress-tag {
  margin: 0;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.upload-item:last-child {
  border-bottom: none;
}

.upload-info {
  flex: 1;
}

.upload-name {
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-status {
  font-size: 12px;
  color: #8c8c8c;
}

.upload-success {
  color: #52c41a;
}

.upload-error {
  color: #ff4d4f;
}

/* 图标颜色 - Ant Design 色系 */
.icon-pdf {
  color: #ff4d4f;
}

.icon-doc,
.icon-docx {
  color: #1890ff;
}

.icon-xls,
.icon-xlsx {
  color: #52c41a;
}

.icon-ppt,
.icon-pptx {
  color: #faad14;
}

.icon-txt {
  color: #8c8c8c;
}

.icon-zip,
.icon-rar,
.icon-7z,
.icon-tar,
.icon-gz {
  color: #722ed1;
}

.icon-video {
  color: #faad14;
}

.icon-audio {
  color: #52c41a;
}

.icon-font {
  color: #8c8c8c;
}

.icon-code {
  color: #1890ff;
}

.icon-other {
  color: #8c8c8c;
}

/* 滚动条样式 */
.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.file-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>

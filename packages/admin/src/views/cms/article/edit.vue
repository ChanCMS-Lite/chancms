<template>
  <div class="bg-fff pd-10 radius-6 edit-page">
    <div class="mr-10 ml-10 edit-content">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="基本信息" name="first"></el-tab-pane>
          <el-tab-pane label="扩展信息" name="second"></el-tab-pane>
        </el-tabs>

      <div class="mb-20">
        <el-form ref="paramsRef" :model="params" label-width="84px" label-position="top">
          <div v-show="activeIndex == 0" v-loading="loading">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="isPage ? '页面栏目' : '文章栏目'">
                  <el-tree-select v-model="categorySelected" :data="category" node-key="id"
                    :props="{ label: 'label', children: 'children', disabled: 'disabled' }" :placeholder="isPage ? '请选择单页栏目' : '请选择栏目'"
                    clearable filterable check-strictly style="width: 100%" @change="handleChange"></el-tree-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="isPage ? '页面标题' : '文章标题'" prop="title" :rules="[
                  {
                    required: true,
                    message: '请输入文章标题',
                    trigger: 'blur',
                  },
                  {
                    min: 1,
                    max: 100,
                    message: '标题不能超过100个字',
                    trigger: 'blur',
                  },
                ]">
                  <el-input v-model="params.title"></el-input>
                </el-form-item>
              </el-col>

               <el-col :span="12">
                <el-form-item label="缩略图">
                  <div class="thumb-input-row">
                    <el-upload class="avatar-uploader" :http-request="getupload" :show-file-list="false"
                      :before-upload="beforeUpload">
                      <el-popover placement="top-start" title="上传" :width="200" trigger="hover"
                        :content="uploadTip('image', '上传图片作为封面图')">
                        <template #reference>
                          <el-icon class="avatar-uploader-icon">
                            <MostlyCloudy />
                          </el-icon>
                        </template>
                      </el-popover>
                    </el-upload>

                    <el-popover v-if="params.img" placement="right" :width="400" trigger="hover">
                      <template #reference>
                        <el-image class="avatar-uploader-icon pointer" :src="params.img" />
                      </template>
                      <el-image style="width: 100%" :src="params.img" />
                    </el-popover>

                    <el-button type="primary" @click="openCoverDialog">
                      默认封面图
                    </el-button>

                    <el-input v-model="params.img" />
                  </div>

                  <el-dialog
                    v-model="coverDialog"
                    title="默认封面图"
                    width="720px"
                    :append-to-body="true"
                    @open="loadCoverList"
                  >
                    <div class="cover-toolbar">
                      <el-upload
                        :show-file-list="false"
                        :http-request="coverHttpRequest"
                        accept="image/*"
                      >
                        <el-button type="primary" size="small" v-permission="['oss:file:create']">上传图片</el-button>
                      </el-upload>
                      <span class="cover-count">共 {{ coverList.length }} 张</span>
                    </div>

                    <div v-loading="coverLoading" class="cover-grid">
                      <div
                        v-for="item in coverList"
                        :key="item.name"
                        class="cover-card"
                        :class="{ active: item.url === selectedCover }"
                        @click="selectedCover = item.url"
                      >
                        <el-image :src="item.url" fit="cover" class="cover-img" />
                        <div class="cover-actions">
                          <el-button size="small" type="primary" link @click.stop="downloadCover(item)">下载</el-button>
                          <el-button size="small" type="danger" link v-permission="['oss:file:delete']" @click.stop="deleteCover(item)">删除</el-button>
                        </div>
                        <span v-if="item.url === selectedCover" class="cover-badge">已选</span>
                      </div>
                      <div v-if="!coverLoading && coverList.length === 0" class="cover-empty">
                        暂无封面图，点击左上角「上传图片」添加
                      </div>
                    </div>

                    <template #footer>
                      <el-button @click="coverDialog = false">取消</el-button>
                      <el-button type="primary" @click="confirmCover">确认</el-button>
                    </template>
                  </el-dialog>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="短标题" prop="name">
                  <el-input v-model="params.shortTitle"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12" v-if="!isPage">
                <el-form-item label="tag标签" class="tag-form-item">
                  <el-select v-model="params.tagId" class="tag-select" placeholder="请选择标签" multiple filterable remote
                    :remote-method="searchTag" @focus="searchTag()">
                    <el-option v-for="item in taglist" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <el-button class="ml-10" @click="toTagManage">标签管理</el-button>
                </el-form-item>
              </el-col>



              <el-col :span="12" v-if="!isPage">
                <el-form-item label="内容属性">
                  <el-checkbox-group v-model="params.attr" @change="handleAttr">
                    <el-checkbox label="top" value="top">头条</el-checkbox>
                    <el-checkbox label="recommend" value="recommend">推荐</el-checkbox>
                    <el-checkbox label="carousel" value="carousel">轮播</el-checkbox>
                    <el-checkbox label="hot" value="hot">热门</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>




            </el-row>

            <el-form-item label="内容摘要">
              <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="params.description"></el-input>
            </el-form-item>

            <el-form-item label="编辑器">
              <el-radio-group v-model="editorType">
                <el-radio value="rich">富文本</el-radio>
                <el-radio value="markdown">markdown</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="文章内容">
              <vue3-tinymce v-if="editorType === 'rich'" v-model="params.content" :setting="setting" @init="tinymce"
                script-src="/public/admin/tinymce/tinymce.min.js" />
              <md-editor v-else v-model="params.content" @change="handleContentChange" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="发布时间">
                  <el-date-picker v-model="params.created_at" type="datetime" placeholder="选择日期时间"
                    style="width: 100%"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="浏览数">
                  <el-input v-model="params.pv"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="自动封面">
                  <el-checkbox v-model="autoImg">
                    文章第
                    <el-input v-model="picNum" class="w-80 mr-8 ml-8" placeholder="请输入内容"></el-input>张图
                  </el-checkbox>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="提取描述">
                  <el-checkbox v-model="autoDes">提取文章描述</el-checkbox>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="执行脚本">
                  <el-switch v-model="params.allowScript" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="是否显示">
                  <el-radio v-model="params.status" value="0">发布</el-radio>
                  <el-radio v-model="params.status" value="1">不发布</el-radio>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 关联模型：仅文章页保留；单页(isPage)不挂模型（Lite 裁剪） -->
            <template v-if="!isPage">
            <el-form-item label="关联模型" class="model-select-item">
              <el-select v-model="selectedMid" placeholder="请选择关联模型" style="width: 100%" @change="handleModelChange">
                <el-option v-for="opt in modelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>

            <!-- 模型信息：根据关联模型直接展示字段 -->
            <div v-if="field.length > 0" class="model-section">
              <DynamicForm ref="dynamicFormRef" :fields="field" v-model="extData" />
            </div>
            </template>

          </div>

          <div v-show="activeIndex == 1">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="内容模板">
                  <el-select v-model="params.articleView" placeholder="请选择模板" style="width: 100%">
                    <el-option v-for="item in viewsList" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="来源">
                  <el-input v-model="params.source"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="外链跳转">
                  <el-input v-model="params.link" max="120"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- AIGEO：内嵌于扩展信息 tab（参考栏目 SEO tab 写法），不单独开 tab -->
            <el-form-item label="AI GEO（面向 AI 搜索引擎的摘要与问答）">
              <div class="w-full">
                <Code ref="aiGeoEditorRef" :content-id="params.id || 0" :file-type="'json'" :content="aiGeoContent"
                  @save="handleAiGeoSave" />
              </div>
            </el-form-item>

          </div>

        </el-form>
      </div>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit(paramsRef)" v-permission="['cms:article:create', 'cms:article:update']">保存</el-button>
    </div>
  </div>
</template>
<script setup name="article-edit">
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { find } from '@/api/category.js'
import { DOMAIN, markForeignDisabled } from '@/constants/contentTypes.js'
import { create, update, detail } from '@/api/article.js'
import { findByMid } from '@/api/field.js'
import { upload, uploadCover, deleteFile, coverList as fetchCoverList } from '@/api/upload.js'
import { useExtModel } from '@/composables/useExtModel.js'
import { loadUploadConfig, checkUploadSize, uploadTip, resolveOssUrl } from '@/utils/upload.js'
import { search } from '@/api/tag.js'
import { views } from '@/api/sys_config.js'
import Vue3Tinymce from '@/components/Vue3Tinymce/src/Main.vue'
import MdEditor from '@/components/MdEditor/index.vue'
import DynamicForm from '@/components/DynamicForm.vue'
import Code from '@/components/editor/code.vue'

import { tinymceSet, getTinymceUploadUrl } from '@/config/tinymce.js'

import {
  addLabelValue,
  getImgUrlFromStr,
  filterHtml,
  treeById,
  tree,
  showErrors,
  parseJsonText,
} from '@/utils/tool.js'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

// 转换Markdown为HTML
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})
turndownService.use(gfm)

const router = useRouter()
const route = useRoute()
// isPage=true 时作为「单页管理」编辑表单：隐藏 tag/属性等文章专属字段，栏目仅限单页域
const props = defineProps({
  isPage: { type: Boolean, default: false },
})
// 本编辑器消费的栏目域：文章管理 = article/image/video，单页管理 = page
const categoryDomain = computed(() => (props.isPage ? DOMAIN.page : DOMAIN.article))
const isEdit = computed(() => !!route.params.id)
const originalContent = ref('')
const loading = ref(true)
const categorySelected = ref(null)
const activeName = ref('first')
const activeIndex = ref('0')
const category = ref([])
const cateList = ref([])
const viewsList = ref([])
const autoImg = ref(false)
const autoDes = ref(false)
const picNum = ref(1)
const taglist = ref([])

const file = ref()
const paramsRef = ref()
const img = ref('')
const editorType = ref('rich')
const setting = reactive(tinymceSet)
const params = reactive({
  id: 0,
  cid: 0,
  subCid: [],
  title: '',
  shortTitle: '',
  tagId: [],
  attr: [],
  articleView: '',
  source: '',
  description: '',
  img: '',
  created_at: new Date(),
  updated_at: new Date(),
  content: '',
  status: '0',
  pv: 1,
  link: '',
  allowScript: 0,
  editorType: 'rich',
})
const field = ref([])
const extData = ref({});
const dynamicFormRef = ref(null);

// AIGEO：内容页独立的 AI 搜索引擎优化配置（覆盖栏目级），存于 ext_data.aigeo
const aiGeo = ref(null);
const aiGeoContent = ref('{}');
// 编辑器原文快照：语法错时留住用户输入，提交前用它重新校验并提示
const aiGeoRaw = ref('{}');
const handleAiGeoSave = (code) => {
  aiGeoRaw.value = code.content ?? '';
  const res = parseJsonText(code.content);
  // 🔴 解析失败保留原值（旧写法置 null 会随提交把已存配置清零），由 validateAiGeo() 拦截
  if (res.ok) aiGeo.value = res.value;
};
const stringifyJson = (val) => {
  if (!val) return '{}';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  try { return JSON.stringify(JSON.parse(val), null, 2); } catch { return String(val); }
};

// 关联模型下拉（文章/单页通用）：复用 useExtModel 的模型列表与选中值
const { modelOptions, selectedMid, loadModels } = useExtModel()

// 默认封面图弹窗
const coverDialog = ref(false)
const coverList = ref([])
const coverLoading = ref(false)
const selectedCover = ref('')
const loadCoverList = async () => {
  coverLoading.value = true
  try {
    const res = await fetchCoverList()
    if (res.code === 0) {
      coverList.value = res.data.list || []
      selectedCover.value = params.img || ''
    }
  } catch (error) {
    console.error('加载封面列表失败:', error)
  } finally {
    coverLoading.value = false
  }
}
const openCoverDialog = () => {
  coverDialog.value = true
}
const confirmCover = () => {
  params.img = selectedCover.value
  coverDialog.value = false
}
const downloadCover = (item) => {
  const a = document.createElement('a')
  a.href = item.url
  a.download = item.name
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
const deleteCover = async (item) => {
  try {
    const res = await deleteFile({ url: item.url })
    if (res.code === 0) {
      ElMessage({ message: '删除成功', type: 'success' })
      if (selectedCover.value === item.url) selectedCover.value = ''
      await loadCoverList()
    } else {
      ElMessage({ message: res.msg || '删除失败', type: 'error' })
    }
  } catch (error) {
    console.error(error)
  }
}
const coverHttpRequest = async ({ file }) => {
  if (!checkUploadSize(file, 'image')) return
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await uploadCover(fd)
    if (res.code === 0) {
      ElMessage({ message: '上传成功', type: 'success' })
      await loadCoverList()
    }
  } catch (error) {
    console.error('封面上传失败:', error)
  }
}

// 查询模板
const getviews = async () => {
  try {
    let res = await views()
    if (res.code === 0 && Array.isArray(res.data)) {
      viewsList.value = res.data
        .filter(item => item !== '404.html' && item !== '500.html')
        .map(item => ({ label: item, value: item }))
    } else {
      console.warn('getviews返回数据格式不正确:', res)
      viewsList.value = []
    }
  } catch (error) {
    console.error('getviews错误:', error)
    viewsList.value = []
  }
}

// 其他方法
const tinymce = () => {
  loading.value = false
}

const handleContentChange = (value) => {
  params.content = value
  originalContent.value = value
}

const aiGeoEditorRef = ref(null)

const handleClick = tab => {
  activeIndex.value = tab.index
  // 切换到扩展信息 tab 时，ACE 编辑器可能因初始隐藏导致高度为 0，强制 resize 一次
  if (tab.index === '1' && aiGeoEditorRef.value) {
    nextTick(() => {
      aiGeoEditorRef.value.resize?.()
    })
  }
}

const searchTag = async (keywords = '') => {
  try {
    // 与 book/edit 保持一致：固定 cid=0 查询全部标签，
    // 避免按文章分类过滤导致标签列表为空
    const res = await search(1, keywords, 100, 0)
    if (res.code === 0) {
      taglist.value = (res.data.list || []).map(item => ({
        label: item.name,
        value: item.id,
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

// 新增模式：查询所有栏目（完整树，目录型 is_dir=1 标记 disabled 不可归属）
const queryForAdd = async () => {
  try {
    // 取全量栏目树，非本编辑器域的节点标 disabled（不删减，保证结构完整可回显）
    let res = await find()
    if (res.code === 0) {
      let rows = markForeignDisabled(res.data || [], categoryDomain.value)
      const childIds = new Set(rows.map(r => r.pid))
      let data = rows.map(d => {
        if (Number(d.is_dir) === 1 && !childIds.has(d.id)) d.disabled = true
        return d
      })
      let end = addLabelValue(tree(data))
      cateList.value = addLabelValue(data)
      category.value = [...end]
    }
  } catch (error) {
    console.log(error)
  }
}

// 编辑模式：查询栏目并设置当前选中（完整树，目录型 is_dir=1 标记 disabled）
const queryForEdit = async () => {
  try {
    // 取全量栏目树，非本编辑器域的节点标 disabled（不删减，保证结构完整可回显）
    let res = await find()
    if (res.code === 0) {
      let rows = markForeignDisabled(res.data || [], categoryDomain.value)
      const childIds = new Set(rows.map(r => r.pid))
      let data = rows.map(d => {
        if (Number(d.is_dir) === 1 && !childIds.has(d.id)) d.disabled = true
        return d
      })
      let ids = treeById(params.cid, data)
      categorySelected.value = ids.length ? ids[ids.length - 1] : null
      let end = addLabelValue(tree(data))
      cateList.value = addLabelValue(data)
      category.value = [...end]
      // 模型：文章自身 mid 优先（getDetail 已设置），否则回退到栏目 mid
      if (!selectedMid.value) {
        const catMid = findCategoryMid(params.cid)
        selectedMid.value = catMid || 0
      }
      handleModelChange(selectedMid.value)
    }
  } catch (error) {
    console.log(error)
  }
}

const handleChange = val => {
  if (!val) {
    params.cid = 0
    selectedMid.value = 0
    field.value = []
    return
  }
  params.cid = val
  // 切换栏目：默认采用该栏目的模型，用户可手动改关联模型
  const catMid = findCategoryMid(val)
  selectedMid.value = catMid || 0
  handleModelChange(selectedMid.value)
  // 切换栏目后刷新tag列表（单页模式无 tag）
  if (!props.isPage) searchTag()
}
// 在栏目树中查找指定栏目 id 的模型 id（mid）
const findCategoryMid = (cid) => {
  if (!cid) return 0
  const walk = (nodes) => {
    for (const n of (nodes || [])) {
      if (String(n.value) === String(cid)) return n.mid ? Number(n.mid) : 0
      const found = walk(n.children)
      if (found) return found
    }
    return 0
  }
  return walk(category.value)
}

// 根据模型 id 加载扩展字段定义（复用原字段映射，保证产品/规格等字段正常渲染）
const loadFields = async (mid) => {
  if (!mid) {
    field.value = []
    return
  }
  try {
    const res = await findByMid(mid)
    if (res.code === 0) {
      // 转换字段数据格式
      field.value = (res.data.fields || []).map(item => {
        // 兼容新旧字段名
        const fieldName = item.field_name || item.ename;
        const fieldLabel = item.field_label || item.cname;

        // 解析 field_config（如果是字符串）
        let fieldConfig = item.field_config;
        if (typeof fieldConfig === 'string') {
          try {
            fieldConfig = JSON.parse(fieldConfig);
          } catch (e) {
            console.error('解析 field_config 失败:', e);
            fieldConfig = {};
          }
        }

        // 处理 defaultVal（旧数据格式兼容）
        let defaultVal = item.defaultVal;
        if (defaultVal && typeof defaultVal === 'string' && defaultVal.includes('[{')) {
          try {
            const parsed = JSON.parse(defaultVal);
            if (parsed.options) {
              defaultVal = parsed.options;
            }
          } catch {
            // 保持原值
          }
        }

        // 合并 fieldConfig 和 defaultVal（兼容旧数据）
        const config = {
          ...fieldConfig,
          defaultVal: defaultVal || fieldConfig?.defaultVal || ''
        };

        return {
          ...item,
          field_name: fieldName,
          field_label: fieldLabel,
          field_config: config
        };
      });
    } else {
      field.value = []
    }
  } catch (error) {
    console.log(error)
    field.value = []
  }
}

// 选中模型后加载字段定义
const handleModelChange = (mid) => {
  selectedMid.value = mid
  loadFields(mid)
}
const getDetail = async () => {
  try {
    loading.value = true
    let res = await detail(params.id)
    if (res.code === 0) {
      let p = res.data
      p.attr = p.attr ? p.attr.split(',') : []
      p.subCid = p.subCid ? p.subCid.split(',').map(Number) : []
      p.oldTagId = p.tagId
      p.tagId = p.tagId ? p.tagId.split(',').map(Number) : []
      p.status = p.status.toString()
      p.updated_at = new Date(p.created_at)

      if (p.editorType) {
        editorType.value = p.editorType
      }

      originalContent.value = p.content
      if (editorType.value === 'rich') {
        // 🔴 BUG 修复：富文本存储的就是 HTML，直接交给编辑器渲染即可；
        // 旧代码对 HTML 执行 marked.parse 会把 <iframe> 等标签转义成纯文本，
        // 导致编辑器中显示 HTML 源码（如 B站/腾讯视频 iframe 嵌入）。
        // 仅当历史数据仍是 markdown 时才用 marked 转换（兼容旧数据）。
        const looksLikeHtml = /<\/?[a-z][\s\S]*?>/i.test(p.content || '')
        if (!looksLikeHtml) {
          p.content = marked.parse(p.content || '')
        }
      }

      // 排除 ext_data 字段，不要合并到 params（ext_data 已单独存储）
      const { ext_data: extField, ...rest } = p;
      Object.assign(params, rest)
      extData.value = extField || {}
      // AIGEO：从 ext_data 中拆出 aigeo 单独编辑，避免被模型表单误渲染
      if (extData.value && extData.value.aigeo != null) {
        aiGeo.value = extData.value.aigeo
        aiGeoContent.value = stringifyJson(extData.value.aigeo)
        delete extData.value.aigeo
      } else {
        aiGeo.value = null
        aiGeoContent.value = '{}'
      }
      // 原文快照初始化：未编辑编辑器时，提交校验直接用库里带回来的值
      aiGeoRaw.value = aiGeoContent.value
      // specs.options 在编辑器里用逗号文本框呈现，加载时把嵌套字符串数组合并为逗号串
      if (extData.value && Array.isArray(extData.value.specs)) {
        extData.value.specs = extData.value.specs.map(it => ({
          ...it,
          options: Array.isArray(it.options) ? it.options.join(',') : (it.options || '')
        }));
      }
      // 关联模型：优先文章自身 mid，回退到栏目模型由 queryForEdit 处理
      const articleMid = (p.mid && p.mid !== 0 && p.mid !== '0') ? Number(p.mid) : 0
      selectedMid.value = articleMid
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAttr = e => {
  console.log('e-->', e)
}

const toTagManage = () => {
  // 相对当前目录跳转（hash 路由）：打包绑定域名后若部署在子路径（如 /admin/），
  // 用 /#/tag 会跳到站点根目录导致 404；./#/tag 始终定位到 admin 所在目录
  window.open('./#/tag', '_blank')
}

const beforeUpload = rawFile => {
  if (rawFile.type.indexOf('image') === -1) {
    ElMessage({
      message: '上传文件只能是图片格式',
      type: 'error',
    })
    return false
  }
  if (!checkUploadSize(rawFile, 'image')) return false
  file.value = rawFile
  const reader = new FileReader()
  reader.onload = async e => {
    let data
    if (typeof e.target.result === 'object') {
      data = window.URL.createObjectURL(new Blob([e.target.result]))
    } else {
      data = e.target.result
    }
    img.value = data
  }
  reader.readAsArrayBuffer(rawFile)
  return true
}
const getupload = async () => {
  if (!checkUploadSize(file.value, 'image')) {
    return false
  }
  const fd = new FormData()
  fd.append('file', file.value)
  const res = await upload(fd, 'image')
  if (res.code === 0) {
    // 统一中转：按当前存储 provider 的 url_domain 配置挑 path 或 url（见 utils/oss-url.js）
    const url = Array.isArray(res.data)
      ? resolveOssUrl(res.data[0], res.provider)
      : resolveOssUrl(res.data, res.provider);
    if (url) {
      params.img = url;
    }
  }
}
// 新增文章
const createArticle = async () => {
  try {
    const paramsCopy = { ...params }
    paramsCopy.attr = params.attr.toString()
    paramsCopy.tagId = params.tagId.toString()
    paramsCopy.editorType = editorType.value
    // 关联模型 id（放 defaultParams，后端 create 会一并写入 cms_article.mid）
    paramsCopy.mid = selectedMid.value ?? 0
    if (!params.img && autoImg.value) {
      params.img = getImgUrlFromStr(params.content)[0]
    }
    if (!params.description && autoDes.value) {
      params.description = filterHtml(params.content).slice(0, 255)
    }

    // 直接从 DynamicForm 获取最新数据，避免 v-model 同步延迟
    // 🔴 根因修复（2026-08-21）：defineExpose 暴露的 ref 自动解包，formData 直接是对象（无 .value）
    const latestFieldData = dynamicFormRef.value?.formData || extData.value;
    const extDataParams = {};
    Object.keys(latestFieldData).forEach(key => {
      let val = latestFieldData[key];
      // specs 的 options 在编辑器里是逗号文本框，保存时拆回数组，保证页面按数组渲染
      if (key === 'specs' && Array.isArray(val)) {
        val = val.map(it => ({
          ...it,
          options: typeof it.options === 'string'
            ? it.options.split(',').map(s => s.trim()).filter(Boolean)
            : (it.options || [])
        }));
      }
      extDataParams[key] = Array.isArray(val) ? JSON.stringify(val, null, 2) : val;
    });
    // AIGEO：内容页独立配置，合并进 ext_data.aigeo（空对象则不写入，相当于清除）
    if (aiGeo.value && typeof aiGeo.value === 'object' && Object.keys(aiGeo.value).length) {
      extDataParams.aigeo = aiGeo.value;
    }
    const res = await create({ defaultParams: paramsCopy, extData: extDataParams })
    if (res.code === 0) {
      ElMessage({
        message: '新增成功^_^',
        type: 'success',
      })
      router.go(-1)
    }
  } catch (error) {
    console.error(error)
  }
}

// 更新文章
const articleUpdate = async () => {
  try {
    let paramsCopy = { ...params }
    paramsCopy.attr = paramsCopy.attr.toString()
    paramsCopy.subCid = paramsCopy.subCid.toString()
    paramsCopy.tagId = paramsCopy.tagId.toString()
    paramsCopy.editorType = editorType.value
    // 关联模型 id（放顶层，后端 update 会更新 cms_article.mid）
    paramsCopy.mid = selectedMid.value ?? 0

    if (!paramsCopy.img && autoImg.value) {
      paramsCopy.img = getImgUrlFromStr(paramsCopy.content)[0]
    }

    if (!paramsCopy.description && autoDes.value) {
      paramsCopy.description = filterHtml(paramsCopy.content).substr(0, 255)
    }

    const extDataParams = {};
    // 直接从 DynamicForm 获取最新数据，避免 v-model 同步延迟
    // 🔴 根因修复（2026-08-21）：defineExpose 暴露的 ref 会被 Vue 自动解包——
    // dynamicFormRef.value.formData 直接就是内部 formData 对象（没有 .value）。
    // 旧代码写 formData?.value，永远取到 undefined → 恒回退 extData（150ms 防抖前的旧快照）→ 保存丢失。
    // 现在直接取解包后的对象，保证拿到最新编辑值（连 150ms 防抖窗口内的输入也不丢）。
    const latestFieldData = dynamicFormRef.value?.formData || extData.value;
    Object.keys(latestFieldData).forEach(key => {
      let val = latestFieldData[key];
      // specs 的 options 在编辑器里是逗号文本框，保存时拆回数组，保证页面按数组渲染
      if (key === 'specs' && Array.isArray(val)) {
        val = val.map(it => ({
          ...it,
          options: typeof it.options === 'string'
            ? it.options.split(',').map(s => s.trim()).filter(Boolean)
            : (it.options || [])
        }));
      }
      extDataParams[key] = Array.isArray(val) ? JSON.stringify(val, null, 2) : val;
    });
    // AIGEO：内容页独立配置，合并进 ext_data.aigeo（空对象则不写入，相当于清除）
    if (aiGeo.value && typeof aiGeo.value === 'object' && Object.keys(aiGeo.value).length) {
      extDataParams.aigeo = aiGeo.value;
    }

    let res = await update({ ...paramsCopy, ext_data: extDataParams })
    if (res.code === 0) {
      ElMessage({
        message: '更新成功^_^',
        type: 'success',
      })
      router.go(-1)
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * 提交前校验 AI GEO 编辑器语法：错误则提示并拦住提交。
 * 🔴 旧逻辑 try/catch 静默置 null，null 随 ext_data 写库 = 静默清空已存配置。
 */
const validateAiGeo = () => {
  const res = parseJsonText(aiGeoRaw.value)
  if (!res.ok) {
    ElMessage({
      message: `AI GEO JSON 语法错误，已阻止提交：${res.error}。请修正后再保存。`,
      type: 'error',
      duration: 6000,
      showClose: true,
    })
    return false
  }
  aiGeo.value = res.value
  return true
}

const submit = formEl => {
  if (!formEl) return

  // 🔴 AI GEO 语法校验前置：错误则提示并拦下，绝不带着 null 提交
  if (!validateAiGeo()) return

  // 先验证基本信息
  formEl.validate((valid, invalidFields) => {
    if (!valid) {
      showErrors(invalidFields)
      return false
    }

    if (params.cid === 0) {
      ElMessage({
        message: '请选择栏目^_^',
        type: 'warning',
      })
      return
    }

    // 验证扩展字段
    if (field.value.length > 0 && dynamicFormRef.value) {
      const fieldValid = dynamicFormRef.value.validate()
      if (!fieldValid.valid) {
        ElMessage({
          message: fieldValid.messages[0] || '请填写必填字段',
          type: 'warning',
        })
        return false
      }
    }

    // 全部验证通过，提交表单
    if (isEdit.value) {
      articleUpdate()
    } else {
      createArticle()
    }
  })
}

// 编辑器切换：标记切换状态，避免 content watcher 在转换期间反向回写
let isSwitchingEditor = false

watch(editorType, (newType) => {
  // 标记正在切换，阻止 content watcher 把转换结果再转回去
  isSwitchingEditor = true
  setTimeout(() => {
    isSwitchingEditor = false
  }, 500)

  if (!originalContent.value) {
    return
  }

  if (newType === 'rich') {
    try {
      params.content = marked.parse(originalContent.value)
    } catch (error) {
      console.error('Markdown 转 HTML 失败:', error)
    }
  } else if (newType === 'markdown') {
    params.content = originalContent.value
  }
})

// 内容变化：富文本 → Markdown 同步（仅在非切换状态下）
watch(() => params.content, (newContent) => {
  if (!isSwitchingEditor && editorType.value === 'rich' && newContent && newContent !== originalContent.value) {
    try {
      const markdown = turndownService.turndown(newContent)
      originalContent.value = markdown
    } catch (error) {
      console.error('HTML 转 Markdown 失败:', error)
    }
  }
})

// 初始化
onMounted(async () => {
  setting.images_upload_url = await getTinymceUploadUrl()
  await loadUploadConfig()
  await loadModels()
  const id = route.params.id
  if (id) {
    // 编辑模式
    params.id = id
    await getDetail()
    await queryForEdit()
  } else {
    // 新增模式
    params.content = '欢迎使用ChanCMS系统'
    await queryForAdd()
  }
  if (!props.isPage) searchTag()
  getviews()
})

// 监听路由变化，切换编辑/新增时重新加载数据
watch(() => route.params.id, async (newId, oldId) => {
  // id 变化时重新加载（包括从编辑切换到新增，或新增切换到编辑）
  const idChanged = String(newId || '') !== String(oldId || '')
  if (idChanged) {
    loading.value = true
    if (newId) {
      // 编辑模式
      params.id = newId
      await getDetail()
      await queryForEdit()
    } else {
      // 新增模式
      params.id = 0
      params.content = '欢迎使用ChanCMS系统'
      // 重置其他字段
      Object.assign(params, {
        cid: 0, subCid: [], title: '', shortTitle: '', tagId: '',
        attr: [], articleView: '', source: '', description: '', img: '',
        content: '欢迎使用ChanCMS系统', status: '0', pv: 1, link: '',
        allowScript: 0, editorType: 'rich'
      })
      await queryForAdd()
    }
    if (!props.isPage) searchTag()
    getviews()
    loading.value = false
  }
})
</script>
<style lang="less" scoped>
:deep(.tiny-textarea) {
  height: 436px;
}

// 图片上传组件样式
.cover {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .img-item {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e4e7ed;

    :deep(.el-image) {
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .imgs-btn {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;

      .el-icon {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      }
    }

    &:hover .imgs-btn {
      opacity: 1;
    }
  }
}

// 默认封面图弹窗样式
.cover-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cover-count {
  color: #909399;
  font-size: 13px;
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 14px;
  min-height: 120px;
  padding: 4px;
}

.cover-card {
  position: relative;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: border-color 0.2s ease;

  .cover-img {
    width: 100%;
    height: 100%;
  }

  .cover-actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 4px 0;
    background: rgba(0, 0, 0, 0.45);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .cover-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: #165dff;
    color: #fff;
    font-size: 12px;
    line-height: 1;
    padding: 4px 6px;
    border-radius: 4px;
  }

  &:hover {
    border-color: #165dff;

    .cover-actions {
      opacity: 1;
    }
  }

  &.active {
    border-color: #165dff;
    box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
  }
}

.cover-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

// 多图上传按钮样式（不影响缩略图）
:deep(.pics-uploader) {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;

  &:hover {
    border-color: #409eff;
    background: #f5f7fa;
  }

  .upload-icon {
    font-size: 28px;
    color: #8c939d;
  }
}

// 缩略图上传区横向布局：上传 + 预览 + 默认封面按钮 + URL 输入框
.thumb-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.thumb-input-row>.el-input {
  flex: 1;
  min-width: 0;
}

// tag 下拉选择框与按钮单行布局（与 book/edit 保持一致）
.tag-form-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

.tag-select {
  flex: 1;
  width: auto !important;
}

// 关联模型与模型信息上下排列，模型信息直接展示字段（不分 tab/不分步）
.model-select-item {
  margin-top: 8px;
}

.model-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>

<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="page-header mb-20">
      <div class="page-title">{{ isEdit ? '修改栏目' : '新增栏目' }}</div>
    </div>

    <div class="edit-content">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="first"></el-tab-pane>
        <el-tab-pane label="SEO设置" name="second"></el-tab-pane>
        <el-tab-pane label="扩展信息" name="third"></el-tab-pane>
        <el-tab-pane label="模板配置" name="fourth"></el-tab-pane>
      </el-tabs>

      <el-form ref="paramsRef" :model="params" label-width="84px" label-position="top">
        <div v-show="activeIndex === 0">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="上级栏目">
                <el-tree-select v-model="categorySelected" :data="category" node-key="id"
                  :props="{ label: 'label', children: 'children' }" placeholder="不选择为顶级栏目" clearable
                  filterable check-strictly style="width: 100%" @change="handleChange" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="栏目名称" prop="name" :rules="[
                { required: true, message: '请输入栏目名称', trigger: 'blur' },
                { min: 1, max: 50, message: '栏目不能超过50个字', trigger: 'blur' },
              ]">
                <el-input v-model="params.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="栏目标识" prop="pinyin"
                :rules="[{ required: true, message: '请输入导航路径', trigger: 'blur' }]">
                <el-input v-model="params.pinyin" @change="changePath" placeholder="注：首页请填写home"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="栏目路径">
                <el-input v-model="params.path" :disabled="true"></el-input>
              </el-form-item>
            </el-col>



            <el-col :span="12">
              <el-form-item label="列表模板">
                <el-select v-model="params.listView" placeholder="Select" style="width: 100%">
                  <el-option v-for="item in viewsList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="内容模板">
                <el-select v-model="params.articleView" placeholder="Select" style="width: 100%">
                  <el-option v-for="item in viewsList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="栏目类型">
                <el-radio v-model="params.type" :value="0">栏目</el-radio>
                <el-radio v-model="params.type" :value="1">单页</el-radio>
              </el-form-item>
            </el-col>

            <!-- 内容域：仅根栏目可选（根栏目声明、子孙继承；域之间互不可见，避免栏目串门） -->
            <el-col :span="12" v-if="!params.pid">
              <el-form-item label="内容类型">
                <el-select v-model="params.content_type" placeholder="请选择内容类型" style="width: 100%">
                  <el-option v-for="(label, key) in CONTENT_TYPE_LABEL" :key="key" :label="label" :value="key" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="是否显示">
                <el-radio v-model="params.status" :value="0">显示</el-radio>
                <el-radio v-model="params.status" :value="1">隐藏</el-radio>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="栏目图片">
                <div class="thumb-input-row">
                  <el-upload class="avatar-uploader" :http-request="handleImageUpload" :show-file-list="false"
                    :before-upload="beforeImageUpload">
                    <el-popover placement="top-start" title="上传" :width="200" trigger="hover" content="点击上传栏目图片">
                      <template #reference>
                        <el-icon class="avatar-uploader-icon">
                          <MostlyCloudy />
                        </el-icon>
                      </template>
                    </el-popover>
                  </el-upload>

                  <el-popover v-if="params.image" placement="right" :width="400" trigger="hover">
                    <template #reference>
                      <el-image class="avatar-uploader-icon pointer" :src="params.image" fit="cover" />
                    </template>
                    <el-image style="width: 100%" :src="params.image" />
                  </el-popover>

                  <el-input v-model="params.image" class="flex-1" />
                </div>
              </el-form-item>
            </el-col>
            <!-- Lite 裁剪：栏目不关联任何模型（内容模型/页面模型/页面扩展字段均移除），仅文章可挂模型 -->
          </el-row>
        </div>

        <div v-show="activeIndex === 1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="seo标题">
                <el-input v-model="params.seoTitle"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="seo关键词">
                <el-input v-model="params.seoKeywords"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="seo描述">
                <el-input type="textarea" prop="textarea" :rows="2" v-model="params.seoDescription"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="AI GEO">
                <el-row class="w-full">
                  <el-col :span="24">
                    <div class="code-editor-wrapper">
                      <Code :content-id="currentId" :file-type="'json'" :content="aiGeoContent"
                        @save="handleAiGeoSave" />
                    </div>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-show="activeIndex === 2">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="栏目链接">
                <el-input v-model="params.url"></el-input>
              </el-form-item>
            </el-col>



            <el-col :span="12">
              <el-form-item label="打开方式">
                <el-radio v-model="params.target" :value="0">当前页面</el-radio>
                <el-radio v-model="params.target" :value="1">新页面</el-radio>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="栏目排序">
                <el-input v-model="params.orderBy"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="栏目描述">
                <el-input type="textarea" prop="textarea" :rows="2" v-model="params.description"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-show="activeIndex === 3">
          <el-form-item label="模板数据">
            <el-row class="w-full">
              <el-col :span="24">
                <div class="code-editor-wrapper data-config-editor">
                  <Code :content-id="currentId" :file-type="currentType" :content="fileContent"
                    @save="handleDataConfigSave" />
                </div>
              </el-col>
            </el-row>
          </el-form-item>
        </div>

      </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit(paramsRef)" v-permission="['cms:category:create', 'cms:category:update']">保存</el-button>
      <el-button size="large" @click="back">取消</el-button>
    </div>
  </div>
</template>

<script setup name="category-edit">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { find, create, findId, update } from '@/api/category.js';
import { CONTENT_TYPE_LABEL } from '@/constants/contentTypes.js';
import { search } from '@/api/article.js';
import { views } from '@/api/sys_config.js';
import { addLabelValue, tree, showErrors, parseJsonText } from '@/utils/tool.js';
import { list } from '@/api/model.js';
import { upload } from '@/api/upload.js';
import { loadUploadConfig, beforeImageUpload as checkImageUpload, resolveOssUrl } from '@/utils/upload.js';
import Code from '@/components/editor/code.vue';
import DynamicForm from '@/components/DynamicForm.vue';
import { useExtModel } from '@/composables/useExtModel.js';
import { QuestionFilled, MostlyCloudy } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();

// 编辑模式：路由带 /category/edit/:id；新增模式：/category/add?parentId=xxx
const isEdit = computed(() => !!route.params.id && route.params.id !== '0');
const parentId = computed(() => Number(route.query.parentId) || 0);

const categorySelected = ref(-1);
const categorySelectedPath = ref('');
const activeName = ref('first');
const activeIndex = ref(0);
const category = ref([]);
const categoryRaw = ref([]);
const cate = ref([]);
const modList = ref([]);
const modelFlag = ref(false);
const viewsList = ref([]);
const oldPath = ref('');
const currentId = ref(0);
const currentType = ref('json');
const fileContent = ref('{}');
const aiGeoContent = ref('{}');
// 编辑器原文快照：解析失败也要留住用户输入，提交前用它重新校验，
// 否则语法错会让字段变成 null 并被提交，把库里已存配置清零（2026-09-01 aigeo 事故）
const dataConfigRaw = ref('{}');
const aiGeoRaw = ref('{}');
const paramsRef = ref(null);

// 栏目「页面模型」独立实例：page_mid + page_ext_data，用于栏目自身页面元数据
// 用途：栏目作为渲染页本身的元数据（banner/intro/底栏等），区别于子文章的内容扩展
const {
  field: pageField,
  extData: pageExtData,
  dynamicFormRef: pageDynamicFormRef,
  handleModelChange: handlePageModelChange,
  initExtData: initPageExtData,
  buildExtData: buildPageExtData,
} = useExtModel();

const defaultParams = {
  pid: 0,
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
  name: '',
  path: '',
  pinyin: '',
  mid: 0,
  page_mid: 0,
  description: '',
  url: '',
  orderBy: 0,
  type: 0,
  content_type: 'article',
  target: 0,
  status: 0,
  articleView: 'article.html',
  listView: 'list.html',
  dataConfig: null,
  image: '',
  aigeo: null,
};

const params = reactive({ ...defaultParams });

const resetForm = () => {
  Object.assign(params, { ...defaultParams, pid: parentId.value || 0 });
  categorySelected.value = -1;
  categorySelectedPath.value = '';
  oldPath.value = '';
  fileContent.value = '{}';
  aiGeoContent.value = '{}';
  dataConfigRaw.value = '{}';
  aiGeoRaw.value = '{}';
  activeName.value = 'first';
  activeIndex.value = 0;
  currentId.value = Number(route.params.id) || 0;
};

// 编辑器内容变化：留原文 + 尝试解析。
// 🔴 解析失败时不再置 null（旧写法会把字段清空并随提交覆盖库里配置），
// 改为保留原值，由 validateJsonEditors() 在提交前统一提示并拦截。
const handleDataConfigSave = (code) => {
  dataConfigRaw.value = code.content ?? '';
  const res = parseJsonText(code.content);
  if (res.ok) params.dataConfig = res.value;
};
const handleAiGeoSave = (code) => {
  aiGeoRaw.value = code.content ?? '';
  const res = parseJsonText(code.content);
  if (res.ok) params.aigeo = res.value;
};

const beforeImageUpload = (rawFile) => {
  const ok = checkImageUpload(rawFile, 'image');
  return ok;
};
const handleImageUpload = async ({ file }) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await upload(fd, 'image');
  if (res.code === 0) {
    params.image = resolveOssUrl(res.data[0], res.provider);
    ElMessage({ message: '上传成功', type: 'success' });
  }
};

const changePath = () => {
  if (categorySelectedPath.value) {
    params.path = categorySelectedPath.value + params.pinyin;
  } else {
    params.path = '/' + params.pinyin;
  }
};

const handleTabClick = (tab) => {
  activeIndex.value = parseInt(tab.index);
};

const hasArticle = async () => {
  if (!isEdit.value) return;
  try {
    const res = await search(1, '', route.params.id);
    if (res.code == 0) {
      modelFlag.value = res.data.total > 0 ? true : false;
    }
  } catch (error) {
    console.log(error);
  }
};

const queryCategoryTree = async () => {
  try {
    const res = await find();
    if (res.code === 0) {
      categoryRaw.value = res.data;
      cate.value = res.data;
      const treeData = addLabelValue(tree(res.data));
      category.value = [{ id: -1, label: '顶级栏目' }, ...treeData];
    }
  } catch (error) {
    console.log(error);
  }
};

const setParentSelected = () => {
  const pid = parentId.value;
  if (!pid || pid <= 0) {
    categorySelected.value = -1;
    params.pid = 0;
    return;
  }
  categorySelected.value = pid;
  params.pid = pid;
  // 根据父级 path 自动拼接当前 path
  const parent = categoryRaw.value.find(c => c.id === pid);
  if (parent) {
    categorySelectedPath.value = parent.path + '/';
    changePath();
  }
};

const setEditSelected = () => {
  const id = Number(route.params.id);
  const self = categoryRaw.value.find(c => c.id === id);
  const pid = self ? (Number(self.pid) || 0) : 0;
  categorySelected.value = pid === 0 ? -1 : pid;
};

const findById = async () => {
  if (!isEdit.value) return;
  try {
    const res = await findId(route.params.id);
    if (res.code === 0) {
      oldPath.value = res.data.path;
      Object.assign(params, res.data);
      params.type = Number(params.type) || 0;
      params.status = Number(params.status) || 0;
      params.target = Number(params.target) || 0;
      params.mid = Number(params.mid) || 0;
      params.pid = Number(res.data.pid) || 0;

      let path = [];
      cate.value.forEach((sub) => {
        if (sub.id == res.data.pid) {
          path.push('/' + sub.pinyin);
        }
      });
      categorySelectedPath.value = path.join('') + '/';

      fileContent.value = stringifyJson(res.data.dataConfig);
      aiGeoContent.value = stringifyJson(res.data.aigeo);
      // 原文快照初始化：用户未编辑编辑器时，提交校验直接用库里带回来的值
      dataConfigRaw.value = fileContent.value;
      aiGeoRaw.value = aiGeoContent.value;
      params.mid = Number(res.data.mid) || 0;
      // 初始化页面模型字段（栏目页面自身元数据，与内容模型独立）
      params.page_mid = Number(res.data.page_mid) || 0;
      initPageExtData(res.data.page_ext_data);
      await handlePageModelChange(params.page_mid);
    }
  } catch (error) {
    console.error(error);
  }
};

const stringifyJson = (val) => {
  if (!val) return '{}';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  try { return JSON.stringify(JSON.parse(val), null, 2); } catch { return String(val); }
};

const getviews = async () => {
  try {
    const res = await views();
    if (res.code === 0) {
      viewsList.value = res.data
        .filter((item) => item !== '404.html' && item !== '500.html')
        .map((item) => ({ label: item, value: item }));
    }
  } catch (error) {
    console.log(error);
  }
};

const handleChange = (val) => {
  if (val == null || val === -1) {
    params.pid = 0;
    categorySelectedPath.value = '';
    changePath();
    return;
  }
  const selected = categoryRaw.value.find((sub) => sub.id === val);
  if (selected) {
    categorySelectedPath.value = selected.path + '/';
  }
  params.pid = val;
  changePath();
};

const modelList = async () => {
  try {
    const res = await list();
    if (res.code === 0) {
      modList.value = res.data.list;
    }
  } catch (error) {
    console.log(error);
  }
};

const checkStrictly = () => {
  if (params.pinyin === 'article') {
    ElMessage({ message: '不能使用article作为路径', type: 'error' });
    return false;
  }
  const regex = /^[a-zA-Z][a-zA-Z0-9]*$/;
  if (!regex.test(params.pinyin)) {
    ElMessage({ message: '拼音只能包含26个字母和数字，且首字母不能是数字', type: 'error' });
    return false;
  }
  return true;
};

/**
 * 提交前校验两个 JSON 编辑器的语法（模板数据 / AI GEO）。
 * 🔴 必须前置：语法错时旧逻辑会把字段置 null 并照常提交，
 * 等于"静默清空库里已存配置"，用户完全无感知。这里改为提示 + 拦住提交。
 */
const validateJsonEditors = () => {
  const checks = [
    { key: 'dataConfig', raw: dataConfigRaw.value, label: '模板数据', tab: '模板配置' },
    { key: 'aigeo', raw: aiGeoRaw.value, label: 'AI GEO', tab: 'SEO设置' },
  ];
  for (const item of checks) {
    const res = parseJsonText(item.raw);
    if (!res.ok) {
      ElMessage({
        message: `${item.label} JSON 语法错误，已阻止提交：${res.error}。请到「${item.tab}」页签修正后再保存。`,
        type: 'error',
        duration: 6000,
        showClose: true,
      });
      return false;
    }
    // 用最新原文刷新待提交值（编辑器内容可能比 params 新）
    params[item.key] = res.value;
  }
  return true;
};

const buildSubmitData = () => {
  const submitData = { ...params };
  if (submitData.dataConfig && typeof submitData.dataConfig === 'object') {
    submitData.dataConfig = JSON.stringify(submitData.dataConfig, null, 2);
  }
  // 内容模型扩展字段：编辑时由 findId 带回（对象或 JSON 字符串），
  // 统一归一为对象再提交，不能硬编码清空，否则已有 ext_data 会在保存时丢失（丢传参）
  let extRaw = submitData.ext_data;
  if (typeof extRaw === 'string') {
    try { extRaw = JSON.parse(extRaw); } catch { extRaw = {}; }
  }
  submitData.ext_data = (extRaw && typeof extRaw === 'object') ? extRaw : {};
  submitData.page_ext_data = buildPageExtData();
  if (submitData.aigeo && typeof submitData.aigeo === 'object') {
    submitData.aigeo = JSON.stringify(submitData.aigeo, null, 2);
  }
  return submitData;
};

const back = () => {
  router.push('/category');
};

const categoryAdd = async () => {
  try {
    const res = await create(buildSubmitData());
    if (res.code === 0) {
      ElMessage({ message: '新增成功^_^', type: 'success' });
      back();
    } else {
      ElMessage({ message: res.msg, type: 'error' });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async () => {
  try {
    const res = await update(buildSubmitData());
    if (res.code === 0) {
      ElMessage({ message: '更新成功^_^', type: 'success' });
      back();
    } else {
      ElMessage({ message: res.msg, type: 'error' });
    }
  } catch (error) {
    console.log(error);
  }
};

const submit = (formRef) => {
  if (!formRef) return;
  // 🔴 JSON 编辑器语法校验前置：语法错误时提示并拦下，绝不带着 null 提交
  if (!validateJsonEditors()) return;
  formRef.validate((valid, invalidFields) => {
    if (valid) {
      // 校验页面扩展字段
      if (pageField.value.length > 0 && pageDynamicFormRef.value) {
        const rp = pageDynamicFormRef.value.validate();
        if (!rp.valid) {
          ElMessage({ message: rp.messages[0] || '请填写必填页面扩展字段', type: 'warning' });
          return;
        }
      }
      if (isEdit.value && oldPath.value != params.path) {
        ElMessageBox.confirm('栏目路径已修改，若有子栏目请同步修改！！！', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          checkStrictly() && updateCategory();
        }).catch(() => {
          ElMessage({ type: 'info', message: '操作取消成功！' });
        });
      } else {
        if (!checkStrictly()) return;
        isEdit.value ? updateCategory() : categoryAdd();
      }
    } else {
      showErrors(invalidFields);
    }
  });
};

const init = async () => {
  await loadUploadConfig();
  await modelList();
  await getviews();
  await queryCategoryTree();
  if (isEdit.value) {
    setEditSelected();
    await findById();
    hasArticle();
  } else {
    setParentSelected();
  }
};

onMounted(() => {
  resetForm();
  init();
});
</script>

<style scoped>
.flex {
  display: flex;
  align-items: flex-start;
}

.flex-1 {
  flex: 1;
}

.ml-10 {
  margin-left: 10px;
}

.pointer {
  cursor: pointer;
}

.page-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}


.code-editor-wrapper {
  border-radius: 4px;
  overflow-y: auto;
}

.code-editor-wrapper.data-config-editor {
  height: calc(100vh - 400px);
  min-height: 240px;
}
</style>

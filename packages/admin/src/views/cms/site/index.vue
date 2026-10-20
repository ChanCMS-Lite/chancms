<template>
  <div class="page bg-fff radius-6 edit-page">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="edit-content">
      <el-tab-pane label="基本设置" class="mt-20" name="first">
        <el-form ref="infoRef" :model="info" label-width="84px" label-position="top">
          <el-row :gutter="20" class="w-full">
            <el-col :span="12">
              <el-form-item label="网站名称" prop="name" :rules="[
                {
                  required: true,
                  message: '请输入网站名称',
                  trigger: 'blur',
                },
                {
                  min: 2,
                  max: 20,
                  message: '长度在 2 到 20 个字符',
                  trigger: 'blur',
                },
              ]">
                <el-input v-model="info.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Logo">
                <div class="flex items-center gap-5 w-full">
                  <el-upload class="avatar-uploader" :http-request="handleUpload" :show-file-list="false"
                    :before-upload="beforeUpload">
                    <el-popover placement="top-start" title="上传" :width="200" trigger="hover"
                      :content="uploadTip('image', '上传图片作为站点Logo')">
                      <template #reference>
                        <el-icon class="avatar-uploader-icon">
                          <MostlyCloudy />
                        </el-icon>
                      </template>
                    </el-popover>
                  </el-upload>
                  <el-popover v-if="info.logo" placement="right" :width="600" trigger="click">
                    <template #reference>
                      <el-image class="logo pointer" :src="info.logo" />
                    </template>
                    <el-image :src="info.logo" />
                  </el-popover>
                  <el-input v-model="info.logo" class="flex-1"></el-input>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">

              <el-form-item prop="domain" label="网站域名">
                <el-input v-model="info.domain"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="email" label="站长邮箱">
                <el-input v-model="info.email" :rules="[
                  {
                    type: 'email',
                    message: '请输入正确的邮箱',
                    trigger: ['blur', 'change'],
                  },
                ]"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="tel" label="联系电话">
                <el-input v-model="info.tel"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="address" label="单位地址">
                <el-input v-model="info.address"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="icp" label="ICP备案号">
                <el-input v-model="info.icp"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="copyright" label="版权信息">
                <el-input v-model="info.copyright"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="code" label="统计代码">
                <el-input type="textarea" :rows="3" v-model="info.code"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="status" label="站点状态">
                <el-switch v-model="info.status" :active-value="1" :inactive-value="0" active-text="正常"
                  inactive-text="关闭" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item v-if="info.status === 0" prop="close_tips" label="关闭提示">
                <el-input type="textarea" :rows="2" v-model="info.close_tips" placeholder="站点关闭时显示的提示信息"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="SEO设置" class="mt-20" name="second">
        <el-form ref="seoRef" :model="seo" label-width="84px" label-position="top">
          <el-row :gutter="20" class="w-full">
            <el-col :span="12">
              <el-form-item label="标题" prop="title" :rules="[
                {
                  required: true,
                  message: '请输入网站标题',
                  trigger: 'blur',
                },
                {
                  min: 2,
                  max: 20,
                  message: '长度在 2 到 20 个字符',
                  trigger: 'blur',
                },
              ]">
                <el-input v-model="seo.title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="keywords" label="关键词">
                <el-input v-model="seo.keywords"></el-input>
              </el-form-item>

            </el-col>
            <el-col :span="24">
              <el-form-item prop="description" label="描述" :rules="[
                {
                  min: 2,
                  max: 255,
                  message: '字数限制255',
                  trigger: 'blur',
                },
              ]">
                <el-input type="textarea" :rows="3" v-model="seo.description"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="AI GEO">
                <el-row class="w-full">
                  <el-col :span="24">
                    <div class="code-editor-wrapper">
                      <Code :content-id="info.id || 0" :file-type="'json'" :content="aiGeoContent"
                        @save="handleAiGeoSave" />
                    </div>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <ConfigSet ref="configRef" />

    </el-tabs>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submitAll" v-permission="['cms:site:update']">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getSiteInfo, update } from "./api/index.js";
import ConfigSet from "./components/config.vue";
import Code from '@/components/editor/code.vue';
import { uploadLogo } from "@/api/upload.js";
import { loadUploadConfig, beforeImageUpload, uploadTip, resolveOssUrl } from "@/utils/upload.js";
import { parseJsonText } from "@/utils/tool.js";

const activeName = ref('first');
const infoRef = ref(null);
const seoRef = ref(null);
const configRef = ref(null);

const info = reactive({
  id: '',
  name: '',
  domain: '',
  logo: '',
  email: '',
  tel: '',
  address: '',
  icp: '',
  copyright: '',
  code: '',
  status: 1,
  close_tips: '',
});

const seo = reactive({
  id: '',
  title: '',
  keywords: '',
  description: ''
});

// AIGEO：站点级 AI 搜索引擎优化（站点级兜底，无栏目/内容 aigeo 时生效）。
// 存到 cms_site.ext_data.aigeo（不增字段），Common.site() 通过 mergeExtData 自动提到顶层 site.aigeo。
const aiGeo = ref(null);
const aiGeoContent = ref('{}');
// 编辑器原文快照：语法错时留住用户输入，提交前用它重新校验并提示
const aiGeoRaw = ref('{}');
const handleAiGeoSave = (code) => {
  aiGeoRaw.value = code.content ?? '';
  const res = parseJsonText(code.content);
  // 🔴 解析失败保留原值（旧写法置 null 会随提交把已存配置清零），由 submitAll 拦截
  if (res.ok) aiGeo.value = res.value;
}


async function query() {
  try {
    const res = await getSiteInfo();
    if (res.code === 0) {
      const { id, name, domain, logo, email, tel, address, icp, copyright, code, status, close_tips, title, keywords, description } = res.data;
      Object.assign(info, { id, name, logo, domain, email, tel, address, icp, copyright, code, status: status ?? 1, close_tips });
      Object.assign(seo, { id, title, keywords, description });
      // AI GEO 直接读 cms_site.ext_data.aigeo（后端存于站内扩展字段，无需提顶层）
      const ext = res.data.ext_data;
      const aigeo = ext && typeof ext === 'object' ? ext.aigeo : (ext ? JSON.parse(ext).aigeo : undefined);
      if (aigeo !== undefined) {
        aiGeo.value = aigeo;
        aiGeoContent.value = JSON.stringify(aigeo, null, 2);
      }
      // 原文快照初始化：未编辑编辑器时，提交校验直接用库里带回来的值
      aiGeoRaw.value = aiGeoContent.value;
    }
  } catch (error) {
    console.error(error);
  }
}

const beforeUpload = (rawFile) => {
  return beforeImageUpload(rawFile, 'image');
};

const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file.file);
  const response = await uploadLogo(formData);
  if (response.code === 0) {
    info.logo = resolveOssUrl(response.data[0]);
  }
};



async function updateData(data) {
  try {
    const res = await update(data);
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({ message: '更新成功^_^', type: 'success' });
      await query();
    }
  } catch (error) {
    console.error(error);
  }
}

function handleClick(tab) {
  activeName.value = tab.paneName;
}

async function submitAll() {
  try {
    await infoRef.value.validate();
    await seoRef.value.validate();
    if (configRef.value) {
      await configRef.value.validate();
    }
  } catch {
    ElMessage({ message: '请检查表单必填项', type: 'warning' });
    return;
  }
  // 🔴 AI GEO 语法校验前置：错误则提示并拦住提交。
  // 旧逻辑静默置 null，null 写入 ext_data = 静默清空已存配置，用户无感知。
  const aiGeoCheck = parseJsonText(aiGeoRaw.value);
  if (!aiGeoCheck.ok) {
    ElMessage({
      message: `AI GEO JSON 语法错误，已阻止提交：${aiGeoCheck.error}。请修正后再保存。`,
      type: 'error',
      duration: 6000,
      showClose: true,
    });
    return;
  }
  aiGeo.value = aiGeoCheck.value;
  const payload = {
    ...info,
    ...seo,
    aigeo: aiGeo.value,
    ...(configRef.value ? configRef.value.getSet() : {}),
  };
  await updateData(payload);
}

onMounted(async () => {
  await loadUploadConfig();
  await query();
});
</script>

<style scoped>
.logo {
  width: auto;
  height: 32px;
  border-radius: 4px;
}

.pointer {
  cursor: pointer;
}

.edit-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.edit-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.edit-content :deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.edit-content :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 10px;
}

.edit-content :deep(.el-tab-pane) {
  height: 100%;
  overflow: visible;
}

.edit-footer {
  flex-shrink: 0;
  padding-top: 16px;
  text-align: center;
  border-top: 1px solid #eee;
}
</style>

<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form
        ref="formRef"
        :model="params"
        :rules="paramsRules"
        label-position="top"
        class="mt-20"
        v-loading="loading"
    >
      <div>
        <el-form-item label="碎片名称" prop="name">
          <el-input v-model="params.name" placeholder="请输入汉字"></el-input>
        </el-form-item>

        <el-form-item label="碎片标识" prop="mark">
          <el-input v-model="params.mark" placeholder="模板使用标识"></el-input>
        </el-form-item>

        <el-form-item label="碎片类型" prop="type">
          <el-radio-group v-model="params.type" class="ml-4">
            <el-radio :value="1">富文本</el-radio>
            <el-radio :value="2">文本框</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Lite 裁剪：碎片不归属栏目、不挂模型，仅留标识/类型/内容 -->

        <el-form-item label="碎片内容" v-if="params.type === 1">
          <vue3-tinymce
            v-model="params.content"
            :setting="setting"
            @init="tinymce"
            script-src="/public/admin/tinymce/tinymce.min.js"
          />
        </el-form-item>

        <el-form-item label="碎片内容" v-if="params.type === 2">
          <el-input
            type="textarea"
            prop="textarea"
            class="textarea"
            :rows="3"
            v-model="params.content"
          ></el-input>
        </el-form-item>

        <el-form-item label="扩展字段" v-if="field.length > 0">
          <DynamicForm
            ref="dynamicFormRef"
            :fields="field"
            v-model="extData"
          />
        </el-form-item>
      </div>

    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit" v-permission="['cms:frag:create', 'cms:frag:update']">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { create, update, detail } from '@/api/frag.js'
import { find } from '@/api/category.js'
import { tree, addLabelValue } from '@/utils/tool.js'
import Vue3Tinymce from '@/components/Vue3Tinymce/src/Main.vue'
import { tinymceSet, getTinymceUploadUrl } from '@/config/tinymce.js'
import DynamicForm from '@/components/DynamicForm.vue'
import { useExtModel } from '@/composables/useExtModel.js'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const formRef = ref(null)
const setting = reactive(tinymceSet)
const loading = ref(true)

// 通用扩展模型：选择模型 → 动态渲染 DynamicForm → 收集 ext_data
const { modelOptions, field, extData, dynamicFormRef, selectedMid, loadModels, handleModelChange, initExtData, buildExtData } = useExtModel()

const params = reactive({
  id: 0,
  type: 1,
  name: '',
  mark: '',
  content: '欢迎使用ChanCMS系统',
  mid: 0,
  ext_data: null,
  // 归属栏目：null = 全局；N = 绑定栏目（含子孙可见，覆盖同名全局碎片）
  cid: null
})

// 归属栏目树（全量，不做域过滤——碎片是横切展示内容，可绑任意栏目页）
const categoryOptions = ref([])
const loadCategories = async () => {
  try {
    const res = await find()
    if (res.code === 0) {
      categoryOptions.value = addLabelValue(tree(res.data || []))
    }
  } catch (e) {
    console.error(e)
  }
}

const paramsRules = reactive({
  name: [
    { required: true, message: '请输入栏目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符之间', trigger: 'blur' }
  ]
})

// TinyMCE 初始化
const tinymce = () => {
  loading.value = false
}

// 获取文章详情
const fetchDetail = async () => {
  if (!isEdit.value) return
  try {
    const res = await detail(params.id)
    if (res.code === 0) {
      Object.assign(params, res.data)
      params.type = +params.type
      params.cid = res.data.cid ? Number(res.data.cid) : null
      // 初始化扩展模型：回填 mid + 渲染 DynamicForm
      selectedMid.value = res.data.mid ? +res.data.mid : 0
      initExtData(res.data.ext_data)
      if (selectedMid.value) {
        await handleModelChange(selectedMid.value)
      }
      if (params.type === 2) {
        loading.value = false
      }
    }
  } catch (error) {
    console.error(error)
  }
}

// 新增
const createFragment = async () => {
  try {
    params.mid = selectedMid.value || 0
    params.ext_data = buildExtData()
    const res = await create(params)
    if (res.code === 0) {
      ElMessage({
        message: '新增成功^_^',
        type: 'success'
      })
      router.go(-1)
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 更新
const updateFragment = async () => {
  try {
    params.mid = selectedMid.value || 0
    params.ext_data = buildExtData()
    const res = await update(params)
    if (res.code === 0) {
      ElMessage({
        message: '更新成功^_^',
        type: 'success'
      })
      router.go(-1)
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 提交表单
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        updateFragment()
      } else {
        createFragment()
      }
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

// 初始化上传 URL
onMounted(async () => {
  loading.value = false
  setting.images_upload_url = await getTinymceUploadUrl()
  await loadModels()
  await loadCategories()
  if (isEdit.value) {
    params.id = parseInt(route.params.id, 10)
    await fetchDetail()
  }
})

// 监听路由变化，id变化时重新加载数据
watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.id = parseInt(newId, 10)
    await fetchDetail()
  }
})
</script>

<style scoped>
:deep(.tiny-textarea) {
  height: 436px;
}
</style>

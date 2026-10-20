<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form
        ref="formRef"
        :model="params"
        :rules="paramsRules"
        label-position="top"
        class="mt-20"
      >
        <!-- Lite 裁剪：标签不归属栏目，自由打标 -->
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="params.name" placeholder="请输入汉字"></el-input>
        </el-form-item>

        <el-form-item label="标签标识">
          <el-input v-model="params.path" placeholder="模板使用标识"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="submit" v-permission="['cms:tag:create', 'cms:tag:update']">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { create, update, detail, has } from '@/api/tag.js'
import { find } from '@/api/category.js'
import { DOMAIN, markForeignDisabled } from '@/constants/contentTypes.js'
import { addLabelValue, tree, treeById } from '@/utils/tool.js'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const formRef = ref(null)
const categorySelected = ref([])
const categoryOptions = ref([])
const categoryFlatData = ref([])
const categoryProps = { checkStrictly: true }

const params = reactive({
  id: 0,
  name: '',
  path: '',
  cid: 0
})

const paramsRules = reactive({
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 8, message: '名称长度在 2 到 8 个字符之间', trigger: 'blur' }
  ]
})

// 获取分类列表
const fetchCategory = async () => {
  try {
    // 取全量栏目树，非文章类域的节点标 disabled（不删减，保证结构完整可回显）
    const res = await find()
    if (res.code === 0) {
      categoryFlatData.value = markForeignDisabled(res.data || [], DOMAIN.tag)
      categoryOptions.value = addLabelValue(tree(categoryFlatData.value))
      // 编辑模式下回显分类
      if (isEdit.value && params.cid) {
        categorySelected.value = treeById(params.cid, categoryFlatData.value)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

// 分类选择变化
const handleCategoryChange = (e) => {
  params.cid = e && e.length > 0 ? e[e.length - 1] : 0
}

// 获取标签详情
const fetchDetail = async () => {
  if (!isEdit.value) return
  try {
    const res = await detail(params.id)
    if (res.code === 0) {
      Object.assign(params, res.data)
      // 回显分类选择
      if (params.cid && categoryFlatData.value.length > 0) {
        categorySelected.value = treeById(params.cid, categoryFlatData.value)
      }
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.error(error)
  }
}

// 新增
const createTag = async () => {
  try {
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
    console.error(error)
  }
}

// 更新
const updateTag = async () => {
  try {
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
    console.error(error)
  }
}

// 检查标签是否存在
const checkTagExistence = async () => {
  if (!params.path) {
    if (isEdit.value) {
      updateTag()
    } else {
      createTag()
    }
    return
  }
  try {
    const res = await has(params.path)
    if (res.code === 0) {
      if (res.data) {
        ElMessage({
          message: isEdit.value ? '标签已存在，修改无效' : '标签已存在，请不要再添加了',
          type: 'error'
        })
      } else {
        if (isEdit.value) {
          updateTag()
        } else {
          createTag()
        }
      }
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      })
    }
  } catch (error) {
    console.error(error)
  }
}

// 提交表单
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      checkTagExistence()
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

onMounted(async () => {
  await fetchCategory()
  if (isEdit.value) {
    params.id = parseInt(route.params.id, 10)
    await fetchDetail()
  }
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    params.id = parseInt(newId, 10)
    await fetchDetail()
  }
})
</script>

<style scoped>
/* 样式保持不变 */
</style>

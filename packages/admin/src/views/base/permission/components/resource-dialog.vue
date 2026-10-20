<template>
  <el-dialog :title="id ? '编辑权限资源' : '新增权限资源'" v-model="visible" width="560px" @open="handleOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="所属模块" prop="module">
        <el-select
          v-model="form.module"
          placeholder="选择或输入新模块（权限码前缀）"
          filterable
          allow-create
          style="width: 100%"
        >
          <el-option v-for="m in moduleOptions" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="资源标识" prop="resource_key">
        <el-input v-model="form.resource_key" placeholder="如 article（权限码中段）" :disabled="!!id" />
      </el-form-item>
      <el-form-item label="资源名称" prop="name">
        <el-input v-model="form.name" placeholder="如 文章管理（权限树里显示的名字）" />
      </el-form-item>
      <el-form-item label="勾选动作" prop="actions">
        <el-checkbox-group v-model="form.actions">
          <el-checkbox v-for="a in ACTION_LIST" :key="a.value" :value="a.value" :label="a.label" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="挂靠菜单" prop="menu_id">
        <el-tree-select
          v-model="form.menu_id"
          :data="menuTree"
          :props="{ label: 'title', value: 'id', children: 'children' }"
          check-strictly
          clearable
          placeholder="选填：角色权限树按菜单分组时挂靠到哪个菜单"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave" v-permission="['base:permission:update']">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { resourceSave, permResources, menuList } from '../api/index.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  id: { type: Number, default: 0 },
  row: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'success'])

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const ACTION_LIST = [
  { label: '查看', value: 'list' },
  { label: '新增', value: 'create' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
]

const formRef = ref(null)
const saving = ref(false)
const form = reactive({ module: 'cms', resource_key: '', name: '', actions: ['list'], menu_id: null, sort: 0 })

const rules = {
  module: [{ required: true, message: '请选择或输入模块', trigger: 'change' }],
  resource_key: [{ required: true, message: '请输入资源标识', trigger: 'blur' }],
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  actions: [{ type: 'array', required: true, message: '请至少勾选一个动作', trigger: 'change' }],
}

// 模块下拉：现有模块 + 允许输入新模块
const moduleOptions = ref([])
const getModules = async () => {
  try {
    const res = await permResources()
    if (res.code === 0) {
      moduleOptions.value = (res.data || []).map((m) => ({ value: m.module, label: `${m.module} 模块` }))
    }
  } catch (error) {
    console.log(error)
  }
}

// 挂靠菜单树
const menuTree = ref([])
const getMenus = async () => {
  try {
    const res = await menuList({ current: 1, pageSize: 1000 })
    if (res.code === 0) {
      const list = res.data.list || []
      const build = (pid) =>
        list
          .filter((m) => m.pid === pid)
          .map((m) => ({ id: m.id, title: m.title, children: build(m.id) }))
      menuTree.value = build(0)
    }
  } catch (error) {
    console.log(error)
  }
}

const handleOpen = () => {
  getModules()
  getMenus()
  if (props.id && props.row) {
    form.module = props.row.module || 'cms'
    form.resource_key = props.row.resource_key || ''
    form.name = props.row.name || ''
    form.actions = Array.isArray(props.row.actions) && props.row.actions.length ? [...props.row.actions] : ['list']
    form.menu_id = props.row.menu_id || null
    form.sort = props.row.sort || 0
  } else {
    form.module = 'cms'
    form.resource_key = ''
    form.name = ''
    form.actions = ['list']
    form.menu_id = null
    form.sort = 0
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  if (!form.actions.length) {
    ElMessage({ message: '请至少勾选一个动作', type: 'warning' })
    return
  }
  saving.value = true
  try {
    const res = await resourceSave({ id: props.id, ...form })
    if (res.code === 0) {
      ElMessage({ message: '保存成功', type: 'success' })
      visible.value = false
      emit('success')
    } else {
      ElMessage({ message: res.msg || '保存失败', type: 'error' })
    }
  } catch (error) {
    console.log(error)
  } finally {
    saving.value = false
  }
}
</script>

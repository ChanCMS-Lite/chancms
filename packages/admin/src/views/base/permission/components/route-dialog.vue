<template>
  <el-dialog :title="id ? '编辑接口归属' : '新增接口归属'" v-model="visible" width="560px" @open="handleOpen">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="请求方法" prop="method">
        <el-select v-model="form.method" style="width: 100%">
          <el-option v-for="m in ['GET', 'POST', 'PUT', 'DELETE']" :key="m" :label="m" :value="m" />
        </el-select>
      </el-form-item>
      <el-form-item label="接口路径" prop="path">
        <el-input v-model="form.path" placeholder="如 /cms/article/update" />
      </el-form-item>
      <el-form-item label="归属权限" prop="perm_code">
        <el-cascader
          v-model="cascaderValue"
          :options="permOptions"
          :props="{ expandTrigger: 'hover', value: 'code', label: 'label', children: 'children' }"
          placeholder="选择 模块 → 资源 → 动作"
          clearable
          style="width: 100%"
          @change="handleCascader"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" placeholder="选填，如：新增接口" />
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
import { routeCreate, routeUpdate, permResources } from '../api/index.js'

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

const formRef = ref(null)
const saving = ref(false)
const form = reactive({ method: 'GET', path: '', perm_code: '', remark: '' })

const rules = {
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  path: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  perm_code: [{ required: true, message: '请选择归属权限', trigger: 'change' }],
}

// 归属选择数据源：模块 → 资源 → 动作
const permOptions = ref([])
const cascaderValue = ref([])

const ACTION_LABELS = { list: '查看', create: '新增', update: '修改', delete: '删除' }

const getPermResources = async () => {
  try {
    const res = await permResources()
    if (res.code === 0) {
      permOptions.value = (res.data || []).map((mod) => ({
        code: mod.module,
        label: `${mod.module} 模块`,
        children: (mod.resources || []).map((r) => ({
          code: `${mod.module}:${r.key}`,
          label: r.name,
          children: (r.actions || []).map((a) => ({
            code: `${mod.module}:${r.key}:${a}`,
            label: `${r.name}-${ACTION_LABELS[a] || a}`,
          })),
        })),
      }))
    }
  } catch (error) {
    console.log(error)
  }
}

const handleOpen = () => {
  getPermResources()
  if (props.id && props.row) {
    form.method = props.row.method || 'GET'
    form.path = props.row.path || ''
    form.perm_code = props.row.perm_code || ''
    form.remark = props.row.remark || ''
    cascaderValue.value = form.perm_code ? form.perm_code.split(':') : []
  } else {
    form.method = 'GET'
    form.path = ''
    form.perm_code = ''
    form.remark = ''
    cascaderValue.value = []
  }
}

const handleCascader = (val) => {
  form.perm_code = Array.isArray(val) && val.length === 3 ? val.join(':') : ''
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const res = props.id ? await routeUpdate({ id: props.id, ...form }) : await routeCreate({ ...form })
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

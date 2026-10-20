<template>
  <el-dialog v-model="dialogVisible" title="编辑" destroy-on-close @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-position="top">
      <el-form-item label="节点类型" prop="type">
        <el-radio-group v-model="state.form.type">
          <el-radio label="目录" value="M">目录</el-radio>
          <el-radio label="菜单" value="C">菜单</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="上级节点" prop="pid" >
        <el-cascader
          v-model="menuSelected"
          :options="state.menus"
          :props="{ value: 'id', label: 'label', children: 'children', checkStrictly: true }"
          placeholder="请选择上级节点"
          clearable
          filterable
          :show-all-levels="false"
          class="w-full"
          @change="handleMenuChange"
        />
      </el-form-item>

      <el-form-item label="节点名称" prop="title" >
        <el-input
          v-model="state.form.title"
          placeholder="请输入节点名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="显示排序" prop="order_num">
        <el-input
          v-model="state.form.order_num"
          type="number"
          placeholder="请输入菜单排序"
        ></el-input>
      </el-form-item>

      <el-form-item label="路由名称" prop="name">
        <el-input
          v-model="state.form.name"
          placeholder="请输入菜单名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="路由地址">
        <el-input
          v-model="state.form.path"
          placeholder="请输入路由地址"
        ></el-input>
      </el-form-item>

      <el-form-item label="是否缓存" v-if="state.form.type == 'C'">
        <el-radio-group v-model="state.form.is_cache">
          <el-radio label="缓存" value="1">缓存</el-radio>
          <el-radio label="不缓存" value="2">不缓存</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="显示状态" v-if="state.form.type == 'C'">
        <el-radio-group v-model="state.form.is_show">
          <el-radio value="1">显示</el-radio>
          <el-radio value="2">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)" v-permission="['base:menu:create', 'base:menu:update']">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { tree, addLabelValue } from '@/utils/tool.js'
import { list, detail, create, update } from '../api/index.js'
import { ref, reactive, defineProps, defineEmits, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const formRef = ref(null)
const menuSelected = ref([])

const state = reactive({
  menus: [],
  form: {
    id: 0,
    pid: '',
    title: '',
    name: '',
    order_num: '0',
    path: '',
    is_frame: '2',
    type: 'M',
    is_show: '1',
    is_cache: '2',
  },
})

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      getList()
      const newIdNumber = Number(props.id) || 0
      state.form.id = newIdNumber
      if (newIdNumber > 0) {
        getDetail(newIdNumber)
      }
    }
  },
)

watch(
  () => state.form.pid,
  pid => {
    menuSelected.value = pid !== undefined && pid !== '' && pid !== null ? [Number(pid)] : []
  },
)

const handleMenuChange = val => {
  state.form.pid = val?.length ? String(val[val.length - 1]) : ''
}


const getDetail = async () => {
  try {
    let id = state.form.id
    let res = await detail({ id: id })
    if (res.code == 0 && res.data) {
      state.form = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const handleClick = formRef => {
  if (formRef) {
    formRef.validate(valid => {
      if (valid) {
        state.form.id ? updateMenu() : createMenu()
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}

const createMenu = async () => {
  try {
    let { id, ...params } = state.form
    let _params = params
    if (id > 0) {
      _params.id = id
    }
    const res = await create(_params)
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '创建成功 ^_^',
        type: 'success',
      })
      handleClose()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

const updateMenu = async () => {
  try {
    let params = state.form
    const res = await update(params)
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '更新成功 ^_^',
        type: 'success',
      })
      handleClose()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  state.form = {
    id: 0,
    pid: '',
    title: '',
    name: '',
    order_num: '0',
    path: '',
    is_frame: '2',
    type: 'M',
    is_show: '1',
    is_cache: '2',
  }
  state.menus = []
}

// onMounted(() => {
//   getList()
// })

const getList = async () => {
  try {
    const res = await list()
    if (res.code === 0) {
      const menu = { id: 0, label: '主类目', children: [] }
      const data = tree(res.data.list)
      const dealData = addLabelValue(data, 'title', 'id')
      menu.children = dealData
      state.menus = [menu]
    }
  } catch (error) {
    console.log(error)
  }
}
getList()
</script>

<style scoped>
</style>

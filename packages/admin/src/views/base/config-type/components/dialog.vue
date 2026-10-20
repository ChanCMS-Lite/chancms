<template>
  <el-dialog v-model="dialogVisible" title="配置" destroy-on-close @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-position="top">
      <el-form-item label="类型名称" prop="type_name">
        <el-input v-model="state.form.type_name" placeholder="请输入用户名"></el-input>
      </el-form-item>

      <el-form-item label="类型标识" prop="type_code">
        <el-input v-model="state.form.type_code" placeholder="例：qiniu.oss"></el-input>
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="state.form.status">
          <el-radio value="1">正常</el-radio>
          <el-radio value="2">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="state.form.remark" placeholder="例：qiniu.oss"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)" v-permission="['base:configType:create', 'base:configType:update']">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>

import { detail, create, update } from '../api/index.js'
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  computed,
  watch,
} from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: 0,
  },
  type_code: {
    type: String,
    default: '',
  }
})

const formRef = ref(null);

const emit = defineEmits(['update:visible']);
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
});


//数据
const state = reactive({
  form: {
    type_name: '',
    type_code: '',
    status: '1',
    remark: ''
  },
});


const resetForm = () => {
  state.form = {
    type_name: '',
    type_code: '',
    remark: ''
  }
}

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      //菜单列表
      if (props.id > 0) {
        try {
          // 这里替换实际的API调用
          const id = Number(props.id)
          state.form.id = id
          await getDetail(id)
        } catch (error) {
          // eslint-disable-next-line no-undef
          ElMessage.error(error)
        }
      }
    } else {
      resetForm()
    }
  },
)

//创建菜单
const createUserType = async () => {
  try {
    let data = state.form;
    const res = await create(data)
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

//更新菜单
const updateUserType = async () => {
  try {
    let params = state.form;
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


//角色详情
const getDetail = async (id) => {
  try {
    let res = await detail({ id: id })
    if (res.code == 0) {
      let { id, status, remark, type_code, type_name } = res.data
      state.form = { id, status, remark, type_code, type_name };
    }
  } catch (error) {
    console.error(error)
  }
}

const handleClick = formRef => {
  if (formRef) {
    formRef.validate(valid => {
      if (valid) {
        if (state.form.id > 0) {
          updateUserType()
        } else {
          createUserType()
        }
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}


</script>

<style scoped>
.icon-list {
  max-height: 60vh;
  overflow-y: auto;
}

.icon-item {
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 2em;
  height: 2em;
}

.icon-name {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}

.icon-suffix {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

/* 新增样式 */
.icon-suffix-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}

.clear-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #666;
}

.selected-icon {
  width: 1em;
  height: 1em;
}
</style>

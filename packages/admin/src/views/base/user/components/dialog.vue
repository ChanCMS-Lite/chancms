<template>
  <el-dialog v-model="dialogVisible" title="新增管理员" destroy-on-close @close="handleClose">
    <el-form :model="state.form" ref="formRef" :rules="rules" label-position="top">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="state.form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="state.form.password" type="password" show-password
          placeholder="请输入密码（6-20 位）"></el-input>
      </el-form-item>

      <el-form-item label="角色" prop="role_ids">
        <el-select v-model="state.form.role_ids" multiple placeholder="请选择角色" style="width: 100%">
          <el-option v-for="item in state.roleList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="state.form.status">
          <el-radio value="1">正常</el-radio>
          <el-radio value="2">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)"
          v-permission="['base:user:create']">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * 管理员「新增」弹窗
 *
 * 🔴 2026-09-17：本组件**只服务新增**，不再承担「编辑」。
 *    原因：同一个「编辑用户信息」曾有三套界面 ——
 *      ① 超管从本弹窗改（用户名/单框密码/角色/状态）
 *      ② 非超管从本弹窗改（仅单框密码）
 *      ③ 个人中心整页改（新密码 + 确认密码 双框）
 *    现全部收敛到「用户详情」页 /user/detail/:id：
 *      看自己 → 只改密码（双框，任何角色界面一致）；超管看别人 → 编辑资料。
 *    故组件内的编辑分支（原 props.id > 0 走 detail/update）已整体移除。
 */
import { ref, reactive, computed, watch } from 'vue'
import { rolelist, create } from '../api/index.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const formRef = ref(null)
const emit = defineEmits(['update:visible'])
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const state = reactive({
  roleList: [],
  form: {
    username: '',
    password: '',
    status: '1',
    role_ids: [],
  },
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名 2-30 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码 6-20 位', trigger: 'blur' },
  ],
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) getList()
    else resetForm()
  },
)

// 角色下拉
const getList = async () => {
  try {
    const res = await rolelist()
    if (res.code === 0) {
      state.roleList = res.data.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

const createUser = async () => {
  try {
    const res = await create(state.form)
    if (res.code === 0) {
      // eslint-disable-next-line no-undef
      ElMessage({ message: '创建成功 ^_^', type: 'success' })
      handleClose()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({ message: res.msg, type: 'error' })
    }
  } catch (error) {
    console.log(error)
  }
}

const handleClick = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) createUser()
  })
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  formRef.value?.resetFields()
  state.form = {
    username: '',
    password: '',
    status: '1',
    role_ids: [],
  }
}
</script>

<style scoped></style>

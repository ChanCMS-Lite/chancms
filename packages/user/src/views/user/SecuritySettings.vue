<template>
  <div class="security-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">安全设置</h2>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="security-content">
      <el-form
        ref="securityForm"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="security-form"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="formData.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
            class="form-input"
          />
        </el-form-item>

        <el-form-item label="邮箱验证码" prop="code" v-if="showCodeField">
          <div class="code-input-group">
            <el-input
              v-model="formData.code"
              placeholder="请输入6位验证码"
              maxlength="6"
              @input="formData.code = formData.code.replace(/[^\d]/g, '')"
              class="form-input"
            />
            <el-button
              type="primary"
              :disabled="cooldown > 0"
              @click="sendVerificationCode"
              class="code-btn"
            >
              {{ cooldown > 0 ? `${cooldown}秒后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            class="form-input"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            class="form-input"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
          >
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { userInfo, updatePass, sendCode } from "./api/index.js";

const securityForm = ref(null)
const cooldown = ref(0)
const submitting = ref(false)
const showCodeField = ref(true)
const userEmail = ref('')
let cooldownTimer = null

const formData = reactive({
  currentPassword: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 拉取用户信息以获取邮箱（发送验证码时由后端基于登录态邮箱下发）
onMounted(async () => {
  try {
    const res = await userInfo()
    if (res?.code === 0) {
      userEmail.value = res.data?.email || ''
    }
  } catch {
    // 静默失败，不影响页面渲染
  }
})

const rules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function validateConfirmPassword(rule, value, callback) {
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

async function sendVerificationCode() {
  if (cooldown.value > 0) return
  if (!userEmail.value) {
    ElMessage.warning('未获取到邮箱信息，请稍后重试')
    return
  }
  try {
    const res = await sendCode({
      email: userEmail.value,
      type: 'reset',
    })
    if (res?.code === 0) {
      ElMessage.success('验证码已发送至您的邮箱，请查收')
      startCooldown()
    }
    // 失败时 interceptor 已弹出具体错误提示
  } catch (e) {
    console.error('验证码发送异常:', e)
  }
}

function startCooldown() {
  cooldown.value = 60
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

function submitForm() {
  securityForm.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      let params = {
        password: formData.currentPassword,
        newPassword: formData.newPassword,
        email: userEmail.value,
        code: formData.code
      }
      let res = await updatePass(params);
      if (res.code === 0) {
        // 后端已吊销旧 token 并签发新 token 续期登录（updatePass 内 issueMemberSession），
        // 前端无需再登出，否则会把刚续期的 token 反手拉黑——保持登录态即可
        ElMessage.success(res.msg || '密码修改成功')
      }
      // 失败时 interceptor 已弹出具体错误提示
      securityForm.value.resetFields()
    } catch (error) {
      console.error('密码修改异常:', error)
    } finally {
      submitting.value = false
    }
  })
}

onBeforeUnmount(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
.security-container {

  min-height: 100%;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* 内容区 */
.security-content {
  background: #fff;
  border-radius: 8px;
  padding: 32px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.security-form {
  max-width: 500px;
}

.form-input {
  max-width: 300px;
}

.code-input-group {
  display: flex;
  gap: 12px;
}

.code-btn {
  flex-shrink: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 响应式 */
@media (max-width: 768px) {
  .security-container {
    padding: 12px;
  }

  .security-content {
    padding: 20px 16px;
  }

  .security-form {
    max-width: 100%;
  }

  .form-input {
    max-width: 100%;
  }

  .code-input-group {
    flex-direction: column;
  }

  .code-btn {
    width: 100%;
  }
}
</style>

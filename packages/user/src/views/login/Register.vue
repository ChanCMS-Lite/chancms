<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-wrapper">
          <img src="@/assets/logo.svg" alt="CMS Logo" class="logo-img">
        </div>
        <h1 class="register-title">加入我们</h1>
        <p class="register-subtitle">创建账号，开启全新体验</p>
      </div>

      <el-form
        ref="registerForm"
        :model="formData"
        :rules="rules"
        class="register-form"
        @submit.prevent="handleSubmit"
        validate-on-rule-change
      >
        <div class="form-grid">
          <el-form-item prop="username" class="form-item">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              type="text"
              prefix-icon="User"
              autocomplete="username"
              maxlength="20"
              size="large"
              @blur="() => formData.username = formData.username.trim()"
            />
          </el-form-item>
        </div>

        <el-form-item 
          prop="password"
          :error="passwordErrorMsg"
          class="password-item"
        >
          <el-input
            v-model="formData.password"
            placeholder="请输入密码"
            type="password"
            prefix-icon="Lock"
            show-password
            size="large"
            @input="handlePasswordInput"
            autocomplete="new-password"
            maxlength="20"
          >
            <template #suffix v-if="isPasswordValid && formData.password">
              <el-icon style="color: #22c55e;">
                <Check />
              </el-icon>
            </template>
          </el-input>

          <div v-if="formData.password.length > 0" class="password-strength">
            <div class="strength-info">
              <span class="strength-text" :class="isPasswordValid ? 'text-green' : 'text-gray'">
                {{ isPasswordValid ? '密码符合要求' : `密码强度：${strengthText}` }}
              </span>
            </div>
            
            <div class="strength-bar-container">
              <div class="strength-bar">
                <div
                  class="strength-progress"
                  :style="{ width: isPasswordValid ? '100%' : `${(passwordStrength / 5) * 100}%` }"
                  :class="isPasswordValid ? 'bg-green' : strengthBgClass"
                ></div>
              </div>
            </div>
            
            <div v-if="!isPasswordValid" class="password-requirements">
              <div class="requirement-item" :class="{ 'valid': formData.password.length >= 6 && formData.password.length <= 20 }">
                <el-icon v-if="formData.password.length >= 6 && formData.password.length <= 20" style="color: #22c55e;"><Check /></el-icon>
                <el-icon v-else style="color: #9ca3af;"><CircleCheck /></el-icon>
                <span>长度 6-20 位</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item 
          prop="confirmPassword"
          :error="confirmPasswordErrorMsg"
          class="password-item"
        >
          <el-input
            v-model="formData.confirmPassword"
            placeholder="请确认密码"
            type="password"
            prefix-icon="Lock"
            show-password
            size="large"
            autocomplete="new-password"
            maxlength="20"
            @input="checkConfirmPassword"
          >
            <template #suffix v-if="isConfirmPasswordValid && formData.confirmPassword">
              <el-icon style="color: #22c55e;">
                <Check />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email" class="form-item">
          <div class="code-input-wrapper">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              type="email"
              prefix-icon="Message"
              :disabled="countdown > 0"
              autocomplete="email"
              size="large"
              class="code-email-input"
              @blur="() => formData.email = formData.email.trim()"
            />
            <el-button
              type="primary"
              :disabled="countdown > 0 || !formData.email"
              @click="sendVerificationCode"
              size="large"
              class="code-button"
              :loading="sendingCode"
            >
              {{ countdown ? `${countdown}s后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 邮箱验证码 -->
        <el-form-item prop="code" class="form-item">
          <el-input
            v-model="formData.code"
            placeholder="请输入验证码"
            type="text"
            prefix-icon="Tickets"
            autocomplete="one-time-code"
            maxlength="6"
            size="large"
            @input="formData.code = formData.code.replace(/[^0-9]/g, '')"
          />
        </el-form-item>

        <el-form-item prop="agreement" class="agreement-item">
          <el-checkbox v-model="formData.agreement" size="large">
            我已阅读并同意
            <el-link type="primary" @click="showAgreement" class="agreement-link">《服务协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy" class="agreement-link">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item class="submit-item">
          <el-button
            type="primary"
            native-type="submit"
            class="submit-button"
            :loading="loading"
            :disabled="loading"
            size="large"
          >
            <span v-if="!loading">注册</span>
            <span v-else>注册中...</span>
          </el-button>
        </el-form-item>

        <div class="login-link">
          已有账号？
          <router-link to="/login" class="link-text">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, CircleCheck } from '@element-plus/icons-vue'
import { sendEmail, toReg } from './api/index.js'

const router = useRouter()
const registerForm = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const passwordStrength = ref(0)
let countdownTimer = null

const passwordErrorMsg = ref('')
const confirmPasswordErrorMsg = ref('')
const isPasswordValid = ref(false)
const isConfirmPasswordValid = ref(false)

const formData = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  agreement: false
})

// 两处独立实现，避免与 Repass.vue 耦合（用户明确反对抽 composable）
const PASSWORD_STRENGTH = {
  TEXT: ['未输入', '非常弱', '弱', '中等', '强', '非常强'],
  BG_CLASS: ['bg-transparent', 'bg-red', 'bg-orange', 'bg-yellow', 'bg-blue', 'bg-green']
}

const handlePasswordInput = () => {
  passwordStrength.value = getPasswordStrength(formData.password)
  
  isPasswordValid.value = formData.password.length >= 6 && formData.password.length <= 20

  if (!formData.password) {
    passwordErrorMsg.value = '请输入密码'
  } else if (formData.password.length < 6 || formData.password.length > 20) {
    passwordErrorMsg.value = '密码长度需在6-20个字符之间'
  } else {
    passwordErrorMsg.value = ''
  }

  checkConfirmPassword()
}

const checkConfirmPassword = () => {
  if (!formData.confirmPassword) {
    confirmPasswordErrorMsg.value = '请确认密码'
    isConfirmPasswordValid.value = false
  } else if (!isPasswordValid.value) {
    confirmPasswordErrorMsg.value = ''
    isConfirmPasswordValid.value = false
  } else {
    const isMatch = formData.confirmPassword === formData.password
    confirmPasswordErrorMsg.value = isMatch ? '' : '两次输入的密码不一致'
    isConfirmPasswordValid.value = isMatch
  }
}

const getPasswordStrength = (password) => {
  if (!password) return 0
  let strength = 0
  
  if (password.length >= 6) strength += 1
  if (password.length >= 12) strength += 1
  
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  
  if (/[^a-zA-Z0-9]/.test(password)) strength = Math.min(strength + 1, 5)
  
  return Math.min(strength, 5)
}

const strengthText = computed(() => PASSWORD_STRENGTH.TEXT[passwordStrength.value])
const strengthBgClass = computed(() => PASSWORD_STRENGTH.BG_CLASS[passwordStrength.value])

const rules = computed(() => ({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: ['blur', 'change'] },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
    { min: 3, max: 20, message: '用户名长度需在3-20个字符之间', trigger: ['blur', 'change'] },
    {
      validator: (_, value, callback) => {
        const reg = /^[a-zA-Z0-9_]{3,20}$/
        reg.test(value) ? callback() : callback(new Error('用户名仅允许字母、数字和下划线'))
      },
      trigger: ['blur', 'change']
    }
  ],
  password: [
    { required: true, message: () => passwordErrorMsg.value, trigger: ['blur', 'change'] }
  ],
  confirmPassword: [
    { required: true, message: () => confirmPasswordErrorMsg.value, trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: ['blur', 'change'] },
    { min: 4, max: 6, message: '验证码长度需在4-6位之间', trigger: ['blur', 'change'] },
    { pattern: /^\d+$/, message: '验证码仅允许数字', trigger: ['blur', 'change'] }
  ],
  agreement: [
    {
      validator: (_, value, callback) => {
        value ? callback() : callback(new Error('请阅读并同意服务条款和隐私政策'))
      },
      trigger: 'change'
    }
  ]
}))

const sendVerificationCode = async () => {
  if (countdown.value > 0) return
  if (!formData.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  const emailReg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailReg.test(formData.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  try {
    sendingCode.value = true
    const params = {
      email: formData.email.trim(),
      type: 'register',
    }
    const res = await sendEmail(params)
    if (res?.code === 0) {
      ElMessage.success('验证码已发送至您的邮箱，请查收')
      // 发送成功后才启动倒计时
      countdown.value = 60
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    }
    // 失败时 interceptor 已弹出具体错误提示，此处无需重复
  } catch (error) {
    // interceptor 已弹出错误提示
    console.error('验证码发送异常:', error)
  } finally {
    sendingCode.value = false
  }
}

// 安全说明：以下 HTML 内容均为前端硬编码字面量，不拼接任何外部输入，可安全使用 dangerouslyUseHTMLString
const showAgreement = () => {
  ElMessageBox.alert(
    `<h3 style="font-weight: 500; margin-bottom: 0.5rem;">服务协议</h3>
    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">1. 您需保证注册信息真实有效，如有变更请及时更新</p>
    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">2. 不得使用本平台从事违法违规活动</p>
    <p style="font-size: 0.875rem;">3. 平台有权在法律法规范围内调整服务条款</p>`,
    '服务协议',
    { 
      confirmButtonText: '我已阅读并同意', 
      type: 'info', 
      dangerouslyUseHTMLString: true, 
      center: true, 
      width: '380px' 
    }
  ).then(() => {
    formData.agreement = true
  })
}

const showPrivacy = () => {
  ElMessageBox.alert(
    `<h3 style="font-weight: 500; margin-bottom: 0.5rem;">隐私政策</h3>
    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">1. 仅收集邮箱用于账号验证，不泄露给第三方</p>
    <p style="font-size: 0.875rem; margin-bottom: 0.25rem;">2. 密码通过加密处理存储，保障账号安全</p>
    <p style="font-size: 0.875rem;">3. 您可随时查阅、修改个人信息</p>`,
    '隐私政策',
    { 
      confirmButtonText: '我已阅读并同意', 
      type: 'info', 
      dangerouslyUseHTMLString: true, 
      center: true, 
      width: '380px' 
    }
  ).then(() => {
    formData.agreement = true
  })
}

const handleRegister = async () => {
  try {
    const params = {
      email: formData.email.trim(),
      username: formData.username.trim(),
      password: formData.password,
      code: formData.code.trim()
    }
    const res = await toReg(params)
    if (res?.code === 0) {
      // 后端注册成功已自动登录（cookie 已下发），直接跳转首页
      ElMessage.success('注册成功，正在进入...')
      setTimeout(() => {
        router.push('/index')
      }, 1000)
    }
    // 失败时 interceptor 已弹出具体错误提示
  } catch (error) {
    console.error('注册接口异常:', error)
  }
}

const handleSubmit = async () => {
  if (loading.value) return

  try {
    await registerForm.value.validate()
    loading.value = true
    await handleRegister()
  } catch (error) {
    if (error.name === 'ValidationError') {
      ElMessage.warning('请完善并修正表单信息后提交')
    } else {
      ElMessage.error(error.message || '注册失败，请稍后重试')
    }
    console.error('表单提交异常:', error)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #eef2ff 100%);
  padding: 3rem 1rem;
}

@media (min-width: 640px) {
  .register-container {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .register-container {
    padding: 3rem 2rem;
  }
}

.register-card {
  width: 100%;
  max-width: 32rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 2rem;
  animation: slideUp 0.6s ease-out;
}

@media (min-width: 640px) {
  .register-card {
    padding: 3rem;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  width: 6rem;
  height: 6rem;
  margin-bottom: 1.5rem;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.register-title {
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.register-subtitle {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-item {
  margin-bottom: 0;
}

.password-item {
  margin-bottom: 0;
}

.password-strength {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.strength-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.text-green {
  color: #16a34a;
}

.text-gray {
  color: #6b7280;
}

.strength-bar-container {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease-in-out;
}

.strength-progress {
  height: 100%;
  transition: all 0.3s ease-in-out;
}

.bg-green {
  background: #22c55e;
}

.bg-red {
  background: #ef4444;
}

.bg-orange {
  background: #f97316;
}

.bg-yellow {
  background: #eab308;
}

.bg-blue {
  background: #3b82f6;
}

.password-requirements {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.requirement-item.valid {
  color: #16a34a;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.code-email-input {
  flex: 1;
}

.code-button {
  white-space: nowrap;
}

.agreement-item {
  margin-bottom: 0;
}

.agreement-link {
  color: #409eff;
  transition: color 0.2s;
}

.agreement-link:hover {
  color: #66b1ff;
}

.submit-item {
  margin-bottom: 0;
}

.submit-button {
  width: 100%;
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
}

.submit-button:not(:disabled) {
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  transition: all 0.2s;
}

.submit-button:not(:disabled):hover {
  transform: scale(1.02);
}

.submit-button:not(:disabled):active {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1rem;
  color: #6b7280;
}

.link-text {
  color: #2563eb;
  font-weight: 500;
  transition: color 0.2s;
}

.link-text:hover {
  color: #1d4ed8;
}
</style>

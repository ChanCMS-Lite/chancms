<template>
  <div class="repass-container">
    <div class="repass-card">
      <div class="repass-header">
        <div class="logo-wrapper">
          <img src="@/assets/logo.svg" alt="CMS Logo" class="logo-img">
        </div>
        <h1 class="repass-title">找回密码</h1>
        <p class="repass-subtitle">重置您的账号密码</p>
      </div>

      <div class="step-indicator">
        <div 
          v-for="(stepItem, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': step === index + 1, 
            'completed': step > index + 1 
          }"
        >
          <div class="step-circle">
            <svg v-if="step > index + 1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ stepItem }}</span>
        </div>
        <div class="step-line">
          <div 
            class="step-line-progress"
            :style="{ width: step > 1 ? '50%' : '0%' }"
          ></div>
        </div>
      </div>

      <el-form
        ref="forgotForm"
        :model="formData"
        :rules="stepRules"
        class="repass-form"
        @submit.prevent="handleSubmit"
      >
        <div v-if="step === 1" key="step1" class="form-content">
          <el-form-item prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入您注册的邮箱"
              type="email"
              prefix-icon="Message"
              autocomplete="email"
              size="large"
              @blur="() => formData.email = formData.email.trim()"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              class="submit-button"
              :loading="loading"
              size="large"
            >
              发送验证码
            </el-button>
          </el-form-item>
        </div>

        <div v-else-if="step === 2" key="step2" class="form-content">
          <div class="email-hint">
            <el-icon style="color: #3b82f6;"><Message /></el-icon>
            <span>验证码已发送至：{{ formData.email }}</span>
          </div>

          <el-form-item prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入验证码"
              type="text"
              prefix-icon="Key"
              autocomplete="one-time-code"
              maxlength="6"
              size="large"
              class="code-input"
              @input="formData.code = formData.code.replace(/[^0-9]/g, '')"
            >
              <template #suffix>
                <el-button
                  type="text"
                  @click="resendCode"
                  :disabled="countingDown || loading"
                  class="resend-button"
                >
                  {{ countingDown ? `${countDownSeconds}s` : '重新发送' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <div class="button-group">
            <el-button @click="step = 1" class="back-button" size="large">
              返回上一步
            </el-button>
            <el-button
              type="primary"
              native-type="submit"
              class="submit-button"
              :loading="loading"
              size="large"
            >
              验证验证码
            </el-button>
          </div>
        </div>

        <div v-else key="step3" class="form-content">
          <div class="success-hint">
            <el-icon style="color: #22c55e;"><CircleCheck /></el-icon>
            <span>验证码验证成功，请设置新密码</span>
          </div>

          <el-form-item prop="password" class="password-form-item">
            <el-input
              v-model="formData.password"
              placeholder="请输入新密码"
              type="password"
              prefix-icon="Lock"
              show-password
              size="large"
              autocomplete="new-password"
              @input="handlePasswordInput"
            >
              <template #suffix v-if="isPasswordValid && formData.password">
                <el-icon style="color: #22c55e;"><Check /></el-icon>
              </template>
            </el-input>

            <div v-if="formData.password.length > 0" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-progress"
                  :style="{ width: isPasswordValid ? '100%' : `${(passwordStrength / 5) * 100}%` }"
                  :class="isPasswordValid ? 'bg-green' : strengthBgClass"
                ></div>
              </div>
              <div class="strength-text">
                {{ isPasswordValid ? '密码符合要求' : `密码强度：${strengthText}` }}
              </div>
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              placeholder="请确认新密码"
              type="password"
              prefix-icon="Lock"
              show-password
              size="large"
              autocomplete="new-password"
              @input="checkConfirmPassword"
            >
              <template #suffix v-if="isConfirmPasswordValid && formData.confirmPassword">
                <el-icon style="color: #22c55e;"><Check /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="button-group">
            <el-button @click="step = 2" class="back-button" size="large">
              返回上一步
            </el-button>
            <el-button
              type="primary"
              native-type="submit"
              class="submit-button"
              :loading="loading"
              :disabled="!isPasswordValid || !isConfirmPasswordValid"
              size="large"
            >
              重置密码
            </el-button>
          </div>
        </div>
      </el-form>

      <div class="login-link">
        想起密码了？
        <router-link to="/login" class="link-text">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, CircleCheck, Check } from '@element-plus/icons-vue'

import { sendEmail, checkEmail, resetPass } from './api/index.js'

const router = useRouter()

const steps = ['验证邮箱', '输入验证码', '设置密码']
const step = ref(1)
const loading = ref(false)
const countingDown = ref(false)
const countDownSeconds = ref(60)
const passwordStrength = ref(0)
const isPasswordValid = ref(false)
const isConfirmPasswordValid = ref(false)
let countDownTimer = null

const formData = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 两处独立实现，避免与 Register.vue 耦合（用户明确反对抽 composable）
const PASSWORD_STRENGTH = {
  TEXT: ['未输入', '非常弱', '弱', '中等', '强', '非常强'],
  BG_CLASS: ['bg-transparent', 'bg-red', 'bg-orange', 'bg-yellow', 'bg-blue', 'bg-green']
}

const strengthText = computed(() => PASSWORD_STRENGTH.TEXT[passwordStrength.value])
const strengthBgClass = computed(() => PASSWORD_STRENGTH.BG_CLASS[passwordStrength.value])

const stepRules = computed(() => {
  if (step.value === 1) {
    return {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ]
    }
  } else if (step.value === 2) {
    return {
      code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 6, message: '验证码长度需在4-6位之间', trigger: 'blur' }
      ]
    }
  } else {
    return {
      password: [
        { required: true, message: '请输入新密码', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== formData.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
  }
})

const handlePasswordInput = () => {
  passwordStrength.value = getPasswordStrength(formData.password)
  
  isPasswordValid.value = formData.password.length >= 6 && formData.password.length <= 20

  checkConfirmPassword()
}

const checkConfirmPassword = () => {
  if (!formData.confirmPassword) {
    isConfirmPasswordValid.value = false
  } else if (!isPasswordValid.value) {
    isConfirmPasswordValid.value = false
  } else {
    isConfirmPasswordValid.value = formData.confirmPassword === formData.password
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

const startCountDown = () => {
  countingDown.value = true
  countDownSeconds.value = 60

  if (countDownTimer) {
    clearInterval(countDownTimer)
  }

  countDownTimer = setInterval(() => {
    countDownSeconds.value--
    if (countDownSeconds.value <= 0) {
      clearInterval(countDownTimer)
      countingDown.value = false
      countDownTimer = null
    }
  }, 1000)
}

const sendCode = async () => {
  if (!formData.email) {
    ElMessage.warning('请先输入邮箱')
    return false
  }

  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(formData.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return false
  }

  try {
    const params = {
      email: formData.email.trim(),
      type: 'reset',
    }
    const res = await sendEmail(params)
    if (res?.code === 0) {
      ElMessage.success('验证码已发送至您的邮箱，请查收')
      startCountDown()
      return true
    }
    // 失败时 interceptor 已弹出具体错误提示
    return false
  } catch (error) {
    console.error('发送验证码失败:', error)
    return false
  }
}

const resendCode = async () => {
  if (countingDown.value) return
  loading.value = true
  await sendCode()
  loading.value = false
}

const checkCode = async () => {
  try {
    const res = await checkEmail({ email: formData.email.trim(), code: formData.code })
    if (res.code === 0) {
      ElMessage.success('验证码验证成功')
      return true
    }
    // 失败时 interceptor 已弹出具体错误提示
    return false
  } catch (error) {
    console.error('验证码验证失败:', error)
    return false
  }
}

const resetPassword = async () => {
  try {
    const params = {
      email: formData.email,
      password: formData.password,
      code: formData.code,
    }
    const res = await resetPass(params)
    if (res.code === 0) {
      ElMessage.success('密码重置成功，请使用新密码登录')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return true
    }
    // 失败时 interceptor 已弹出具体错误提示
    return false
  } catch (error) {
    console.error('密码重置失败:', error)
    return false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    if (step.value === 1) {
      const success = await sendCode()
      if (success) {
        step.value = 2
      }
    } else if (step.value === 2) {
      const success = await checkCode()
      if (success) {
        step.value = 3
      }
    } else {
      await resetPassword()
    }
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (countDownTimer) {
    clearInterval(countDownTimer)
  }
})
</script>

<style scoped>
.repass-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #eef2ff 100%);
  padding: 3rem 1rem;
}

@media (min-width: 640px) {
  .repass-container {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .repass-container {
    padding: 3rem 2rem;
  }
}

.repass-card {
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
  .repass-card {
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

.repass-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo-wrapper {
  width: 5rem;
  height: 5rem;
  margin-bottom: 1.25rem;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.repass-title {
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.repass-subtitle {
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  position: relative;
}

.step-line {
  position: absolute;
  top: 1.25rem;
  left: 15%;
  right: 15%;
  height: 0.125rem;
  background: #e5e7eb;
}

.step-line-progress {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  transition: all 0.5s;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  background: #e5e7eb;
  color: #6b7280;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.step-item.completed .step-circle {
  background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
  color: white;
}

.step-circle svg {
  width: 1.25rem;
  height: 1.25rem;
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  transition: color 0.3s;
}

.step-item.active .step-label {
  color: #2563eb;
  font-weight: 500;
}

.step-item.completed .step-label {
  color: #16a34a;
}

.repass-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.email-hint,
.success-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.success-hint {
  background: #f0fdf4;
  color: #15803d;
}

.code-input :deep(.el-input__suffix) {
  padding-right: 0.5rem;
}

.resend-button {
  color: #2563eb;
  font-weight: 500;
  font-size: 0.875rem;
}

.resend-button:hover {
  color: #1d4ed8;
}

.password-form-item {
  margin-bottom: 0;
}

.password-strength {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strength-bar {
  height: 0.375rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.strength-progress {
  height: 100%;
  transition: all 0.3s ease-out;
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

.strength-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.back-button {
  flex: 1;
}

.submit-button {
  flex: 1;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
}

.submit-button:not(:disabled) {
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
  margin-top: 2rem;
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

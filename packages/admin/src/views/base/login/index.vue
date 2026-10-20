<template>
  <div class="login-page">
    <!-- 背景装饰 - 简洁几何图形 -->
    <div class="bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <!-- 浮动小圆点 - 北斗七星 -->
    <div class="floating-dots">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
      <div class="dot dot-4"></div>
      <div class="dot dot-5"></div>
      <div class="dot dot-6"></div>
      <div class="dot dot-7"></div>
    </div>

    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <IconLogo class="logo"></IconLogo>
          <h1 class="title">ChanCMS</h1>
          <p class="subtitle">轻量 · 灵活 · 易用 · 安全</p>
        </div>

        <el-form class="login-form" :model="form" ref="formRef" @keyup.enter="login">
          <el-form-item prop="username" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
            <el-input
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              size="large"
            ></el-input>
          </el-form-item>
          <el-form-item prop="captcha" :rules="[
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { len: 4, message: '验证码为 4 位字符', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9]+$/, message: '验证码只能包含字母和数字', trigger: 'blur' }
          ]">
            <div class="captcha-row">
              <el-input
                v-model="form.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                size="large"
                maxlength="4"
              ></el-input>
              <div class="captcha-img" v-html="captchaSvg" @click="refreshCaptcha" title="点击刷新验证码"></div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              class="login-btn"
              type="primary"
              size="large"
              @click="login"
              :loading="loading"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>Copyright &copy; 2016-{{ appInfo.year }} {{ appInfo.APP_NAME }} v{{ appInfo.APP_VERSION }} · 位于南京 服务全国</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginIndex'
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { userStore } from '@/stores/user'
import IconLogo from '@/components/icons/IconLogo.vue'
import Login from '@/api/Login'
import { appInfo as getAppInfo } from '@/api/site.js';
import Cookies from 'js-cookie'
const router = useRouter()
const route = useRoute()
const user = userStore()
const form = reactive({ username: '', password: '', captcha: '' })
const captchaSvg = ref('')
const sessionId = ref('')
const loading = ref(false)
let appInfo = reactive({
  APP_NAME: 'ChanCMS',
  APP_VERSION: '',
  APP_VERSION_TIME: '',
  year: '',
})

let loginIp = ''
let loginRegion = null

const formRef = ref(null)

// 获取图形验证码
const refreshCaptcha = async () => {
  try {
    const res = await Login.getCaptcha()
    if (res.code === 0 && res.data) {
      sessionId.value = res.data.sessionId
      captchaSvg.value = res.data.data
    }
  } catch (e) {
    console.error('[captcha] 获取失败', e)
  }
}

const login = async () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      // 登录前置：先单独校验图形验证码，错误则提示并刷新，绝不调用登录接口
      try {
        await Login.checkCaptcha({ sessionId: sessionId.value, captcha: form.captcha })
      } catch {
        // 拦截器已弹「验证码错误」提示；此处仅刷新验证码、清空输入并返回，避免双重 toast
        await refreshCaptcha()
        form.captcha = ''
        loading.value = false
        return
      }

      const { username, password, captcha } = form
      const res = await Login.toLogin({ username, password, sessionId: sessionId.value, captcha })
      if (res.code == 0) {
        // 安全策略（P0-S06）：token 由后端 HttpOnly cookie 下发，前端不再读取/存储
        // 仅记录 IP/归属地用于审计展示，登录态通过 isAuthenticated 标志位管理
        const { ip, region } = res.data
        user.setAuthenticated(true)
        loginIp = ip || ''
        loginRegion = region || null
        // 登录成功后先拉取用户信息 + 菜单权限，再跳转
        // 菜单必须在 push 之前准备好，否则路由守卫会触发 getMenuList 但来不及注册动态路由
        await getUserInfo()
      } else {
        // eslint-disable-next-line no-undef
        ElMessage.error(res.msg || '登录失败')
        // 验证码一次性消费，无论成功失败都要刷新
        await refreshCaptcha()
        form.captcha = ''
      }
    } catch(error){
      console.log(error)
      // eslint-disable-next-line no-undef
      ElMessage.error(error.msg || '登录失败')
      await refreshCaptcha()
      form.captcha = ''
    } finally {
      loading.value = false
    }
  })
}

const getUserInfo = async () => {
  try {
    const res = await Login.userInfo()
    if (res.code === 0) {
      let data = res.data
      if (data?.status != '1') {
        ElMessage.error('您的账号已停用，请联系管理员')
        // 安全策略（P0-S06）：await 确保后端清 HttpOnly cookie + token 加黑名单
        await user.logout()
        return
      }

      user.setUserInfo(data)
      Cookies.set('n', data.username, { expires: 7 })

      const appInfoRes = await getAppInfo()
      if (appInfoRes.code === 0 && appInfoRes.data) {
        const { APP_NAME, APP_VERSION, APP_VERSION_TIME } = appInfoRes.data
        Cookies.set('appInfo', JSON.stringify({
          APP_NAME,
          APP_VERSION,
          APP_VERSION_TIME,
          year: APP_VERSION_TIME ? APP_VERSION_TIME.slice(0, 4) : ''
        }), { expires: 7 })
      }

      // 关键：在 push 之前主动拉取菜单（store 填充 menuList），
      // 路由注册统一由 router 守卫 addDynamicRoutes 完成——此处不再手动 addRoute，
      // 避免与守卫二次注册同名路由、且手动注册的路由无法被 logout 回收
      await user.getMenuList()

      ElMessage.success(`登录成功，欢迎回来，${data.username || '用户'}`)

      if (loginIp) {
        Cookies.set('ip', loginIp, { expires: 7 })
        Cookies.remove('_i') // 迁移清理：ip cookie 旧名为 _i
      }
      // 归属地（dashboard 首页展示用）：与 operlog 同源（后端 ip2region 解析）
      if (loginRegion) {
        Cookies.set('pos', JSON.stringify(loginRegion), { expires: 7 })
      }

      // 菜单已注册，跳转到 redirect 或首页
      const redirect = route.query.redirect || '/'
      await router.push(redirect)
    }
  } catch (error) {
    console.log(error)
    // 菜单拉取失败时仍然跳转，让路由守卫兜底处理
    ElMessage.error('获取菜单失败，请刷新重试')
  }
}

async function getAppInfoData() {
  try {
    const res = await getAppInfo();
    if (res.code === 0 && res.data) {
      const { APP_VERSION, APP_VERSION_TIME, APP_NAME } = res.data

      const appInfoData = {
        APP_NAME,
        APP_VERSION,
        APP_VERSION_TIME,
        year: APP_VERSION_TIME.slice(0, 4),
      }

      Object.assign(appInfo, appInfoData)

      Cookies.set('appInfo', JSON.stringify(appInfoData), { expires: 7 })
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await getAppInfoData();
  await refreshCaptcha();
})
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 - 简洁光晕 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 25%);
}

.shape {
  position: absolute;
  opacity: 0.21;
  background: rgba(255, 255, 255, 0.4);
}

.shape-1 {
  width: 400px;
  height: 400px;
  border-radius: 50%;
  top: -150px;
  right: -100px;
  opacity: 0.15;
}

.shape-2 {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  bottom: -100px;
  left: -80px;
  opacity: 0.25;
}

.shape-3 {
 width: 80px;
    height: 80px;
    border-radius: 50%;
    top: 63%;
    left: 30%;
    opacity: 0.30;
}

.shape-4 {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  bottom: 30%;
  right: 12%;
  opacity: 0.20;
}

/* 浮动小圆点 */
.floating-dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.dot {
  position: absolute;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
}

/* 北斗七星 - 勺子形状（左侧）
   视星等：玉衡(1.77) > 天枢(1.79) > 天璇(2.37) > 开阳(2.41) > 摇光(1.86) > 天玑(2.50) > 天权(3.31)
   数值越小越亮，天权最暗
      天枢(1) —— 天璇(2)
         |         |
      天玑(3) —— 天权(4)
                  |
               玉衡(5)
                  |
               开阳(6)
                  |
               摇光(7)
*/
.dot-1 {
  width: 10px;
  height: 10px;
  top: 10%;
  left: 6%;
  opacity: 0.95;
  animation: float 5s ease-in-out infinite;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.4);
}

.dot-2 {
  width: 9px;
  height: 9px;
  top: 10%;
  left: 14%;
  opacity: 0.75;
  animation: float 5s ease-in-out infinite 0.3s;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.3);
}

.dot-3 {
  width: 8px;
  height: 8px;
  top: 20%;
  left: 6%;
  opacity: 0.70;
  animation: float 5s ease-in-out infinite 0.6s;
  box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.25);
}

.dot-4 {
  width: 6px;
  height: 6px;
  top: 20%;
  left: 14%;
  opacity: 0.50;
  animation: float 5s ease-in-out infinite 0.9s;
  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.2);
}

.dot-5 {
  width: 12px;
  height: 12px;
  top: 24%;
  left: 20%;
  opacity: 1;
  animation: float 5s ease-in-out infinite 1.2s;
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.5);
}

.dot-6 {
  width: 8px;
  height: 8px;
  top: 30%;
  left: 24%;
  opacity: 0.73;
  animation: float 5s ease-in-out infinite 1.5s;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.28);
}

.dot-7 {
  width: 10px;
  height: 10px;
  top: 36%;
  left: 28%;
  opacity: 0.88;
  animation: float 5s ease-in-out infinite 1.8s;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.35);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px);
    opacity: 0.7;
  }
}

.login-container {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.login-box {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 72px;
  height: 72px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  letter-spacing: 2px;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #d9d9d9 inset;
    border: none;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px #40a9ff inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #1890ff inset;
    }
  }

  :deep(.el-input__inner) {
    height: 44px;
    font-size: 14px;
  }

  :deep(.el-input__prefix-inner) {
    color: #bfbfbf;
  }
}

.captcha-row {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;

  :deep(.el-input) {
    flex: 1;
  }

  .captcha-img {
    flex-shrink: 0;
    width: 120px;
    height: 44px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    background: #f0f0f0;
    border: 1px solid #d9d9d9;
    transition: border-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #40a9ff;
    }

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  background: #1890ff;
  border: none;
  transition: all 0.3s;
  margin-top: 8px;

  &:hover {
    background: #40a9ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  }

  &:active {
    background: #096dd9;
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  p {
    font-size: 12px;
    color: #919191;
    margin: 4px 0;
  }


}

@media screen and (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }

  .logo-wrapper {
    width: 56px;
    height: 56px;
  }

  .logo {
    width: 32px;
    height: 32px;
  }
}
</style>

<template>
  <div class="ud-page" v-loading="loading">
    <!-- 左：信息卡 -->
    <div class="panel ud-card">
      <div class="ud-avatar">
        <el-avatar v-if="info.avatar" :size="84" :src="info.avatar" />
        <div v-else class="ud-letter">{{ avatarText }}</div>
      </div>
      <div class="ud-name">{{ info.username || '—' }}</div>
      <div class="ud-roles">
        <el-tag
          v-for="r in info.roles"
          :key="r.id"
          size="small"
          type="primary"
          effect="light"
          class="ud-role"
        >{{ r.name }}</el-tag>
        <span v-if="!info.roles || !info.roles.length" class="ud-sub">未分配角色</span>
      </div>
      <el-divider class="ud-div" />
      <ul class="ud-meta">
        <li>
          <el-icon><User /></el-icon>
          <span class="ud-meta-label">用户名</span>
          <span class="ud-meta-val">{{ info.username || '—' }}</span>
        </li>
        <li>
          <el-icon><UserFilled /></el-icon>
          <span class="ud-meta-label">角色</span>
          <span class="ud-meta-val">
            <template v-if="info.roles && info.roles.length">
              {{ info.roles.map(r => r.name).join('、') }}
            </template>
            <span v-else class="ud-sub">未分配角色</span>
          </span>
        </li>
        <li>
          <el-icon><SwitchButton /></el-icon>
          <span class="ud-meta-label">账号状态</span>
          <span class="ud-meta-val">
            <el-tag size="small" :type="info.status == 1 ? 'success' : 'danger'" effect="light">
              {{ info.status == 1 ? '正常' : '禁用' }}
            </el-tag>
          </span>
        </li>
        <li>
          <el-icon><Postcard /></el-icon>
          <span class="ud-meta-label">用户 ID</span>
          <span class="ud-meta-val">{{ info.id || '—' }}</span>
        </li>
      </ul>
      <el-alert
        v-if="isSelf"
        type="info"
        :closable="false"
        show-icon
        class="ud-tip"
        title="账号资料由超级管理员统一维护；此处仅可修改本人登录密码。"
      />
      <el-alert
        v-else
        type="warning"
        :closable="false"
        show-icon
        class="ud-tip"
        title="你正在查看其他管理员的账号，仅超级管理员可修改其资料。"
      />
    </div>

    <!-- 右：表单区 —— 形态只由「是不是自己」决定，任何角色看到的界面完全一致 -->
    <div class="panel ud-main">
      <!-- 形态 A：自己（所有角色）→ 只改密码，双框确认 -->
      <template v-if="isSelf">
        <div class="ud-title">修改密码</div>
        <el-form
          ref="pwdFormRef"
          :model="pwdForm"
          :rules="pwdRules"
          label-width="92px"
          class="ud-form"
        >
          <el-form-item label="新密码" prop="password">
            <el-input
              v-model="pwdForm.password"
              type="password"
              show-password
              placeholder="请输入新密码（6-20 位）"
              maxlength="20"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input
              v-model="pwdForm.confirm"
              type="password"
              show-password
              placeholder="请再次输入新密码"
              maxlength="20"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="saving"
              v-permission="['base:user:update']"
              @click="savePwd"
            >保存</el-button>
            <el-button @click="resetPwd">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 形态 B：超管看别人 → 编辑资料 -->
      <template v-else>
        <div class="ud-title">编辑资料</div>
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="92px"
          class="ud-form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" placeholder="请输入用户名" maxlength="30" />
          </el-form-item>
          <el-form-item label="角色" prop="role_ids">
            <el-select v-model="editForm.role_ids" multiple placeholder="请选择角色" style="width: 100%">
              <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="editForm.status">
              <el-radio value="1">正常</el-radio>
              <el-radio value="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="重置密码" prop="password">
            <el-input
              v-model="editForm.password"
              type="password"
              show-password
              placeholder="留空表示不修改（6-20 位）"
              maxlength="20"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="saving"
              v-permission="['base:user:update']"
              @click="saveEdit"
            >保存</el-button>
            <el-button @click="loadInfo">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup name="UserDetail">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserFilled, SwitchButton, Postcard } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { detail, update, rolelist } from './api/index.js'
import { userStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = userStore()

// 超管判定：与后端 isSuperAdmin（hasRole 'super'）口径一致 —— 权限含 *:*:* 通配
const isSuper = computed(() => (user.perms || []).includes('*:*:*'))
const myId = computed(() => user.userInfo?.id)
// 目标用户：路由参数优先，非法值回落为自己
const targetId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : Number(myId.value)
})
const isSelf = computed(() => String(targetId.value) === String(myId.value))

const loading = ref(false)
const saving = ref(false)

const info = reactive({
  id: '',
  username: '',
  avatar: '',
  status: '',
  roles: [],
})

const roleList = ref([])

// ---- 字母/汉字占位头像（无头像时，浅蓝色圆 + 白字） ----
// 英文用户名取首字母；中文名取最后两个字
const avatarText = computed(() => {
  const name = (info.username || '').trim()
  if (!name) return ''
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.replace(/[^\u4e00-\u9fa5]/g, '').slice(-2)
  }
  return name.charAt(0).toUpperCase()
})

// ============ 形态 A：修改自己的密码 ============
const pwdFormRef = ref()
const pwdForm = reactive({ password: '', confirm: '' })
const pwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度 6-20 位', trigger: 'blur' },
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        if (value !== pwdForm.password) cb(new Error('两次输入不一致'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

// ============ 形态 B：编辑他人资料（仅超管） ============
const editFormRef = ref()
const editForm = reactive({
  username: '',
  role_ids: [],
  status: '1',
  password: '',
})
const editRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ min: 6, max: 20, message: '长度 6-20 位', trigger: 'blur' }],
}

// ============ 数据加载 ============
async function loadInfo() {
  // 🔴 非超管只能看自己：把 URL 纠正回本人。
  //    后端 detail 的行级保护只挡「没有 base:user:list 的角色」，而普通管理员/游客/编辑
  //    其实都持有 base:user:list → 他们直连别人的 id 仍能读到对方资料。
  //    前端在这里统一收口，保证详情页**只有两种形态**：
  //      · 看自己（任何角色）→ 修改密码
  //      · 看别人（仅超管）  → 编辑资料
  //    不存在第三种"看得到别人但改不了"的半权限界面。
  if (!isSuper.value && myId.value && String(targetId.value) !== String(myId.value)) {
    router.replace(`/user/detail/${myId.value}`)
    return
  }

  loading.value = true
  try {
    const id = targetId.value
    const res = await detail(Number.isFinite(id) ? { id } : {})
    if (res.code !== 0 || !res.data) return

    // 兜底：URL 与实际落到的人仍不一致时（后端行级保护回落），把 URL 纠正过来，
    // 避免"地址写 A、内容显示 B"的错位。
    if (myId.value && String(res.data.id) !== String(route.params.id)) {
      router.replace(`/user/detail/${res.data.id}`)
    }

    Object.assign(info, {
      id: res.data.id,
      username: res.data.username,
      avatar: res.data.avatar,
      status: res.data.status,
      roles: res.data.roles || [],
    })

    if (!isSelf.value) {
      editForm.username = res.data.username || ''
      editForm.role_ids = res.data.roleIds || []
      editForm.status = String(res.data.status ?? '1')
      editForm.password = ''
    }
  } catch {
    // 登录态兜底：直接用 store 里的 userInfo
    const u = user.userInfo || {}
    Object.assign(info, {
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      status: u.status,
      roles: u.roles || [],
    })
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  if (!isSuper.value) return
  try {
    const res = await rolelist()
    if (res.code === 0) roleList.value = res.data.list || []
  } catch (e) {
    console.warn('[user-detail] 角色列表加载失败:', e)
  }
}

/**
 * 改了自己的密码后重新登录
 * 🔴 必须先 `location.hash = '#/login'` 再 reload —— 直接 reload 会重载「当前地址」
 *    （/user/detail/:id 不在白名单），冷启动守卫会打探测接口拿到 401 并弹「token失效」。
 */
async function relogin() {
  await user.logout()
  window.location.hash = '#/login'
  window.location.reload()
}

async function savePwd() {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await update({ userId: info.id, password: pwdForm.password })
      if (res.code === 0) {
        ElMessage.success('密码修改成功，请重新登录')
        await relogin()
      } else {
        ElMessage.error(res.msg || '修改失败')
      }
    } catch (e) {
      ElMessage.error(e.message || '修改失败')
    } finally {
      saving.value = false
    }
  })
}

function resetPwd() {
  pwdFormRef.value?.resetFields()
}

async function saveEdit() {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const params = {
        userId: info.id,
        username: editForm.username,
        status: editForm.status,
        role_ids: editForm.role_ids,
      }
      // 留空 = 不修改密码（后端只在 password 为真值时更新）
      if (editForm.password) params.password = editForm.password
      const res = await update(params)
      if (res.code === 0) {
        ElMessage.success('保存成功')
        editForm.password = ''
        await loadInfo()
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

// 切换目标用户（如从别人跳回自己）时重新拉数据
watch(() => route.params.id, (val) => {
  if (val !== undefined) loadInfo()
})

onMounted(() => {
  loadInfo()
  loadRoles()
})
</script>

<style lang="less" scoped>
.ud-page {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.ud-card {
  width: 360px;
  flex: none;
  padding: 28px 24px;
  text-align: center;
}
.ud-avatar {
  display: flex;
  justify-content: center;
  :deep(.el-avatar) {
    background: #eef3ff;
    color: #4a82f7;
  }
}
// 单圈浅蓝圆 + 白字
.ud-letter {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #74a4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}
.ud-name {
  margin: 14px 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}
.ud-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  min-height: 24px;
}
.ud-role {
  border-color: #d6e2ff;
  color: #4a82f7;
  background: #eef3ff;
}
.ud-div {
  margin: 18px 0;
}
.ud-meta {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    font-size: 13px;
    border-bottom: 1px solid #f2f3f5;
    &:last-child {
      border-bottom: none;
    }
    .el-icon {
      color: #4a82f7;
      font-size: 15px;
    }
  }
}
.ud-meta-label {
  color: #86909c;
  width: 64px;
  flex: none;
}
.ud-meta-val {
  color: #1d2129;
  font-weight: 500;
  word-break: break-all;
}
.ud-sub {
  color: #c9cdd4;
  font-size: 12px;
}
.ud-tip {
  margin-top: 16px;
  text-align: left;
}

.ud-main {
  flex: 1;
  min-width: 360px;
  padding: 24px;
}
.ud-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f3f5;
}
.ud-form {
  max-width: 420px;
  margin-top: 8px;
}
</style>

<template>
  <div class="member-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">个人中心</h2>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="member-content">
      <el-form
        ref="profileForm"
        :model="user"
        :rules="rules"
        label-position="top"
        class="member-form"
      >
        <!-- 头像和基本信息 -->
        <div class="avatar-section">
          <el-avatar v-if="user.avatarUrl" :size="64" :src="user.avatarUrl" class="user-avatar">
            <img :src="user.avatarUrl" alt="" />
          </el-avatar>
          <div class="user-info">
            <p class="info-item">
              <span class="info-label">会员等级</span>
              <el-tag type="warning" effect="plain">V1</el-tag>
            </p>
            <p class="info-item">
              <span class="info-label">会员编码</span>
              <span class="info-value">{{ user.id }}</span>
            </p>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-section">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="user.username" :disabled="!user.username?.startsWith('wx-')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="user.nickname" placeholder="请输入昵称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="user.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="user.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="user.sex" placeholder="请选择性别" class="w-full">
                  <el-option label="男" value="1" />
                  <el-option label="女" value="2" />
                  <el-option label="保密" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="微信" prop="wechat">
                <el-input v-model="user.wechat" placeholder="请输入微信号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="自我介绍" prop="remark">
            <el-input
              v-model="user.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入自我介绍"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSave" :loading="saving">
              保存修改
            </el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { userInfo, updateUser } from "./api/index.js";
import { useContentStore } from "@/store/content.js";

// 表单引用
const profileForm = ref(null);

// 状态
const saving = ref(false);
const contentStore = useContentStore();

// 个人中心数据
const user = reactive({
  avatar: null,
  avatarUrl: null,
  created_at: "",
  email: "",
  id: 0,
  login_date: "",
  phone: null,
  remark: null,
  sex: "0",
  status: null,
  username: "",
  nickname: "",
  wechat: ""
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号码",
      trigger: "blur",
    },
  ],
  remark: [{ max: 200, message: "长度不能超过 200 个字符", trigger: "blur" }],
};

// 初始化
onMounted(() => {
  getUserInfo();
});

/**
 * @description 获取用户信息：优先复用 MainLayout 已缓存到 store 的详情，
 * 未缓存（直接进入/已过期）才请求，避免与 MainLayout 重复请求 /member/v1/detail
 */
const getUserInfo = async () => {
  try {
    const cached = contentStore.userInfo
    if (cached) {
      Object.assign(user, cached);
      user.avatarUrl = cached.avatar;
      return;
    }
    const res = await userInfo();
    if (res.code === 0) {
      Object.assign(user, res.data);
      user.avatarUrl = res.data.avatar;
      contentStore.setUserInfo(res.data);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 保存个人中心
async function handleSave() {
  try {
    await profileForm.value.validate();
    saving.value = true;
    let params = {
      id: user.id,
      phone: user.phone,
      sex: user.sex,
      remark: user.remark,
      wechat: user.wechat,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
    }
    let res = await updateUser(params);
    if (res.code === 0 && res.data) {
      ElMessage.success("保存成功");
      getUserInfo();
    }
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.member-container {

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
.member-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}


/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.user-avatar {
  border: 2px solid #e4e7ed;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #606266;
  font-weight: 500;
}

/* 表单区域 */
.form-section {
  padding-top: 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.w-full {
  width: 100%;
}

/* 响应式 */
@media (max-width: 768px) {
  .member-container {
  }

  .member-content {
    padding: 16px;
  }

  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

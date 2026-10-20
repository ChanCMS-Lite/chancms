<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="会员信息"
    width="650px"
    destroy-on-close
    :close-on-click-modal="false"
    class="member-detail-dialog"
  >
    <div class="member-detail">
      <div class="avatar-section">
          <el-avatar :size="60" :src="memberData.avatar || defaultAvatar"></el-avatar>
        </div>
      <el-form :model="formData" label-position="top" class="edit-form" v-if="Object.keys(formData).length > 0">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="formData.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>

        <el-form-item label="性别">
          <el-select v-model="formData.sex" placeholder="请选择性别">
            <el-option label="未知" value="0"></el-option>
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <div class="status-wrapper">
            <el-switch
              v-model="formData.statusSwitch"
              :active-value="true"
              :inactive-value="false"
            ></el-switch>
            <span class="status-text">{{ formData.statusSwitch ? '启用' : '禁用' }}</span>
          </div>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>

        <el-form-item label="微信号">
          <el-input v-model="formData.wechat" placeholder="请输入微信号"></el-input>
        </el-form-item>

        <el-form-item label="注册时间">
          <el-input :value="formatDate(memberData.created_at)" disabled></el-input>
        </el-form-item>

        <el-form-item label="最后登录">
          <el-input :value="memberData.loginDate || '-'" disabled></el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button size="large" @click="$emit('update:visible', false)">关闭</el-button>
      <el-button size="large" type="primary" v-permission="['member:user:update']" @click="handleSave" :loading="saving">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { updateUser } from '../api/index.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  memberData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'save']);

const defaultAvatar = ref('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTNmMmZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MGU4ZmY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0idXJsKCNncmFkaWVudCkiIC8+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC45KSIgLz4KICA8cGF0aCBkPSJNMjAgODAgUTUwIDU1IDgwIDgwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC45KSIgc3Ryb2tlLXdpZHRoPSI2IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+Cjwvc3ZnPg==');

const formData = reactive({
  username: '',
  nickname: '',
  sex: '0',
  email: '',
  phone: '',
  wechat: '',
  remark: '',
  statusSwitch: false
});

const saving = ref(false);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const initFormData = () => {
  formData.username = props.memberData.username || '';
  formData.nickname = props.memberData.nickname || '';
  formData.sex = props.memberData.sex || '0';
  formData.email = props.memberData.email || '';
  formData.phone = props.memberData.phone || '';
  formData.wechat = props.memberData.wechat || '';
  formData.remark = props.memberData.remark || '';
  formData.statusSwitch = props.memberData.status == 1;
};

const handleSave = async () => {
  saving.value = true;
  try {
    const data = {
      id: props.memberData.id,
      nickname: formData.nickname,
      sex: formData.sex,
      email: formData.email,
      phone: formData.phone,
      wechat: formData.wechat,
      remark: formData.remark,
      status: formData.statusSwitch
    };
    const res = await updateUser(data);
    if (res.code === 0) {
      ElMessage.success('保存成功');
      emit('save');
      emit('update:visible', false);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

defineExpose({
  initFormData
});
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 20px;
}

.edit-form {
  padding: 0;
}

.member-detail {
  padding: 0;
}

.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-text {
  font-size: 14px;
  color: #606266;
}

:deep(.member-detail-dialog) {
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>

<template>
  <el-dialog v-model="dialogVisible" title="配置" width="80%" destroy-on-close @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-position="top">
      <el-form-item label="类型标识" prop="type_code">
        <el-input v-model="state.form.type_code" disabled></el-input>
      </el-form-item>

      <el-form-item label="配置名称" prop="config_key">
        <el-input v-model="state.form.config_key" placeholder="请输入用户名"></el-input>
      </el-form-item>

      <el-form-item label="配置键值" prop="config_value">
        <!-- 上传类型白名单：专用可视化编辑器（分类勾选 + 高级自定义），序列化回 JSON 字符串 -->
        <UploadAllowEditor v-if="state.form.type_code === 'upload_allow_config'" v-model="state.form.config_value" />
        <!-- 其余配置：通用代码编辑器 -->
        <Code v-else :content-id="currentId" :file-type="currentType" :content="fileContent" @save="handleSave" />
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
        <el-button type="primary" @click="handleClick(formRef)" v-permission="['base:config:create', 'base:config:update']">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>

import Code from '@/components/editor/code.vue'
import UploadAllowEditor from './upload-allow-editor.vue'
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  computed,
  watch,
} from 'vue'
import { detail, create, update } from '../api/index.js'

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
    default: ''
  }
})

const currentId = ref(1)
const currentType = ref('json')
const fileContent = ref('{"name": "test"}')



const formRef = ref(null);

const emit = defineEmits(['update:visible']);
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
});

//数据
const state = reactive({
  form: {
    type_code: '',
    config_key: '',
    config_value: '',
    status: '1',
    remark: ''
  },
})

// onMounted(() => {
//   state.form.type_code = props.type_code
// });

// 关闭对话框
const handleClose = () => {
  state.form = {
    config_key: '',
    config_value: '',
    status: '1',
    remark: ''
  }
  state.form.type_code = props.type_code;
  emit('update:visible', false)
}

watch(
  () => props.type_code,
  async newVal => {
    state.form.type_code = newVal;
  });

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
    }
  },
)

const handleSave = (code) => {
  try {
    // 验证并格式化 JSON，保留缩进
    const parsed = JSON.parse(code.content);
    state.form.config_value = JSON.stringify(parsed, null, 2);
  } catch {
    // 如果不是有效 JSON，保持原字符串
    state.form.config_value = code.content;
  }
}


//创建菜单
const createUserType = async () => {
  try {
    let data = { ...state.form };
    // 将 config_value 对象序列化为 JSON 字符串（保留缩进格式）
    if (data.config_value && typeof data.config_value === 'object') {
      data.config_value = JSON.stringify(data.config_value, null, 2);
    }
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
    // 将 config_value 对象序列化为 JSON 字符串（保留缩进格式）
    if (params.config_value && typeof params.config_value === 'object') {
      params.config_value = JSON.stringify(params.config_value, null, 2);
    }
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
      let { id, config_key, config_value, type_code, status, remark } = res.data
      state.form = { id, config_key, config_value, type_code, status, remark };
      // 确保 fileContent 是字符串
      if (typeof config_value === 'object') {
        fileContent.value = JSON.stringify(config_value, null, 2);
      } else {
        fileContent.value = config_value || '{}';
      }
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



</script>

<style lang="less" scoped>
.el-dialog{
  margin-top: 4vh;
  --el-dialog-margin-top: 1vh;
}


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

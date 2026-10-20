<template>
  <div class="dynamic-form">
    <!-- 按分组渲染字段 -->
    <div v-for="group in fieldGroups" :key="group.name" class="field-group">
      <div class="group-header">
        <span class="group-title">{{ group.name }}</span>
        <!-- 右上操作槽：组内有 array 字段时渲染「添加」按钮（数据来自 ArrayEditor 注册的 registry）。
             maxCount<=1 时不显示（字段固定 1 条，不允许增减） -->
        <span
          v-if="!isSubForm && arrayHeaderMap[groupHeaderKey(group)] && arrayHeaderMap[groupHeaderKey(group)].getMax() > 1"
          class="group-actions"
        >
          <el-button
            type="primary"
            plain

            :disabled="arrayHeaderMap[groupHeaderKey(group)].getCount() >= arrayHeaderMap[groupHeaderKey(group)].getMax()"
            @click="arrayHeaderMap[groupHeaderKey(group)].add()"
          >
            <el-icon><Plus /></el-icon>
            {{ arrayHeaderMap[groupHeaderKey(group)].getCount() >= arrayHeaderMap[groupHeaderKey(group)].getMax() ? '已达上限' : `添加${arrayHeaderMap[groupHeaderKey(group)].getName()}` }}
          </el-button>
          <span class="array-count">
            <template v-if="arrayHeaderMap[groupHeaderKey(group)].getCount() >= arrayHeaderMap[groupHeaderKey(group)].getMax()">
              已达上限 {{ arrayHeaderMap[groupHeaderKey(group)].getMax() }} 条
            </template>
            <template v-else>
              共 {{ arrayHeaderMap[groupHeaderKey(group)].getCount() }}/{{ arrayHeaderMap[groupHeaderKey(group)].getMax() }} 条
            </template>
          </span>
        </span>
      </div>

      <el-row :gutter="16">
        <el-col
          v-for="field in group.fields"
          :key="field.id"
          :sm="24"
          :md="getFieldSpan(field)"
        >
          <el-form-item
            :label="isComplexField(field) ? '' : field.field_label"
            :label-width="isComplexField(field) ? '0px' : ''"
            :class="{ 'is-error': errors[field.field_name], 'no-label-item': isComplexField(field) }"
            :error="errors[field.field_name]"
          >
            <!-- 单行文本 -->
            <el-input
              v-if="field.type === 'text'"
              v-model="formData[field.field_name]"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
              :maxlength="field.field_config?.maxLength"
              show-word-limit
              @blur="validateField(field)"
            />

            <!-- 多行文本 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.field_name]"
              type="textarea"
              :rows="4"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
              :maxlength="field.field_config?.maxLength"
              show-word-limit
              @blur="validateField(field)"
            />

            <!-- 数字 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.field_name]"
              :min="field.field_config?.min"
              :max="field.field_config?.max"
              :step="field.field_config?.step || 1"
              style="width: 100%"
              @change="validateField(field)"
            />

            <!-- 邮箱 -->
            <el-input
              v-else-if="field.type === 'email'"
              v-model="formData[field.field_name]"
              type="email"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
              @blur="validateField(field)"
            />

            <!-- 网址 -->
            <el-input
              v-else-if="field.type === 'url'"
              v-model="formData[field.field_name]"
              type="url"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
              @blur="validateField(field)"
            />

            <!-- 电话 -->
            <el-input
              v-else-if="field.type === 'tel'"
              v-model="formData[field.field_name]"
              type="tel"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
            />

            <!-- 下拉选择 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.field_name]"
              :placeholder="`请选择${field.field_label}`"
              style="width: 100%"
              @change="validateField(field)"
            >
              <el-option
                v-for="option in field.field_config?.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- 单选 -->
            <el-radio-group
              v-else-if="field.type === 'radio'"
              v-model="formData[field.field_name]"
              @change="validateField(field)"
            >
              <el-radio
                v-for="option in field.field_config?.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>

            <!-- 多选 -->
            <el-checkbox-group
              v-else-if="field.type === 'checkbox'"
              v-model="formData[field.field_name]"
              @change="validateField(field)"
            >
              <el-checkbox
                v-for="option in field.field_config?.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 开关 -->
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="formData[field.field_name]"
            />

            <!-- 日期 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.field_name]"
              type="date"
              :placeholder="`请选择${field.field_label}`"
              style="width: 100%"
              @change="validateField(field)"
            />

            <!-- 日期时间 -->
            <el-date-picker
              v-else-if="field.type === 'datetime'"
              v-model="formData[field.field_name]"
              type="datetime"
              :placeholder="`请选择${field.field_label}`"
              style="width: 100%"
              @change="validateField(field)"
            />

            <!-- 单图上传 -->
            <ImageUploader
              v-else-if="field.type === 'image'"
              v-model="formData[field.field_name]"
              :max-count="1"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 多图上传 -->
            <ImageUploader
              v-else-if="field.type === 'images'"
              v-model="formData[field.field_name]"
              :max-count="field.field_config?.maxCount || 20"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 单文件上传 -->
            <FileUploader
              v-else-if="field.type === 'file'"
              v-model="formData[field.field_name]"
              :max-count="1"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 多文件上传 -->
            <FileUploader
              v-else-if="field.type === 'files'"
              v-model="formData[field.field_name]"
              :max-count="field.field_config?.maxCount || 20"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 富文本编辑器 -->
            <Vue3Tinymce
              v-else-if="field.type === 'richtext'"
              v-model="formData[field.field_name]"
              :setting="tinymceSet"
              script-src="/public/admin/tinymce/tinymce.min.js"
            />

            <!-- Markdown 编辑器 -->
            <md-editor
              v-else-if="field.type === 'markdown'"
              v-model="formData[field.field_name]"
            />

            <!-- JSON 编辑器（使用文本域，兼容旧 json 类型数据） -->
            <el-input
              v-else-if="field.type === 'json'"
              v-model="formData[field.field_name]"
              type="textarea"
              :rows="6"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}（JSON格式）`"
              @blur="validateField(field)"
            />

            <!-- 代码编辑器（语法高亮，取代 JSON 文本域） -->
            <CodeEditor
              v-else-if="field.type === 'code'"
              v-model="formData[field.field_name]"
              :file-type="field.field_config?.language || 'json'"
              @update:model-value="validateField(field)"
            />

            <!-- 数组编辑器（第一个 array 的"添加"按钮外置到 group_name 标题栏右侧） -->
            <ArrayEditor
              v-else-if="field.type === 'array'"
              v-model="formData[field.field_name]"
              :field-config="field.field_config"
              :header-key="arrayHeaderKey(field)"
              @update:model-value="validateField(field)"
            />

            <!-- 颜色选择器 -->
            <el-color-picker
              v-else-if="field.type === 'color'"
              v-model="formData[field.field_name]"
            />

            <!-- 地理位置（普通文本输入） -->
            <el-input
              v-else-if="field.type === 'location'"
              v-model="formData[field.field_name]"
              :placeholder="field.field_config?.placeholder || `请输入${field.field_label}`"
            />

            <!-- 关联内容（文章选择弹窗） -->
            <RelationEditor
              v-else-if="field.type === 'relation'"
              v-model="formData[field.field_name]"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 组合字段（一组固定子字段，自动全部渲染，存为对象） -->
            <GroupEditor
              v-else-if="field.type === 'group'"
              v-model="formData[field.field_name]"
              :field-config="field.field_config"
              :field="field"
              :header-key="arrayHeaderKey(field)"
              @update:model-value="validateField(field)"
            />

            <!-- 动态表格（表头/列每篇文章自定义，模板存于 sys_config mid_template） -->
            <TableEditor
              v-else-if="field.type === 'table'"
              v-model="formData[field.field_name]"
              :field-config="field.field_config"
              @update:model-value="validateField(field)"
            />

            <!-- 未知类型 -->
            <el-input
              v-else
              v-model="formData[field.field_name]"
              :placeholder="`未知字段类型: ${field.type}`"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ImageUploader from './ImageUploader.vue';
import FileUploader from './FileUploader.vue';
import ArrayEditor from './ArrayEditor.vue';
import RelationEditor from './RelationEditor.vue';
import GroupEditor from './GroupEditor.vue';
import TableEditor from './TableEditor.vue';
import CodeEditor from './editor/code.vue';
import Vue3Tinymce from './Vue3Tinymce/src/Main.vue';
import MdEditor from './MdEditor/index.vue';
import { tinymceSet } from '@/config/tinymce.js';
import { provide, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  fields: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  /**
   * 是否为嵌套子表单（由 GroupEditor 递归调用）
   * true 时：跳过"按 group_name 分组"包装，平铺渲染
   */
  isSubForm: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// ===== Array 字段 header 外置 registry =====
// ArrayEditor 挂载时把 {add, getCount, getMax, getName} 注册到 key（= groupName|fieldName）。
// group-header 右侧渲染的"添加"按钮从 registry 读这些 API，避免 Teleport 跨组件锚点
// 在 tab 切换 / keep-alive 时丢失目标而抛错。
const arrayHeaderMap = reactive({});
provide('arrayHeaderRegistry', {
  register: (key, api) => { arrayHeaderMap[key] = api; },
  unregister: (key) => { delete arrayHeaderMap[key]; }
});

// 表单数据
const formData = ref({});
// 验证错误信息
const errors = ref({});

// 同步版本号
let syncVersion = 0;

// 递归解析 JSON 字符串值
const parseJsonValues = (obj) => {
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(obj);
      } catch {
        return obj;
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => parseJsonValues(item));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = parseJsonValues(obj[key]);
    }
    return result;
  }
  return obj;
};

// 从父组件同步数据到内部
const syncFromParent = (data) => {
  syncVersion++;
  formData.value = data ? parseJsonValues(JSON.parse(JSON.stringify(data))) : {};
};

// 🔴 防回声循环（根因修复 2026-08-21）：
// 原实现：formData 变化 → 防抖 emit → 父组件 extData 更新 → 本组件 watch(modelValue) → syncFromParent
// 整体替换 formData → 再 emit → 父再更新 → …… 无限循环（每 150ms 一轮）。
// 每轮循环都用父级旧快照覆盖 formData，ArrayEditor/ImageUploader 等带 50ms 防抖 + syncVersion
// 守卫的子组件，编辑后 50ms 窗口内循环触发 syncVersion++ → 防抖 emit 被丢弃、内部数据被旧值覆盖 → 编辑丢失。
// 修复：记录最后一次 emit 的 JSON，父级回传内容与之相同（即本组件 emit 的回声）时跳过重同步。
let lastEmittedJson = null;

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  // 父级回传与上次 emit 完全一致 → 本次是本组件自己的回声，跳过重同步（打破循环）
  if (lastEmittedJson != null && newVal && typeof newVal === 'object') {
    try {
      if (JSON.stringify(newVal) === lastEmittedJson) return;
    } catch { /* 序列化失败不拦截，走正常同步 */ }
  }
  syncFromParent(newVal);
}, { immediate: true });

// 监听 fields 变化，补充默认值
watch(() => props.fields, (newFields) => {
  if (!newFields || !newFields.length) return;

  const current = { ...formData.value };
  let changed = false;

  newFields.forEach(field => {
    const fieldName = field.field_name;
    if (current[fieldName] === undefined) {
      changed = true;
      switch (field.type) {
        case 'checkbox':
        case 'images':
        case 'files':
        case 'array':
          current[fieldName] = [];
          break;
        case 'table':
          // 动态表格：初始空对象，TableEditor 内部由用户自定义表头/行
          current[fieldName] = {};
          break;
        case 'switch':
          current[fieldName] = false;
          break;
        case 'number':
          current[fieldName] = field.field_config?.min || 0;
          break;
        case 'group':
          // 组合字段：初始空对象，GroupEditor 内部按 items 注入子键
          current[fieldName] = {};
          break;
        default:
          current[fieldName] = field.field_config?.defaultVal || '';
      }
    }
  });

  if (changed) {
    syncVersion++;
    formData.value = current;
  }
}, { immediate: true });

// 监听表单数据变化，同步到父组件
let updateTimer = null;
watch(formData, () => {
  if (updateTimer) clearTimeout(updateTimer);

  const emitVersion = syncVersion;
  updateTimer = setTimeout(() => {
    if (syncVersion === emitVersion) {
      const payload = JSON.parse(JSON.stringify(formData.value));
      lastEmittedJson = JSON.stringify(payload);  // 记录回声指纹，供 modelValue watch 判断跳过
      emit('update:modelValue', payload);
    }
  }, 150);
}, { deep: true, flush: 'post' });

// 字段分组
const fieldGroups = computed(() => {
  // 嵌套子表单（GroupEditor 内部递归调用）不需要再按 group_name 分组包装
  if (props.isSubForm) {
    return [{
      name: '',
      fields: props.fields || []
    }];
  }

  const groups = {};

  props.fields.forEach(field => {
    const groupName = field.group_name || '基本信息';

    if (!groups[groupName]) {
      groups[groupName] = {
        name: groupName,
        fields: []
      };
    }

    groups[groupName].fields.push(field);
  });

  return Object.values(groups);
});

// 获取字段占用的列宽
// 默认全宽 24（一行一个），保持编辑页所有字段宽度统一、视觉整齐
const getFieldSpan = () => 24;

// 复杂字段：array/group/code 都有自己的内部 label / UI（group header 按钮、group 子项标题、代码块高亮），
// 外层 el-form-item 的 label 框要强制隐藏，否则会出现多余的"问答"/"产品参数"等标题。
// **注意：relation 不在此列**——RelationEditor 内部没有区块标题，外层 label "推荐商品"是唯一的字段名展示，
// 藏掉会导致用户看不出这个字段是干嘛的。
const isComplexField = (field) =>
  ['array', 'group', 'code'].includes(field.type);

// 生成 array/group 字段注册到 header registry 的 key
// - array: 用 groupName|fieldName（fieldName 在同 group 内唯一）
// - group: 用 group|groupName|id（group 没有唯一 fieldName，用 field.id 保证唯一）
const arrayKey = (field) => {
  const groupName = field.group_name || '基本信息';
  if (field.type === 'group') {
    return `group|${groupName}|${field.id}`;
  }
  return `${groupName}|${field.field_name}`;
};

// 找某分组内「第一个 group 字段」的 key（只有它负责组标题栏右侧的按钮注册）。
// array 字段的添加按钮已下沉到 ArrayEditor 组件底部，不再占用 group header。
const groupHeaderKey = (group) => {
  const first = group?.fields?.find(f => f.type === 'group');
  return first ? arrayKey(first) : '';
};

// 某 group 字段对应的 headerKey：仅当它是本组「第一个 group」时才返回 key（外置到组标题栏），
// array 类型固定返回 ''，避免标题栏重复出现添加按钮。
const arrayHeaderKey = (field) => {
  if (props.isSubForm) return '';
  if (field.type !== 'group') return '';
  const groupName = field.group_name || '基本信息';
  const first = props.fields.find(f =>
    f.type === 'group' &&
    (f.group_name || '基本信息') === groupName
  );
  if (!first || first !== field) return '';
  return arrayKey(field);
};

// 单字段验证
const validateField = (field) => {
  const fieldName = field.field_name;
  const value = formData.value[fieldName];

  // 组合字段：跳过顶层必填校验，由 GroupEditor 内部按子字段各自验证
  if (field.type === 'group') {
    errors.value[fieldName] = '';
    return true;
  }

  const isArrayType = ['images', 'files', 'array', 'checkbox'].includes(field.type);

  // 清除之前的错误
  if (!field.is_required) {
    errors.value[fieldName] = '';
    return true;
  }

  // 必填验证
  if (isArrayType) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      errors.value[fieldName] = `${field.field_label}为必填项`;
      return false;
    }
  } else {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.value[fieldName] = `${field.field_label}为必填项`;
      return false;
    }
  }

  // 类型验证
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.value[fieldName] = '请输入有效的邮箱地址';
      return false;
    }
  }

  if (field.type === 'url' && value) {
    try {
      new URL(value);
    } catch {
      errors.value[fieldName] = '请输入有效的网址';
      return false;
    }
  }

  errors.value[fieldName] = '';
  return true;
};

// 整体验证方法（供父组件调用）
const validate = () => {
  errors.value = {};
  let isValid = true;
  const errorMessages = [];

  props.fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
      errorMessages.push(errors.value[field.field_name]);
    }
  });

  return {
    valid: isValid,
    errors: errors.value,
    messages: errorMessages
  };
};

// 清除所有错误
const clearErrors = () => {
  errors.value = {};
};

// 暴露方法给父组件
defineExpose({
  validate,
  clearErrors,
  formData
});
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}

.field-group {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #f5f5f5;
  border-radius: 5px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

/* 标题栏右侧的操作槽：ArrayEditor 用 Teleport 把"添加"按钮浮到这里 */
.group-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* 不压缩，确保始终贴在卡片最右端 */
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  position: relative;
  padding-left: 10px;
  flex: 1; /* 占满剩余空间，把 .group-actions 推到卡片最右端 */
}

.group-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #409eff;
  border-radius: 2px;
}

.field-group :deep(.el-form-item) {
  margin-bottom: 16px;
}

.field-group :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  padding-right: 10px;
}

.field-group :deep(.el-form-item__content) {
  line-height: 32px;
}

/* 复杂字段（array/group/code/relation）外层 el-form-item 强制隐藏 label 框，
   不留宽度也不留 padding，避免与组件内部 label 重复 */
.no-label-item :deep(.el-form-item__label) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.no-label-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
}
</style>

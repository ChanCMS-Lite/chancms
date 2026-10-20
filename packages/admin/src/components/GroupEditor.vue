<template>
  <!--
    group 类型与 array 类型共享同一套渲染（用 ArrayEditor）：
    - v-model 是对象（{ask:'',ansk:''}），内部映射为长度为 1 的数组给 ArrayEditor
    - maxCount=1, minCount=1（固定一组：删除按钮 disabled，添加按钮因 maxCount<=1 不显示）
    - headerKey 注册到 DynamicForm 的 registry，让 group_name 标题栏右侧统一显示
      "添加{field_label} 共 N/1 条" 按钮（与 array 完全同款样式）
    - 视觉/交互 100% 复用 array 渲染，两种 type 保持统一
  -->
  <ArrayEditor
    :model-value="arrayValue"
    :field-config="arrayFieldConfig"
    :header-key="headerKey"
    :min-count="1"
    @update:model-value="onArrayUpdate"
  />
</template>

<script setup>
import { computed } from 'vue';
import ArrayEditor from './ArrayEditor.vue';

const props = defineProps({
  // group 字段的 v-model 是一个对象 { sub_field_name: value, ... }
  modelValue: {
    type: Object,
    default: () => ({})
  },
  fieldConfig: {
    type: Object,
    default: () => ({})
  },
  // 字段元信息（DynamicForm 传入，用于生成 headerKey + itemName）
  field: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// 把对象 v-model 映射为长度为 1 的数组（ArrayEditor 期待数组形态）
const arrayValue = computed(() => {
  const obj = (props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue))
    ? props.modelValue
    : {};
  return [obj];
});

// ArrayEditor 配置：固定 1 条（maxCount=1, minCount=1 在外层 prop 传）
const arrayFieldConfig = computed(() => ({
  items: props.fieldConfig?.items || [],
  maxCount: 1,
  itemName: props.field?.field_label || '项',
  cols: props.fieldConfig?.cols || 1
}));

// 注册到 DynamicForm 的 group_name 标题栏右侧
// key 用 field.id 保证唯一（group 字段无 group 内子分组，不依赖 fieldName）
const headerKey = computed(() => {
  if (!props.field?.id) return '';
  return `group|${props.field.group_name || '基本信息'}|${props.field.id}`;
});

// ArrayEditor → 转换为对象 emit
const onArrayUpdate = (newArr) => {
  if (Array.isArray(newArr) && newArr.length > 0) {
    emit('update:modelValue', newArr[0] || {});
  } else {
    // group 类型不允许为空：兜底为空对象（minCount=1 实际上不会走到这里）
    emit('update:modelValue', {});
  }
};
</script>

<style scoped>
/* group 类型不再用 DynamicForm 递归，因此不需要覆盖父 :deep 穿透的 label 隐藏 */
</style>

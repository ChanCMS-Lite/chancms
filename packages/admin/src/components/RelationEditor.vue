<template>
  <div class="relation-editor">
    <div class="relation-toolbar">
      <el-button type="primary" @click="openPicker">
        <el-icon class="mr-5"><Plus /></el-icon>选择{{ label }}
      </el-button>
      <span class="relation-count">已关联 {{ list.length }} / {{ maxCount }}</span>
    </div>

    <div v-if="list.length === 0" class="empty-tip">
      暂无关联内容，点击上方按钮从文章库选择
    </div>

    <div v-else class="relation-chips">
      <div
        v-for="(item, idx) in list"
        :key="item.article_id"
        class="relation-chip"
      >
        <span class="chip-index">{{ idx + 1 }}</span>
        <span class="chip-title" :title="item.title">{{ item.title }}</span>
        <span v-if="item.category_name" class="chip-cat">{{ item.category_name }}</span>
        <el-button
          :icon="Delete"
          circle

          class="chip-del"
          @click="removeAt(idx)"
        />
      </div>
    </div>

    <el-dialog
      v-model="visible"
      :title="`选择${label}`"
      width="860px"
      :close-on-click-modal="false"
      append-to-body
    >
      <RelationArticlePicker
        v-model="dialogValue"
        :relation-config="relationConfig"
      />
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import RelationArticlePicker from './RelationArticlePicker.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  fieldConfig: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

const list = ref((props.modelValue || []).map((i) => ({ ...i })))
watch(
  () => props.modelValue,
  (val) => {
    list.value = (val || []).map((i) => ({ ...i }))
  },
  { deep: true }
)

const label = computed(() => props.fieldConfig?.relationLabel || '关联文章')
const maxCount = computed(() => Number(props.fieldConfig?.relationMaxCount) || 5)
const relationConfig = computed(() => props.fieldConfig || {})

const visible = ref(false)
const dialogValue = ref([])

const openPicker = () => {
  dialogValue.value = list.value.map((i) => ({ ...i }))
  visible.value = true
}

const confirm = () => {
  list.value = dialogValue.value.map((i) => ({ ...i }))
  emit('update:modelValue', list.value)
  visible.value = false
}

const removeAt = (idx) => {
  list.value.splice(idx, 1)
  emit('update:modelValue', list.value)
}
</script>

<style scoped>
.relation-editor {
  width: 100%;
}
.relation-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.relation-count {
  font-size: 13px;
  color: #909399;
}
.empty-tip {
  padding: 16px;
  border: 1px dashed #f6f6f6;
  border-radius: 6px;
  background: #fafafa;
  color: #c0c4cc;
  font-size: 13px;
  text-align: center;
}
.relation-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.relation-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 10px;
  background: #f4f6f9;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  font-size: 13px;
  color: #303133;
}
.chip-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  flex-shrink: 0;
}
.chip-title {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip-cat {
  font-size: 11px;
  color: #909399;
  background: #eef0f3;
  padding: 1px 6px;
  border-radius: 8px;
}
.chip-del {
  margin-left: 2px;
}
</style>

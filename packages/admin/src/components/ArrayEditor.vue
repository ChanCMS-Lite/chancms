<template>
  <div class="array-editor">
    <!--
      array 与 group 类型共用本组件。
      - maxCount<=1 时不显示"添加"按钮（固定 1 项不允许增减）
      - minCount>=1 时不显示"删除"按钮（array 默认 0 可删空；group 固定 1 不能删）
      - headerKey 传过来时按钮外置到 DynamicForm 的 group_name 标题栏右侧
    -->

    <div v-if="items.length > 0" class="array-list" :style="listStyle">
      <div
        v-for="(element, index) in items"
        :key="index"
        class="array-row"
        :class="{ 'is-media-row': isMediaRow }"
      >
        <!-- 序号标识：从 1 开始 -->
        <span class="array-index">{{ index + 1 }}</span>

        <!--
          group 固定 1 条（maxCount=1）时不显示删除按钮；
          array 默认 minCount=0 可删空
        -->
        <el-button
          v-if="minCount < 1"
          class="row-delete-btn"
          type="danger"
          link
          :icon="Delete"
          @click="removeItem(index)"
        />

        <!--
          子字段按 cols 配置网格排列：
          - cols=1 时垂直堆叠（兼容旧版）
          - cols>=2 时用 CSS grid，一行多列
        -->
        <div class="array-row-fields">
          <div
            v-for="field in subFields"
            :key="field.field_name"
            class="array-cell"
          >
            <div class="cell-caption">{{ field.field_label }}</div>
            <div class="cell-control">
            <!-- 文本 -->
            <el-input
              v-if="field.type === 'text'"
              v-model="element[field.field_name]"
              :placeholder="`请输入${field.field_label}`"
            />

            <!-- 数字 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="element[field.field_name]"
              style="width: 100%"
              :controls="false"
            />

            <!-- 图片 -->
            <ImageUploader
              v-else-if="field.type === 'image'"
              v-model="element[field.field_name]"
              :max-count="1"
              :field-config="field.field_config || {}"
            />

            <!-- 文件 -->
            <FileUploader
              v-else-if="field.type === 'file'"
              v-model="element[field.field_name]"
              :max-count="1"
              :field-config="field.field_config || {}"
            />

            <!-- 选择 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="element[field.field_name]"
              :placeholder="`请选择${field.field_label}`"
              style="width: 100%"

            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- 多行文本 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="element[field.field_name]"
              type="textarea"
              :rows="2"
              :placeholder="`请输入${field.field_label}`"

            />

            <!-- 富文本（每行独立编辑器实例） -->
            <Vue3Tinymce
              v-else-if="field.type === 'richtext'"
              v-model="element[field.field_name]"
              :setting="tinymceSet"
              script-src="/public/admin/tinymce/tinymce.min.js"
              :key="`rt-${index}-${field.field_name}`"
            />

            <!-- Markdown -->
            <md-editor
              v-else-if="field.type === 'markdown'"
              v-model="element[field.field_name]"
            />

            <!-- 关联内容：与 DynamicForm 同款 RelationEditor -->
            <RelationEditor
              v-else-if="field.type === 'relation'"
              v-model="element[field.field_name]"
              :field-config="field.field_config || {}"
            />

            <!-- 默认文本 -->
            <el-input
              v-else
              v-model="element[field.field_name]"
              :placeholder="`请输入${field.field_label}`"

            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-tip">
    <el-empty :description="`暂无${itemName}，请点击下方按钮添加`" :image-size="80" />
  </div>

  <!-- 添加按钮固定在数组末尾，避免每次添加都要滚动回顶部 -->
    <div v-if="!headerKey && maxCount > 1" class="array-footer">
      <el-button
        type="primary"
        :disabled="items.length >= maxCount"
        @click="addItem"
      >
        <el-icon><Plus /></el-icon>
        {{ items.length >= maxCount ? '已达上限' : `添加${itemName}` }}
      </el-button>
      <span class="array-count">
        <template v-if="items.length >= maxCount">
          已达上限 {{ maxCount }} 条，不可继续添加
        </template>
        <template v-else>
          共 {{ items.length }} 条，最多 {{ maxCount }} 条
        </template>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted, inject } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ImageUploader from './ImageUploader.vue';
import FileUploader from './FileUploader.vue';
import RelationEditor from './RelationEditor.vue';
import Vue3Tinymce from './Vue3Tinymce/src/Main.vue';
import MdEditor from './MdEditor/index.vue';
import { tinymceSet } from '@/config/tinymce.js';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  fieldConfig: {
    type: Object,
    default: () => ({
      items: [],
      maxCount: 50
    })
  },
  // 外置到 DynamicForm 的 group_name 标题栏右侧时使用的注册 key
  // 不传则保持内联 header（兼容非 DynamicForm 直接使用场景）
  headerKey: {
    type: String,
    default: ''
  },
  // 最少保留条数：group 类型传 1（固定一组，删除按钮不渲染），
  // array 类型默认 0（允许删空）
  minCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);

const subFields = computed(() => props.fieldConfig?.items || []);
const maxCount = computed(() => props.fieldConfig?.maxCount || 50);
const itemName = computed(() => props.fieldConfig?.itemName || '项');
// 网格总列数（画布宽度）：后台编辑时一行最多放几列
const cols = computed(() => {
  const c = Number(props.fieldConfig?.cols) || 1;
  return Math.max(1, Math.min(6, c));
});

// 单项是否为「单图/单文件」紧凑模式（配合 cols>1 让控件铺满格子）
const isMediaRow = computed(() => {
  const f = subFields.value;
  if (f.length !== 1) return false;
  const t = f[0].type;
  return t === 'image' || t === 'file';
});

// 数组项布局：cols=1 用 flex 垂直堆叠；cols>1 时用 CSS grid，一行多列
const listStyle = computed(() => {
  if (cols.value <= 1) {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%'
    };
  }
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
    gap: '12px',
    width: '100%'
  };
});

const items = ref([]);

// 防循环更新的版本号
let syncVersion = 0;
// 🔴 回声指纹（根因修复 2026-08-21）：记录最后一次 emit 的 JSON。
// 本组件 emit → DynamicForm.formData 更新 → 本组件 watch(modelValue) 又收到同一份数据。
// 若不识别回声：initData 重建 items → watch(items) 再次 emit（新数组）→ formData 再变 → 无限回声循环，
// 每 ~50ms 一轮，导致 DynamicForm 的 150ms 防抖 emit 永远被重置、永不触发 → 父组件 ext_data 永不更新 → 保存丢失。
let lastEmittedJson = null;

const emitOutput = (out) => {
  lastEmittedJson = JSON.stringify(out);
  emit('update:modelValue', out);
};

// 1) 有已保存数据 → 原样渲染
// 2) 空数组 + 模型已配 subFields → 默认 1 行空模板 + 立即 emit
// 3) 空数组 + 模型未配 subFields → 维持"暂无"提示
const initData = (seedFromConfig = false) => {
  if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    items.value = props.modelValue.map(item => {
      const { colSpan, rowSpan, ...rest } = item;
      return rest;
    });
    return false;
  }

  if (seedFromConfig && subFields.value.length > 0) {
    items.value = [createEmptyItem()];
    syncVersion++;
    nextTick(() => emitOutput(buildOutput()));
    return true;
  }

  items.value = [];
  return false;
};

watch(() => props.modelValue, (val) => {
  // 收到的 modelValue 与上次自身 emit 完全一致 → 是本组件自己的回声，跳过重同步（打破循环）
  if (lastEmittedJson != null && Array.isArray(val)) {
    try {
      if (JSON.stringify(val) === lastEmittedJson) return;
    } catch { /* 序列化失败不拦截，走正常同步 */ }
  }
  syncVersion++;
  initData(false);
}, { deep: true });

const addItem = () => {
  if (items.value.length >= maxCount.value) {
    ElMessage.warning(`最多只能添加 ${maxCount.value} 条数据`);
    return;
  }
  items.value.push({ ...createEmptyItem() });
  updateValue();
};

const createEmptyItem = () => {
  const item = {};
  subFields.value.forEach(field => {
    switch (field.type) {
      case 'number':
        item[field.field_name] = 0;
        break;
      case 'select':
        item[field.field_name] = '';
        break;
      case 'image':
      case 'file':
        item[field.field_name] = '';
        break;
      default:
        item[field.field_name] = '';
    }
  });
  return item;
};

// TDZ 警告：必须放在 createEmptyItem / buildOutput 等定义之后
initData(true);

const removeItem = (index) => {
  items.value.splice(index, 1);
  updateValue();
};

const buildOutput = () => {
  return items.value.map(item => {
    const result = {};
    subFields.value.forEach(field => {
      result[field.field_name] = item[field.field_name];
    });
    return result;
  });
};

const updateValue = () => {
  emitOutput(buildOutput());
};

watch(items, () => {
  const emitVersion = syncVersion;
  setTimeout(() => {
    if (syncVersion === emitVersion) {
      updateValue();
    }
  }, 50);
}, { deep: true });

// 外置 header 模式：把"添加 / 数量 / 上限 / 名称"注册给 DynamicForm
// 用 provide/inject 的 registry，避免 Teleport 跨组件锚点丢失
const arrayHeaderRegistry = inject('arrayHeaderRegistry', null);

onMounted(() => {
  if (props.headerKey && arrayHeaderRegistry) {
    arrayHeaderRegistry.register(props.headerKey, {
      add: addItem,
      getCount: () => items.value.length,
      getMax: () => maxCount.value,
      getName: () => itemName.value
    });
  }
});

onUnmounted(() => {
  if (props.headerKey && arrayHeaderRegistry) {
    arrayHeaderRegistry.unregister(props.headerKey);
  }
});
</script>

<style scoped>
.array-editor {
  width: 100%;
}

.array-count {
  color: #909399;
  font-size: 13px;
}

.array-list {
  width: 100%;
  /* cols=1 时 flex 垂直堆叠；cols>1 时由 inline :style 切换为 grid */
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 每条记录：卡片式布局，顶部预留序号和删除按钮空间 */
.array-row {
  position: relative;
  padding: 32px 16px 16px;
  background: #fafafa;
  border-radius: 6px;
  transition: box-shadow 0.15s;
}

/* 序号标识：左上角，从 1 开始 */
.array-index {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 32px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px 0 6px 0;
  z-index: 2;
}

/* 删除按钮：绝对定位卡片右上角，仅图标，灰色圆形背景 */
.row-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 28px;
  height: 28px;
  padding: 0;
  background: #f2f2f2;
  border-radius: 50%;
}

/* 单图/单文件紧凑模式：隐藏标签、收紧内边距，控件更易铺满格子 */
.array-row.is-media-row {
  padding: 10px;
}
.array-row.is-media-row .array-row-fields {
  height: 100%;
}
.array-row.is-media-row .cell-caption {
  display: none;
}
.array-row.is-media-row :deep(.image-uploader),
.array-row.is-media-row :deep(.file-uploader) {
  height: 100%;
}

/* 子字段容器：默认 flex 垂直堆叠 */
.array-row-fields {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/*
  子项行：标签在上、控件在下（类似 el-form label-position="top"）
  更适合 richtext/textarea 等高控件
*/
.array-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cell-caption {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.cell-control {
  width: 100%;
  min-width: 0;
}

.empty-tip {
  padding: 16px;
  border: 1px dashed #f6f6f6;
  border-radius: 6px;
  background: #fafafa;
}

/* 添加按钮固定在数组末尾，避免反复滚动 */
.array-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
</style>

<template>
  <div class="table-editor">
    <!-- 第一行：输入框 + 新增 + 保存模板 | 导入按钮 -->
    <div class="te-toolbar">
      <div class="te-add-row">
        <el-input
          v-model="newHeaderName"
          placeholder="输入列名后点新增"
          @keyup.enter="addHeader"
        />
        <el-button type="primary" @click="addHeader">新增</el-button>
        <el-button @click="openSaveTemplate">保存模板</el-button>
      </div>
      <div class="te-import-group">
        <el-button @click="openImportJson">JSON 导入</el-button>
        <el-button @click="openTemplates">从模板导入</el-button>
      </div>
    </div>

    <!-- 数据表格：固定总宽度，超出横向滚动；表头内直接编辑 -->
    <div class="te-table-wrap" v-if="headers.length">
      <el-table
        :data="rows"
        border
        :fit="false"
        scrollbar-always-on
        :empty-text="emptyText"
        class="te-table"
        style="width: 100%"
      >
        <el-table-column
          v-for="(h, hi) in headers"
          :key="h.key"
          :prop="h.key"
          :min-width="colWidth"
          :fixed="hi === 0 ? 'left' : false"
        >
          <template #header>
            <div class="te-th">
              <el-input
                v-model="h.label"

                placeholder="列名"
                class="te-th-input"
              />
              <div class="te-th-ops">
                <span
                  class="te-th-btn"
                  :class="{ disabled: hi === 0 }"
                  title="左移"
                  @click="hi !== 0 && moveHeader(hi, -1)"
                >
                  <el-icon><ArrowLeft /></el-icon>
                </span>
                <span
                  class="te-th-btn"
                  :class="{ disabled: hi === headers.length - 1 }"
                  title="右移"
                  @click="hi !== headers.length - 1 && moveHeader(hi, 1)"
                >
                  <el-icon><ArrowRight /></el-icon>
                </span>
                <span
                  class="te-th-btn te-th-btn-del"
                  title="删除该列"
                  @click="removeHeader(hi)"
                >
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
            </div>
          </template>
          <template #default="{ row }">
            <el-input v-model="row[h.key]"  />
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" :width="opColWidth" align="center">
          <template #default="{ $index }">
            <el-button link type="danger"  @click="removeRow($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-else description="在上方输入列名后点「新增」" :image-size="56" />

    <!-- 底部 -->
    <div class="te-footer">
      <el-button  type="primary" :disabled="!headers.length" @click="addRow">
        添加一行
      </el-button>
    </div>

    <!-- JSON 导入弹窗 -->
    <el-dialog v-model="showImportJson" title="JSON 导入" width="560px">
      <el-input
        v-model="jsonText"
        type="textarea"
        :rows="10"
        placeholder='支持三种格式：{ "headers":[...], "rows":[...] } / 二维数组 / 对象数组'
      />
      <p v-if="jsonError" class="te-err">{{ jsonError }}</p>
      <template #footer>
        <el-button @click="showImportJson = false">取消</el-button>
        <el-button type="primary" @click="applyJson">导入</el-button>
      </template>
    </el-dialog>

    <!-- 模板选择弹窗 -->
    <el-dialog v-model="showTemplates" title="从模板导入" width="560px">
      <div v-loading="tplLoading">
        <div v-if="templates.length" class="te-tpl-list">
          <div
            v-for="t in templates"
            :key="t.id"
            class="te-tpl-item"
            :class="{ active: selectedTplId === t.id }"
            @click="selectedTplId = t.id"
          >
            <el-radio v-model="selectedTplId" :value="t.id" @click.stop>
              <span></span>
            </el-radio>
            <div class="te-tpl-info">
              <div class="te-tpl-name">{{ t.config_key }}</div>
              <div v-if="tplMeta(t)" class="te-tpl-meta">
                {{ tplMeta(t).cols }} 列 · {{ tplMeta(t).rows }} 行
              </div>
            </div>
            <div class="te-tpl-ops">
              <span
                class="te-tpl-del"
                title="删除该模板"
                @click.stop="deleteTemplate(t)"
              >
                <el-icon><Delete /></el-icon>
              </span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无模板，先在编辑器中保存一个吧" :image-size="56" />
      </div>
      <template #footer>
        <el-button @click="showTemplates = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedTplId" @click="applySelectedTemplate">
          导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 保存模板弹窗 -->
    <el-dialog v-model="showSaveTpl" title="保存为模板" width="420px">
      <el-form label-width="84px">
        <el-form-item label="模板名称" required>
          <el-input v-model="tplName" placeholder="如：xxx规格表" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveTpl = false">取消</el-button>
        <el-button type="primary" :disabled="!tplName.trim()" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft, ArrowRight, Delete } from "@element-plus/icons-vue";
import * as tplApi from "@/api/template.js";

const props = defineProps({
  modelValue: {
    type: [Object, Array],
    default: () => ({}),
  },
  fieldConfig: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const headers = ref([]);
const rows = ref([]);
const newHeaderName = ref("");

// 防循环：外部 modelValue 回填 / 内部编辑发往上，互斥通过 syncing 标志位
let syncing = false;
let headerSeq = 0;

const colWidth = 240;
const opColWidth = 80;

const emptyText = computed(() =>
  headers.value.length ? "暂无数据，点击下方「添加一行」" : "请先添加表头"
);

function withSync(fn) {
  // 仅用于 syncFromModel（父级 modelValue 回填）：期间禁止 emit，避免回环。
  // watch([headers,rows]) 在 microtask 触发，此时 syncing 仍为 true，emitChange 被丢弃，
  // nextTick 复位后若无新变更也不会再触发——这正是防环所需，绝不能在此强制 emit。
  syncing = true;
  fn();
  nextTick(() => {
    syncing = false;
  });
}

// 把任意值归一为 { headers:[{key,label}], rows:[{key:val}] }
function normalizeTable(val) {
  if (!val) return null;
  // 标准结构
  if (Array.isArray(val.headers) && Array.isArray(val.rows)) {
    const headers = val.headers.map((h, i) => ({
      key: h && h.key ? h.key : "c" + (i + 1),
      label: h && h.label != null ? h.label : "",
    }));
    const rows = val.rows.map((r) => ({ ...r }));
    return { headers, rows };
  }
  // 二维数组：首行当表头
  if (Array.isArray(val) && val.length && Array.isArray(val[0])) {
    const head = val[0];
    const headers = head.map((label, i) => ({ key: "c" + (i + 1), label: String(label) }));
    const rows = val.slice(1).map((arr) => {
      const row = {};
      headers.forEach((h, i) => {
        row[h.key] = arr && arr[i] != null ? arr[i] : "";
      });
      return row;
    });
    return { headers, rows };
  }
  // 对象数组：key 当表头
  if (Array.isArray(val) && val.length && typeof val[0] === "object") {
    const keys = Object.keys(val[0]);
    const headers = keys.map((k) => ({ key: k, label: k }));
    const rows = val.map((o) => {
      const row = {};
      headers.forEach((h) => {
        row[h.key] = o && o[h.key] != null ? o[h.key] : "";
      });
      return row;
    });
    return { headers, rows };
  }
  return null;
}

function syncFromModel(val) {
  withSync(() => {
    const norm = normalizeTable(val);
    if (!norm) {
      // 老数组兜底：尝试从首行推导表头
      if (Array.isArray(val) && val.length && typeof val[0] === "object") {
        const keys = Object.keys(val[0]);
        headers.value = keys.map((k) => ({ key: k, label: k }));
        rows.value = val.map((r) => ({ ...r }));
        headerSeq = keys.length;
      } else {
        headers.value = [];
        rows.value = [];
      }
      return;
    }
    headers.value = norm.headers;
    rows.value = norm.rows;
    headerSeq = norm.headers.length;
  });
}

function emitChange() {
  if (syncing) return;
  emit("update:modelValue", {
    headers: headers.value.map((h) => ({ ...h })),
    rows: rows.value.map((r) => ({ ...r })),
  });
}

watch(() => props.modelValue, (v) => syncFromModel(v), { immediate: true, deep: true });
watch([headers, rows], () => emitChange(), { deep: true });

// ===== 表头操作 =====
function addHeader() {
  const name = newHeaderName.value.trim();
  if (!name) {
    ElMessage.warning("请输入列名");
    return;
  }
  headerSeq++;
  headers.value.push({ key: "c" + headerSeq, label: name });
  newHeaderName.value = "";
}
function removeHeader(i) {
  const key = headers.value[i].key;
  headers.value.splice(i, 1);
  rows.value.forEach((r) => {
    delete r[key];
  });
}
function moveHeader(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= headers.value.length) return;
  const tmp = headers.value[i];
  headers.value[i] = headers.value[j];
  headers.value[j] = tmp;
}

// ===== 行操作 =====
function addRow() {
  const row = {};
  headers.value.forEach((h) => {
    row[h.key] = "";
  });
  rows.value.push(row);
}
function removeRow(i) {
  rows.value.splice(i, 1);
}

// ===== JSON 导入 =====
const showImportJson = ref(false);
const jsonText = ref("");
const jsonError = ref("");

function openImportJson() {
  jsonText.value = "";
  jsonError.value = "";
  showImportJson.value = true;
}
function applyJson() {
  if (!jsonText.value.trim()) {
    jsonError.value = "请输入 JSON";
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonText.value);
  } catch (e) {
    jsonError.value = "JSON 解析失败：" + e.message;
    return;
  }
  const norm = normalizeTable(parsed);
  if (!norm) {
    jsonError.value = "无法识别的表格结构，请参考占位符说明";
    return;
  }
  // 用户主动导入：直接赋给 headers/rows，让下方 watch 触发 emitChange 上报父级。
  // 不能用 withSync（会因 syncing 挡掉 emit，导致导入数据不进入父级 formData）。
  headers.value = norm.headers;
  rows.value = norm.rows;
  headerSeq = norm.headers.length;
  jsonError.value = "";
  showImportJson.value = false;
  ElMessage.success("导入成功");
}

// ===== 模板 =====
const showTemplates = ref(false);
const templates = ref([]);
const tplLoading = ref(false);
const selectedTplId = ref(null);

async function openTemplates() {
  selectedTplId.value = null;
  showTemplates.value = true;
  tplLoading.value = true;
  try {
    const res = await tplApi.list();
    if (res.code === 0) {
      templates.value = res.data?.list || [];
    } else {
      ElMessage.error(res.msg || "获取模板失败");
    }
  } finally {
    tplLoading.value = false;
  }
}

function applySelectedTemplate() {
  const t = templates.value.find((x) => x.id === selectedTplId.value);
  if (t) applyTemplate(t);
}

function applyTemplate(t) {
  let val = t.config_value;
  if (typeof val === "string") {
    try {
      val = JSON.parse(val);
    } catch {
      ElMessage.error("模板解析失败");
      return;
    }
  }
  const norm = normalizeTable(val);
  if (!norm) {
    ElMessage.error("模板格式不正确");
    return;
  }
  // 用户主动应用模板：直接赋给 headers/rows，让 watch 触发 emitChange 上报父级。
  // 不能用 withSync（同 applyJson，否则导入数据不进入父级 formData）。
  headers.value = norm.headers;
  rows.value = norm.rows;
  headerSeq = norm.headers.length;
  showTemplates.value = false;
  ElMessage.success("已应用模板：" + t.config_key);
}

// 解析模板元信息（列数/行数），用于卡片副行展示
function tplMeta(t) {
  try {
    const v = typeof t.config_value === "string" ? JSON.parse(t.config_value) : t.config_value;
    const cols = Array.isArray(v.headers) ? v.headers.length : 0;
    const rows = Array.isArray(v.rows) ? v.rows.length : 0;
    return cols || rows ? { cols, rows } : null;
  } catch {
    return null;
  }
}

async function deleteTemplate(t) {
  const res = await tplApi.remove({ id: t.id });
  if (res.code === 0) {
    templates.value = templates.value.filter((x) => x.id !== t.id);
    if (selectedTplId.value === t.id) selectedTplId.value = null;
    ElMessage.success("已删除");
  } else {
    ElMessage.error(res.msg || "删除失败");
  }
}

const showSaveTpl = ref(false);
const tplName = ref("");

function openSaveTemplate() {
  if (!headers.value.length) {
    ElMessage.warning("请先添加表头");
    return;
  }
  tplName.value = "";
  showSaveTpl.value = true;
}
async function saveTemplate() {
  if (!tplName.value.trim()) {
    ElMessage.warning("请输入模板名称");
    return;
  }
  const payload = JSON.stringify({
    headers: headers.value,
    rows: rows.value,
  });
  const res = await tplApi.create({
    config_key: tplName.value.trim(),
    config_value: payload,
  });
  if (res.code === 0) {
    showSaveTpl.value = false;
    ElMessage.success("模板已保存");
  } else {
    ElMessage.error(res.msg || "保存失败");
  }
}
</script>

<style scoped>
.table-editor {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
}
.te-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.te-add-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.te-add-row :deep(.el-input) {
  width: 200px;
}
.te-import-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.te-table-wrap {
  width: 100%;
  max-width: calc(100vw - 340px);
  overflow-x: auto;
  margin-bottom: 12px;
}
.te-table {
  flex-shrink: 0;
}
.te-table :deep(.el-table__header-wrapper th.el-table__cell) {
  padding: 6px 8px;
  vertical-align: middle;
}
.te-table :deep(.el-table__cell) {
  padding: 6px;
}
.te-table :deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px;
}
.te-table :deep(.el-scrollbar__bar.is-horizontal .el-scrollbar__thumb) {
  background-color: #909399;
  border-radius: 3px;
}
.te-th {
  display: flex;
  align-items: center;
  gap: 4px;
}
.te-th-input {
  flex: 1;
  min-width: 0;
}
.te-th-input :deep(.el-input__wrapper) {
  padding: 0 6px;
}
.te-th-ops {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.te-th-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: #f2f3f5;
  color: #606266;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.te-th-btn:hover:not(.disabled) {
  background-color: #e4e7ed;
  color: #409eff;
}
.te-th-btn.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background-color: #f5f7fa;
}
.te-th-btn-del:hover:not(.disabled) {
  background-color: #fde2e2;
  color: #f56c6c;
}
.te-th-btn .el-icon {
  font-size: 12px;
}
.te-footer {
  display: flex;
  gap: 8px;
}
.te-err {
  color: #f56c6c;
  font-size: 12px;
  margin: 8px 0 0;
}
.te-tpl-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow: auto;
  padding: 2px;
}
.te-tpl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}
.te-tpl-item:hover {
  border-color: #c6e2ff;
  background-color: #f7faff;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
}
.te-tpl-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}
.te-tpl-item :deep(.el-radio) {
  margin-right: 0;
  flex-shrink: 0;
}
.te-tpl-info {
  flex: 1;
  min-width: 0;
}
.te-tpl-name {
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.te-tpl-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
.te-tpl-ops {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.te-tpl-del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #909399;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.te-tpl-del:hover {
  background-color: #fde2e2;
  color: #f56c6c;
}
.te-tpl-del .el-icon {
  font-size: 14px;
}
</style>

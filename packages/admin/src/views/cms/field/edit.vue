<template>
  <div class="bg-fff pd-20 radius-6 edit-page">
    <div class="edit-content">
      <el-form
        ref="formRef"
        :model="params"
        label-position="top"
        label-width="84px"
        class="mt-20 field-edit-form"
      >
      <!-- 基本信息组 -->
      <div class="form-group mb-20">
        <h3 class="mb-15 f-16" style="border-bottom: 1px solid #eee; padding-bottom: 10px;">基本信息</h3>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="字段标签" prop="field_label" :rules="fieldLabelRules">
              <el-input v-model="params.field_label" placeholder="请输入字段中文标签，如：文件名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="字段名称" prop="field_name" :rules="fieldNameRules">
              <el-input v-model="params.field_name" placeholder="请输入英文小驼峰，如：fileName"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="字段类型" prop="type" :rules="typeRules">
              <el-select v-model="params.type" placeholder="请选择字段类型" style="width: 100%">
            <!-- ChanCMS Lite：字段类型仅保留「文本」与「图片」；后端 service/Field.js _liteGuard 同步硬校验 -->
            <el-option label="文本" value="text" />
            <el-option label="图片" value="image" />
          </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="字段分组">
              <el-input v-model="params.group_name" placeholder="如：基本信息、SEO设置、扩展信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="排序">
          <el-input-number v-model="params.sort_order" :min="0" :max="999" />
        </el-form-item>
      </div>

      <!-- 字段配置组 -->
      <div class="form-group mb-20">
        <h3 class="mb-15 f-16" style="border-bottom: 1px solid #eee; padding-bottom: 10px;">字段配置</h3>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否必填">
              <el-switch v-model="params.is_required" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否可搜索">
              <el-switch v-model="params.is_searchable" />
              <p class="f-12 c-999 mt-5">开启后可在文章列表中搜索该字段</p>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="列表显示">
              <el-switch v-model="params.is_listable" />
              <p class="f-12 c-999 mt-5">是否在文章列表中显示该字段</p>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否可排序">
              <el-switch v-model="params.is_sortable" />
              <p class="f-12 c-999 mt-5">是否支持按该字段排序</p>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 通用配置 -->
        <el-form-item label="占位符">
          <el-input v-model="params.field_config.placeholder" placeholder="请输入提示文字"></el-input>
        </el-form-item>

        <!-- 文本类型配置 -->
        <template v-if="['text', 'textarea'].includes(params.type)">
          <el-form-item label="最大长度">
            <el-input-number v-model="params.field_config.maxLength" :min="0" :max="10000" />
          </el-form-item>
        </template>

        <!-- 数字类型配置 -->
        <template v-if="params.type === 'number'">
          <el-form-item label="最小值">
            <el-input-number v-model="params.field_config.min" />
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number v-model="params.field_config.max" />
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="params.field_config.step" :min="0.01" :precision="2" />
          </el-form-item>
        </template>

        <!-- 选择类型配置 -->
        <template v-if="['select', 'radio', 'checkbox'].includes(params.type)">
          <el-form-item label="选项配置">
            <div v-for="(option, index) in params.field_config.options" :key="index" class="mb-10">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input v-model="option.label" placeholder="选项标签" />
                </el-col>
                <el-col :span="6">
                  <el-input v-model="option.value" placeholder="选项值" />
                </el-col>
                <el-col :span="4">
                  <el-button @click="removeOption(index)" :icon="Delete" circle />
                </el-col>
              </el-row>
            </div>
            <el-button @click="addOption" type="primary" plain>添加选项</el-button>
          </el-form-item>
        </template>

        <!-- 图片组配置 -->
        <template v-if="params.type === 'images'">
          <el-form-item label="最大数量">
            <el-input-number v-model="params.field_config.maxCount" :min="1" :max="20" />
          </el-form-item>
          <el-form-item label="是否显示描述">
            <el-switch v-model="params.field_config.showDescription" />
          </el-form-item>
        </template>

        <!-- 文件组配置 -->
        <template v-if="params.type === 'files'">
          <el-form-item label="最大数量">
            <el-input-number v-model="params.field_config.maxCount" :min="1" :max="20" />
          </el-form-item>
          <el-form-item label="文件类型限制">
            <el-input v-model="params.field_config.accept" placeholder="如：.zip,.rar,.pdf" />
          </el-form-item>
        </template>

        <!-- 数组类型配置（子字段定义：内联展开，不再使用弹窗） -->
        <template v-if="params.type === 'array'">
          <el-form-item label="子字段定义">
            <!-- el-form-item 的 .el-form-item__content 默认 display:flex → 子元素被当 flex item 横排。
                 这里用一个块级 wrapper 强制让内部全部垂直堆叠。 -->
            <div class="subfields-wrapper">
              <div class="subfields-tip mb-10">
                点「添加子字段」按钮新增一行；新行默认类型为「文本」，可直接在行的「字段类型」下拉切换。KEY 行始终可自由编辑，建模型必填、组内不可重复。
              </div>

              <div
                v-if="!params.field_config.items || params.field_config.items.length === 0"
                class="subfields-empty mb-10"
              >
                暂未配置子字段
              </div>

              <div
                v-for="(item, index) in params.field_config.items"
                :key="`subf-${index}`"
                class="subfield-item mb-10"
              >
                <div class="subfield-row">
                  <span class="item-caption">KEY</span>
                  <div class="item-control">
                    <el-input
                      v-model="item.field_name"

                      placeholder="英文 key，建模型必填、不可重复"
                    />
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">字段标签</span>
                  <div class="item-control">
                    <el-input v-model="item.field_label" placeholder="如：参数名" />
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">字段类型</span>
                  <div class="item-control">
                    <el-select v-model="item.type" placeholder="请选择" style="width: 100%">
                      <el-option
                        v-for="tpl in arrayFieldTemplates"
                        :key="tpl.type"
                        :label="tpl.label"
                        :value="tpl.type"
                      />
                    </el-select>
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">操作</span>
                  <div class="item-actions">
                    <el-button
                      type="danger"
                      plain
                      size="small"
                      :icon="Delete"
                      @click="removeArrayItem(index)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="subfields-actions">
                <el-button
                  type="primary"
                  :icon="Plus"
                  @click="addArrayItem()"
                >
                  添加子字段
                </el-button>
              </div>
            </div>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大数量">
                <el-input-number v-model="params.field_config.maxCount" :min="1" :max="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="网格总列数">
                <el-input-number v-model="params.field_config.cols" :min="1" :max="6" />
                <p class="f-12 c-999 mt-5">后台编辑画布的总列数（画布宽度），如 4=一行最多放 4 项</p>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 组合字段类型配置（与 array 共用 items 但不允许运行时增减，无 maxCount） -->
        <template v-if="params.type === 'group'">
          <el-form-item label="子字段定义">
            <div class="subfields-wrapper">
              <div class="subfields-tip mb-10">
                点「添加子字段」按钮新增一行；新行默认类型为「文本」，可直接在行的「字段类型」下拉切换。每个子字段都会在文章编辑页自动渲染为独立控件用于填值，不允许运行时增减。
              </div>

              <div
                v-if="!params.field_config.items || params.field_config.items.length === 0"
                class="subfields-empty mb-10"
              >
                暂未配置子字段
              </div>

              <div
                v-for="(item, index) in params.field_config.items"
                :key="`subf-${index}`"
                class="subfield-item mb-10"
              >
                <div class="subfield-row">
                  <span class="item-caption">KEY</span>
                  <div class="item-control">
                    <el-input
                      v-model="item.field_name"

                      placeholder="英文 key，建模型必填、不可重复"
                    />
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">字段标签</span>
                  <div class="item-control">
                    <el-input v-model="item.field_label" placeholder="如：参数名" />
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">字段类型</span>
                  <div class="item-control">
                    <el-select v-model="item.type" placeholder="请选择" style="width: 100%">
                      <el-option
                        v-for="tpl in arrayFieldTemplates"
                        :key="tpl.type"
                        :label="tpl.label"
                        :value="tpl.type"
                      />
                    </el-select>
                  </div>
                </div>
                <div class="subfield-row">
                  <span class="item-caption">操作</span>
                  <div class="item-actions">
                    <el-button
                      type="danger"
                      plain
                      size="small"
                      :icon="Delete"
                      @click="removeArrayItem(index)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="subfields-actions">
                <el-button
                  type="primary"
                  :icon="Plus"
                  @click="addArrayItem()"
                >
                  添加子字段
                </el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="网格总列数">
            <el-input-number v-model="params.field_config.cols" :min="1" :max="6" />
            <p class="f-12 c-999 mt-5">后台编辑画布的总列数（画布宽度），如 4=一行最多放 4 项</p>
          </el-form-item>
        </template>

        <!-- 代码编辑器类型配置 -->
        <template v-if="params.type === 'code'">
          <el-form-item label="代码语言">
            <el-select v-model="params.field_config.language" placeholder="请选择代码语言" style="width: 100%">
              <el-option label="JSON" value="json" />
              <el-option label="HTML" value="html" />
              <el-option label="CSS" value="css" />
              <el-option label="JavaScript" value="javascript" />
            </el-select>
            <p class="f-12 c-999 mt-5">文章编辑页将以对应语法高亮展示代码编辑器</p>
          </el-form-item>
        </template>

        <!-- 关联内容类型配置 -->
        <template v-if="params.type === 'relation'">
          <el-form-item label="显示名称" prop="field_config.relationLabel">
            <el-input
              v-model="params.field_config.relationLabel"
              placeholder="如：相关产品 / 合作案例 / 文章推荐"
            />
            <p class="f-12 c-999 mt-5">在内容编辑页显示的板块名称</p>
          </el-form-item>
          <el-form-item label="最多关联">
            <el-input-number v-model="params.field_config.relationMaxCount" :min="1" :max="50" />
            <span class="ml-10 f-12 c-999">篇</span>
          </el-form-item>
        </template>

        <!-- 默认值 -->
        <el-form-item label="默认值">
          <el-input v-model="params.field_config.defaultVal" placeholder="字段的默认值"></el-input>
        </el-form-item>
      </div>

    </el-form>
    </div>
    <div class="edit-footer">
      <el-button size="large" type="primary" @click="handleSubmit" v-permission="['cms:field:create', 'cms:field:update']">保存</el-button>
      <el-button size="large" @click="handleCancel">取消</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Delete, Plus } from '@element-plus/icons-vue';
import { create, update, detail } from '@/api/field.js';
import { parseJsonText } from '@/utils/tool.js';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.query.fid);

const formRef = ref(null);

const params = reactive({
  id: '',
  mid: '',
  field_label: '',
  field_name: '',
  type: 'text',
  field_config: {
    placeholder: '',
    maxLength: 250,
    min: undefined,
    max: undefined,
    step: 1,
    options: [],
    defaultVal: '',
    maxCount: 10,
    showDescription: true,
    accept: '',
    items: [],
    relationLabel: '',
    relationMaxCount: 5,
    cols: 1
  },
  is_required: false,
  is_searchable: false,
  is_listable: true,
  is_sortable: false,
  sort_order: 0,
  group_name: '基本信息'
});

const fieldLabelRules = [{ required: true, message: '请输入字段标签', trigger: 'blur' }];
const fieldNameRules = [
  { required: true, message: '请输入字段名称', trigger: 'blur' },
  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '必须以字母开头，只能包含字母、数字和下划线', trigger: 'blur' }
];
const typeRules = [{ required: true, message: '请选择字段类型', trigger: 'change' }];

onMounted(() => {
  const { fid, mid } = route.query;
  params.id = fid || '';
  params.mid = mid || '';

  if (isEdit.value) {
    fetchDetail();
  }
});

watch(() => route.query.fid, async (newFid) => {
  if (newFid) {
    params.id = newFid;
    params.mid = route.query.mid;
    await fetchDetail();
  }
});

const fetchDetail = async () => {
  if (!params.id) return;

  try {
    const res = await detail(params.id);
    if (res.code === 0) {
      const data = res.data;

      // 赋值基本字段
      params.field_label = data.field_label;
      params.field_name = data.field_name;
      params.type = data.type;
      params.is_required = !!data.is_required;
      params.is_searchable = !!data.is_searchable;
      params.is_listable = !!data.is_listable;
      params.is_sortable = !!data.is_sortable;
      params.sort_order = data.sort_order || 0;
      params.group_name = data.group_name || '基本信息';

      // 解析 field_config
      // 🔴 局部兜底（2026-09-01）：库里脏配置不能再中断整页加载。
      // 旧写法直接 JSON.parse 无局部 try，异常冒泡到外层 catch → 只留一行 console
      // 并弹「获取字段详情失败」，其余字段全部拿不到，用户也不知道是哪个配置坏了。
      if (data.field_config) {
        if (typeof data.field_config === 'object') {
          params.field_config = {
            ...params.field_config,
            ...data.field_config
          };
        } else {
          const configRes = parseJsonText(data.field_config);
          if (configRes.ok) {
            params.field_config = {
              ...params.field_config,
              ...(configRes.value || {})
            };
          } else {
            ElMessage({
              message: `字段配置 field_config 不是合法 JSON，已跳过解析（其余字段正常加载）：${configRes.error}`,
              type: 'error',
              duration: 6000,
              showClose: true
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('获取字段详情失败:', error);
    ElMessage.error('获取字段详情失败');
  }
};

// 添加选项
const addOption = () => {
  if (!params.field_config.options) {
    params.field_config.options = [];
  }
  params.field_config.options.push({ label: '', value: '' });
};

// 删除选项
const removeOption = (index) => {
  params.field_config.options.splice(index, 1);
};

// 添加数组子字段
// 建模型自由定义 KEY：默认按类型提供一个，但用户可自由修改。
const arrayFieldTemplates = [
  { type: 'text',     key: 'label',       label: '文本',     defaultLabel: '参数名' },
  { type: 'number',   key: 'value',       label: '数字',     defaultLabel: '参数值' },
  { type: 'image',    key: 'image',       label: '图片',     defaultLabel: '图片' },
  { type: 'file',     key: 'file',        label: '文件',     defaultLabel: '文件' },
  { type: 'url',      key: 'url',         label: '链接',     defaultLabel: '链接地址' },
  { type: 'select',   key: 'option',      label: '选择',     defaultLabel: '选项' },
  { type: 'textarea', key: 'description', label: '多行文本', defaultLabel: '说明' },
  { type: 'richtext', key: 'description', label: '富文本',   defaultLabel: '描述' },
];

// 类型 → 模板
const findTemplate = (type) => arrayFieldTemplates.find((t) => t.type === type);

// 同名 KEY 自动追加 1/2/... 后缀
const uniqueKey = (base) => {
  const items = params.field_config.items || [];
  const taken = new Set(items.map((i) => i.field_name));
  if (!taken.has(base)) return base;
  let i = 1;
  while (taken.has(`${base}${i}`)) i++;
  return `${base}${i}`;
};

const addArrayItem = (type = 'text') => {
  if (!params.field_config.items) {
    params.field_config.items = [];
  }
  const tpl = findTemplate(type) || arrayFieldTemplates[0];
  // 同 base key 已存在时换名（防 label/value 重复）
  const baseKey = tpl.type === 'richtext' ? 'richText' : tpl.key;
  const resolvedKey = uniqueKey(baseKey);
  // 字段标签默认填 tpl 默认值；若已有同名标签则续号
  let labelCandidate = tpl.defaultLabel;
  let n = 1;
  while (params.field_config.items.some((it) => it.field_label === labelCandidate)) {
    n += 1;
    labelCandidate = `${tpl.defaultLabel}${n}`;
  }

  params.field_config.items.push({
    field_name: resolvedKey,
    field_label: labelCandidate,
    type: tpl.type,
  });
};

// 删除数组子字段
const removeArrayItem = (index) => {
  params.field_config.items.splice(index, 1);
};

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 准备提交数据
        const submitData = {
          ...params,
          field_config: JSON.parse(JSON.stringify(params.field_config))
        };

        // 移除空选项
        if (submitData.field_config.options) {
          submitData.field_config.options = submitData.field_config.options.filter(
            opt => opt.label && opt.value
          );
        }

        // 移除空的数组子字段
        if (submitData.field_config.items) {
          submitData.field_config.items = submitData.field_config.items.filter(
            item => item.field_name && item.field_label
          );
        }

        // 关联内容字段：显示名兜底为字段标签；上限兜底；清除无关的数组子字段残留
        if (submitData.type === 'relation') {
          submitData.field_config.relationLabel =
            (submitData.field_config.relationLabel || '').trim() || params.field_label;
          submitData.field_config.relationMaxCount =
            (submitData.field_config.relationMaxCount && submitData.field_config.relationMaxCount >= 1)
              ? submitData.field_config.relationMaxCount
              : 5;
          submitData.field_config.items = [];
        }

        // 组合字段：无最大数量限制、清除关联字段残留；items 必填至少一项
        if (submitData.type === 'group') {
          delete submitData.field_config.maxCount;
          delete submitData.field_config.rowHeight;
          submitData.field_config.relationLabel = '';
          submitData.field_config.relationMaxCount = 5;
          // items 至少要 1 项；无子字段时不允许提交
          const items = submitData.field_config.items || [];
          if (items.length === 0) {
            ElMessage.error('组合字段至少需要配置 1 个子字段');
            return;
          }
        }

        // 数组类型：清掉 group 才有的 relation 残留
        if (submitData.type === 'array') {
          delete submitData.field_config.rowHeight;
          submitData.field_config.relationLabel = '';
          submitData.field_config.relationMaxCount = 5;
        }

        // 动态表格类型：表头/列由每篇文章在编辑器中自定义，无需模型级 field_config，
        // 清掉 array/group 残留，避免冗余配置影响
        if (submitData.type === 'table') {
          submitData.field_config.items = [];
          submitData.field_config.relationLabel = '';
          submitData.field_config.relationMaxCount = 5;
          delete submitData.field_config.maxCount;
          delete submitData.field_config.rowHeight;
        }

        // 代码编辑器：language 兜底；清掉无关残留
        if (submitData.type === 'code') {
          submitData.field_config.language =
            ['json', 'html', 'css', 'javascript'].includes(submitData.field_config.language)
              ? submitData.field_config.language
              : 'json';
          submitData.field_config.items = [];
          submitData.field_config.maxCount = 10;
          submitData.field_config.relationLabel = '';
          submitData.field_config.relationMaxCount = 5;
        }

        let res;
        if (isEdit.value) {
          res = await update(submitData);
        } else {
          res = await create(submitData);
        }

        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
          handleCancel();
        } else {
          ElMessage.error(res.msg || '操作失败');
        }
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('操作失败');
      }
    }
  });
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.form-group {
  margin-bottom: 30px;
}

/* 统一表单行间距 */
.field-edit-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 子字段定义区域（数组 / 组合字段 通用） */
.subfields-wrapper {
  display: block;
  width: 100%;
}
.subfields-wrapper > * {
  display: block;
}

.subfields-tip {
  font-size: 13px;
  color: #909399;
  background: #f6f8fa;
  border-left: 3px solid #409eff;
  padding: 8px 12px;
  border-radius: 3px;
  margin-bottom: 12px;
}

/* 添加子字段按钮所在行：居左对齐、避免被 el-form-item 默认布局推到右侧 */
.subfields-actions {
  display: block;
  text-align: left;
  margin-bottom: 12px;
}
.subfields-actions :deep(.el-button) {
  display: inline-flex;
  align-items: center;
}

/* 1 个子字段 = 1 张卡片，卡片内部垂直堆叠 4 行。强制块级，避免被父级 .el-form-item__content 当 flex item 横排 */
.subfield-item {
  display: block !important;
  width: 100% !important;
  background-color: #fafafa;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  transition: border-color 0.2s, background-color 0.2s;
}
.subfield-item:hover {
  border-color: #c6dcfb;
  background-color: #f5f8ff;
}

/* 单行：caption(84px 与外层 label 对齐) + control(剩余宽度) */
.subfield-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 32px;
}
.subfield-row:last-child {
  margin-bottom: 0;
}
.subfield-row .item-caption {
  width: 84px;
  flex-shrink: 0;
  font-size: 14px;
  color: #606266;
}
.subfield-row .item-control {
  flex: 1;
  min-width: 0;
}

/* 操作行：只放删除按钮 */
.subfield-row .item-actions {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.subfields-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 18px 0;
  border: 1px dashed #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}
</style>

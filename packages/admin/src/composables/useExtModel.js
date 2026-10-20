/**
 * 通用扩展模型 composable
 *
 * 统一「选择模型 → 渲染 DynamicForm → 收集 ext_data」逻辑，供
 * slide / message / special / friendlink / category 等后台编辑页复用，
 * 与文章编辑页（article/edit.vue）的 DynamicForm 集成保持一致。
 *
 * 用法：
 *   const { modelOptions, field, extData, dynamicFormRef, selectedMid,
 *           loadModels, handleModelChange, buildExtData, initExtData } = useExtModel()
 *
 *   - 模板里放 <el-select v-model="selectedMid" @change="handleModelChange"> + <DynamicForm .../>
 *   - onMounted 调 loadModels()
 *   - 编辑详情拿到数据后：selectedMid.value = data.mid; initExtData(data.ext_data); handleModelChange(data.mid)
 *   - 提交时把 { mid: selectedMid.value, ext_data: buildExtData() } 并入 payload
 */
import { ref } from 'vue'
import { list as modelListApi } from '@/api/model.js'
import { findByMid } from '@/api/field.js'

// 把后端字段定义映射成 DynamicForm 需要的格式
const mapField = (item) => {
  const fieldName = item.field_name || item.ename
  const fieldLabel = item.field_label || item.cname
  let fieldConfig = item.field_config
  if (typeof fieldConfig === 'string') {
    try {
      fieldConfig = JSON.parse(fieldConfig)
    } catch {
      fieldConfig = {}
    }
  }
  return {
    ...item,
    field_name: fieldName,
    field_label: fieldLabel,
    field_config: fieldConfig && typeof fieldConfig === 'object' ? fieldConfig : {},
  }
}

const safeParse = (str) => {
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}

export function useExtModel(options = {}) {
  // Lite 裁剪：locked=true 表示「非文章页」，只允许不关联模型，
  // 不再拉取模型列表（下拉恒为「不关联模型」）。仅文章编辑页使用默认（非 locked）。
  const locked = !!options.locked;
  // 模型下拉选项（含「不关联模型」占位项，值为 0）
  const modelOptions = ref([])
  // DynamicForm 需要的字段定义
  const field = ref([])
  // DynamicForm 绑定的扩展字段值
  const extData = ref({})
  // DynamicForm 组件实例（用于取最新值 + 校验）
  const dynamicFormRef = ref(null)
  // 当前选中的模型 id
  const selectedMid = ref(null)

  // 加载模型列表（关联模型下拉：拉全部，不被默认 pageSize 截断）
  const loadModels = async () => {
    // Lite：非文章页锁死，只给「不关联模型」，不请求模型接口
    if (locked) {
      modelOptions.value = [{ label: '不关联模型', value: 0 }]
      return
    }
    try {
      const res = await modelListApi(1, 100)
      if (res.code === 0) {
        const rows = res.data?.list || res.data || []
        modelOptions.value = [
          { label: '不关联模型', value: 0 },
          ...rows.map((m) => ({ label: m.model || m.name || `模型${m.id}`, value: m.id })),
        ]
      }
    } catch (e) {
      console.error('[useExtModel] loadModels 失败:', e)
    }
  }

  // 选中模型后加载字段定义
  const handleModelChange = async (mid) => {
    selectedMid.value = mid
    if (!mid) {
      field.value = []
      return
    }
    try {
      const res = await findByMid(mid)
      if (res.code === 0) {
        field.value = (res.data?.fields || []).map(mapField)
      } else {
        field.value = []
      }
    } catch (e) {
      console.error('[useExtModel] findByMid 失败:', e)
      field.value = []
    }
  }

  // 编辑详情：把后端返回的 ext_data 初始化到表单（兼容字符串/对象）
  const initExtData = (raw) => {
    if (!raw) {
      extData.value = {}
      return
    }
    extData.value = typeof raw === 'string' ? safeParse(raw) : raw
  }

  // 收集 DynamicForm 数据，数组类型序列化为 JSON 字符串（与文章保存保持一致）
  const buildExtData = () => {
    const latest = (dynamicFormRef.value && dynamicFormRef.value.formData) || extData.value || {}
    const out = {}
    Object.keys(latest).forEach((key) => {
      const val = latest[key]
      out[key] = Array.isArray(val) ? JSON.stringify(val, null, 2) : val
    })
    return out
  }

  return {
    modelOptions,
    field,
    extData,
    dynamicFormRef,
    selectedMid,
    loadModels,
    handleModelChange,
    initExtData,
    buildExtData,
  }
}

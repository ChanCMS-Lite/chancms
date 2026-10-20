<template>
  <el-dialog v-model="dialogVisible" title="编辑" destroy-on-close @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-position="top">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入角色名称"></el-input>
      </el-form-item>

      <el-form-item label="角色标识" prop="key">
        <el-input v-model="state.form.key" placeholder="请输入角色标识"></el-input>
      </el-form-item>

      <el-form-item label="角色顺序" prop="sort">
        <el-input v-model="state.form.sort" type="number" placeholder="请输入角色顺序"></el-input>
      </el-form-item>

      <el-form-item label="权限菜单" prop="pid">
        <el-tree @check="handleCheckChange" :data="state.menus" multiple ref="treeRef"
          :render-after-expand="false" show-checkbox check-on-click-node check-strictly :show-count="true"
          node-key="id" class="w-full" />
      </el-form-item>

      <el-form-item label="权限码" prop="permCodes">
        <el-tree @check="handlePermCheck" :data="state.permTreeData" :default-checked-keys="checkedPermKeys" multiple
          ref="permTreeRef" :render-after-expand="false" show-checkbox check-on-click-node node-key="key"
          class="w-full" />
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="state.form.status">
          <el-radio value="1">正常</el-radio>
          <el-radio value="2">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)" v-permission="['base:role:create', 'base:role:update']">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>
// 在原有import基础上添加
import { tree, addLabelValue } from '@/utils/tool.js'

import { menuList, detail, create, update, roleMenuList, permTree } from '../api/index.js'
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  computed,
  watch,
  nextTick,
} from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: 0,
  },
})

const formRef = ref(null);
const treeRef = ref(null); // 用于访问树组件的方法，如设置选中的节点等
const checkedKeys = ref([]); // 存储选中节点的 key 的数组
const roleId = ref(0); // 存储当前角色的 id
const permTreeRef = ref(null);
const checkedPermKeys = ref([]); // 选中的规范权限码（叶子节点 key）

const handleCheckChange = () => {
  // check-strictly 模式：父子独立勾选，勾「栏目管理」不会带上「栏目新增/修改」。
  // 权限菜单树语义 = 注册哪些路由（父菜单=列表页路由，子菜单=编辑页路由），二者本就独立；
  // 按钮级粒度由「接口权限」树负责。级联模式下无法表达「父勾子不勾」（单子节点取消子会把父也带掉）。
  checkedKeys.value = treeRef.value.getCheckedKeys();
};
const handlePermCheck = () => {
  // 只收集叶子节点（三段式规范码 module:resource:action），剔除父节点
  const keys = permTreeRef.value.getCheckedKeys();
  checkedPermKeys.value = keys.filter((k) => (k.match(/:/g) || []).length === 2);
};
const emit = defineEmits(['update:visible', 'success']);
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
});


//数据
const state = reactive({
  menus: [],
  permTreeData: [],
  form: {
    name: '',
    key: '',
    sort: '0',
    status: '1'
  },
})

// 提交后端时剥离非角色表字段（detail 回显会把 permCodes 挂进 form）
const buildRoleData = () => {
  const { permCodes, ...rest } = state.form
  return rest
}

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      //菜单列表
      await getList()
      // 规范权限树
      await getPermTree()
      if (props.id > 0) {
        // 这里替换实际的API调用
        const id = Number(props.id)
        roleId.value = id;
        await getDetail(id)
        await getRoleMenuList(id)
      }
    }
  },
)

//所有权限菜单
const getList = async () => {
  try {
    const res = await menuList()
    if (res.code === 0) {
      const data = tree(res.data.list);
      const dealData = addLabelValue(data, 'title', 'id');
      state.menus = dealData;
    }
  } catch (error) {
    console.log(error)
  }
}

// 规范权限树（驱动接口权限勾选）——按菜单树组织：菜单节点挂资源动作叶子（叶子 key=三段式权限码）
const ACTION_LABELS = { list: '查看', create: '新增', update: '修改', delete: '删除' }
const getPermTree = async () => {
  try {
    const res = await permTree()
    if (res.code === 0) {
      state.permTreeData = buildPermTree(res.data)
    }
  } catch (error) {
    console.log(error)
  }
}
// 后端 tree 返回 { menus(菜单树), permByMenu(menuId->资源), uncategorized(未挂菜单资源) }
const buildPermTree = (data) => {
  const { menus, permByMenu, uncategorized } = data || {}
  const leaves = (perms) =>
    (perms || []).flatMap((p) =>
      (p.actions || []).map((a) => ({ key: `${p.module}:${p.key}:${a}`, label: `${p.name}·${ACTION_LABELS[a] || a}` }))
    )
  const buildMenu = (m) => {
    const children = (m.children || []).map(buildMenu)
    const permLeaves = leaves(permByMenu[m.id])
    if (permLeaves.length) children.push(...permLeaves)
    return { key: `m${m.id}`, label: m.title, children }
  }
  const tree = (menus || []).map(buildMenu)
  if (uncategorized && uncategorized.length) {
    tree.push({ key: 'uncategorized', label: '其他权限', children: leaves(uncategorized) })
  }
  return tree
}
//权限菜单
// 精确还原（配合 el-tree 的 check-strictly）：树是父子独立的，勾了哪些 id 就原样勾回哪些 id。
// 「父菜单勾选、子菜单不勾选」= 列表页可访问、编辑页无路由，天然可表达「只访问不编辑」。
const applyCheckedKeys = (ids) => {
  const tree = treeRef.value;
  if (!tree) return;
  const valid = new Set();
  const walk = (nodes) => {
    for (const item of nodes) {
      valid.add(item.id);
      if (item.children && item.children.length > 0) walk(item.children);
    }
  };
  walk(state.menus);
  // 只保留当前菜单树里真实存在的 id
  const wanted = new Set(ids.filter((id) => valid.has(id)));
  tree.setCheckedKeys([...wanted]);
  // 兜底：把不在授权集合内的节点取消勾选
  const uncheckRest = (nodes) => {
    for (const item of nodes) {
      if (!wanted.has(item.id)) {
        const node = tree.getNode(item.id);
        if (node && node.checked) tree.setChecked(item.id, false);
      }
      if (item.children && item.children.length > 0) uncheckRest(item.children);
    }
  };
  uncheckRest(state.menus);
  checkedKeys.value = [...wanted];
};

const getRoleMenuList = async (id) => {
  try {
    let res = await roleMenuList({ id })
    if (res.code == 0) {
      const menuIds = res.data.list.map(item => item.menu_id);
      await nextTick();
      applyCheckedKeys(menuIds);
    }
  } catch (error) {
    console.error(error)
  }
}

//创建菜单
const createMenu = async () => {
  try {

    const res = await create({ roleData: buildRoleData(), menuIds: checkedKeys.value, permCodes: checkedPermKeys.value })
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
const updateMenu = async () => {
  try {
    let params = { roleId: roleId.value, roleData: buildRoleData(), menuIds: checkedKeys.value, permCodes: checkedPermKeys.value };

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
      state.form = res.data
      // 回显已授权接口权限（后端 detail 已附带 permCodes）
      checkedPermKeys.value = res.data.permCodes || []
    }
  } catch (error) {
    console.error(error)
  }
}

const handleClick = formRef => {
  if (formRef) {
    formRef.validate(valid => {
      if (valid) {
        if (roleId.value == 0) {
          //创建角色
          createMenu()
          //创建角色菜单
          // handleRoleMenuCreate()
        } else {
          //更新角色
          updateMenu()

        }
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  state.form = {
    name: '',
    key: '',
    sort: '0',
    status: '1',
  }

  state.menus = []
  state.permTreeData = []
  roleId.value = 0;
  checkedKeys.value = []
  checkedPermKeys.value = []

}

</script>

<style scoped>
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

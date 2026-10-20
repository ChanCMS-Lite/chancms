<template>
  <!-- 目录（type='M'）：**必须存在可见子菜单**才渲染成折叠分组。
       🔴 2026-09-17 修复「没配却显示功能管理」：
       目录本身没有 component，若没有可见子菜单还去渲染，只能降级成 el-menu-item
       —— 于是侧边栏凭空出现一个点不动、点了就跳未注册路由的「功能管理」。
       成因：后端为让「直接授权的隐藏子页」挂得上树，必须保留祖先目录节点；
            其中 type='M' 的祖先即使未被授权也会保留 is_show='1'（见 SysMenu#allRouter）。
            如「编辑管理员」只授权了 字段新增/修改(39)，祖先链 39→38→34→33 里的
            33(功能管理, type='M') 就被带出来了，而它没有任何可见子节点。 -->
  <el-sub-menu
    v-if="isDir && hasVisibleChildren && item.is_show != '2'"
    :index="item.path"
  >
    <template #title>
      <el-icon v-if="showIcon">
        <component :is="showIcon"></component>
      </el-icon>
      <span>{{ item.title }}</span>
    </template>
    <SidebarItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :level="level + 1"
    />
  </el-sub-menu>

  <!-- 菜单项：真实页面（有 component）才可直接点击跳转；目录不走这条分支 -->
  <el-menu-item
    v-else-if="!isDir && item.is_show != '2'"
    :index="item.path"
    @click="navigateTo(item)"
  >
    <el-icon v-if="showIcon">
      <component :is="showIcon"></component>
    </el-icon>
    <template #title>
      <span>{{ item.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup name="SidebarItem">
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { asyncRoutes } from '@/router/asyncRoutes.js'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
})

// 目录判定：用后端 sys_menu.type
//   'M' = 目录（无 component，只作分组壳）/'C' = 菜单（页面）/'F' = 按钮
// 🔴 不能用「有 children」判定 —— 如「栏目管理」下挂着隐藏的「栏目新增/修改」，
//    它是可点击的页面，不是分组。
const isDir = computed(() => props.item?.type === 'M')

// 判断是否有可见子菜单（is_show != '2'）
const hasVisibleChildren = computed(() => {
  if (!props.item?.children || props.item.children.length === 0) return false
  return props.item.children.some(child => child.is_show != '2')
})

// 从 asyncRoutes 提取图标映射：先按 name，再按 path
const iconByName = asyncRoutes.reduce((map, route) => {
  if (route.meta?.icon && route.name) {
    map[route.name] = route.meta.icon
  }
  return map
}, {})
const iconByPath = asyncRoutes.reduce((map, route) => {
  if (route.meta?.icon && route.path) {
    map[route.path] = route.meta.icon
  }
  return map
}, {})

// 一级菜单/目录只要配置 icon 就显示
// 优先用后端返回的 item.icon（含插件动态注册的菜单图标）
// 其次用本地 asyncRoutes 配置的 icon
const showIcon = computed(() => {
  if (props.level !== 1) return ''
  return props.item?.icon || iconByName[props.item.name] || iconByPath[props.item.path] || ''
})

const router = useRouter()
const navigateTo = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped lang="less">
.el-menu-item:hover {
  background-color: #f2f2f2;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #f2f2f2;
}
</style>

<template>
  <el-breadcrumb class="breadcrumb" :separator="props.separator">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbData"
      :key="item.path"
      :to="index === breadcrumbData.length - 1 ? '' : { path: item.path }"
    >
      <span class="breadcrumb-text">{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup name="BreadCrumb">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps({
  separator: {
    type: String,
    default: '/',
  },
})

const route = useRoute()
const breadcrumbData = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  // 动态判断最后一个面包屑是"新增"还是"修改"
  return matched.map((item, index) => {
    if (index === matched.length - 1) {
      const hasId = route.params.id || route.query.id
      const title = item.meta.title || ''
      // 如果标题包含"新增/修改"，根据是否有id动态显示
      if (title.includes('新增/修改')) {
        return {
          ...item,
          meta: {
            ...item.meta,
            title: hasId ? title.replace('新增/修改', '修改') : title.replace('新增/修改', '新增'),
          },
        }
      }
    }
    return item
  })
})
</script>

<style lang="less" scoped>
.breadcrumb {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #606266;
      font-size: 14px;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }

    &.is-last {
      .el-breadcrumb__inner {
        color: #303133;
        font-weight: 500;
        cursor: default;

        &:hover {
          color: #303133;
        }
      }
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: #c0c4cc;
    font-size: 12px;
  }
}

.breadcrumb-text {
  display: inline-block;
}
</style>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="text-9xl font-bold text-primary-500 mb-4" style="text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1)">
        404
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-4">页面不存在</h1>
      <p class="text-lg text-gray-600 mb-8">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <div class="flex justify-center space-x-4">
        <el-button type="primary" @click="goBack">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
        <el-button @click="goHome">
          <el-icon class="mr-1"><House /></el-icon>
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, House } from '@element-plus/icons-vue'

const router = useRouter()

// 返回上一页
function goBack() {
  router.go(-1)
}

// 返回首页
function goHome() {
  router.push('/index')
}
</script>
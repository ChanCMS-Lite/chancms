<template>
  <footer class="pt-10 pb-10 bg-f2f2f2">
    <p class="text-c c-333 f-12">
      Copyright © 2016-{{ appInfo.year }}
      <a class="c-9ca4bf" href="https://www.chancms.top" target="_blank">
        {{ appInfo.APP_NAME }}
      </a>
      v{{ appInfo.APP_VERSION }} All Rights Reserved.
    </p>
  </footer>
</template>
<script setup name="Footer">
import { reactive, onMounted } from 'vue'
import Cookies from 'js-cookie'

const appInfo = reactive({
  APP_NAME: 'ChanCMS',
  APP_VERSION: '',
  APP_VERSION_TIME: '',
  year: new Date().getFullYear().toString(),
})

onMounted(() => {
  try {
    const appInfoCookie = Cookies.get('appInfo')
    if (appInfoCookie) {
      const data = JSON.parse(appInfoCookie)
      Object.assign(appInfo, data)
    }
  } catch (error) {
    console.error('[Footer] 解析 appInfo cookie 失败:', error)
  }
})
</script>

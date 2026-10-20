<script setup name="RedirectPage">
import { useRoute, useRouter } from 'vue-router'
import { onBeforeMount } from 'vue'

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const { path, query } = route.query
  // 解码路径（避免编码问题）
  const targetPath = path ? decodeURIComponent(path) : route.path
  // 替换到目标路由，让组件重新创建
  router.replace({ path: targetPath, query })
})
</script>

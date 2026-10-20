<template>
  <div>
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-alert
        v-if="mode"
        :title="`存储后端：${mode}${mode.startsWith('memory') ? '（未启用 Redis，多实例不共享在线状态）' : ''}`"
        type="info"
        :closable="false"
        show-icon
      />
    </div>

    <div class="bg-fff radius-6 pd-20">
      <div class="flex justify-end mb-10">
        <el-button :icon="Refresh" @click="getList">刷新</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border>
        <el-table-column prop="username" label="用户名" min-width="140">
          <template #default="scope">
            {{ scope.row.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="登录IP" min-width="140">
          <template #default="scope">{{ scope.row.ip || '-' }}</template>
        </el-table-column>
        <el-table-column prop="loginTime" label="登录时间" min-width="180">
          <template #default="scope">
            {{ scope.row.loginTime ? formatTime(scope.row.loginTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="exp" label="到期时间" min-width="180">
          <template #default="scope">
            {{ scope.row.exp ? formatTime(scope.row.exp) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button type="danger" size="small" v-permission="['base:online:kick']" @click="handleKick(scope.row)">强退</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无在线用户" />
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { list, kick } from '@/api/online.js'

const loading = ref(false)
const list = ref([])
const mode = ref('')

const formatTime = (t) => dayjs(t).format('YYYY-MM-DD HH:mm:ss')

const getList = async () => {
  loading.value = true
  try {
    const res = await list()
    if (res.code === 0) {
      list.value = res.data.list || []
      mode.value = res.data.mode || ''
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const handleKick = async (row) => {
  try {
    await ElMessageBox.confirm(`确认强制下线用户「${row.username || row.uid}」？`, '强退确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await kick({ token: row.token })
    if (res.code === 0) {
      ElMessage({ message: res.msg || '已强退', type: 'success' })
      getList()
    } else {
      ElMessage({ message: res.msg || '操作失败', type: 'error' })
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  getList()
})
</script>

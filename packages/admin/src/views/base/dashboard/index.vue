<template>
  <div class="flex flex-col dashboard">
    <!-- 欢迎卡：问候语 + 登录地址（纯本地，无统计接口） -->
    <div class="panel hero mb-16">
      <div class="hero-top">
        <div class="hero-hi">
          <p class="hero-title">{{ username || '管理员' }}，{{ greeting }}。</p>
        </div>
        <div class="hero-addr">
          <el-icon :size="14"><Location /></el-icon>
          <span>您当前登录地址：{{ locationText }}（IP：{{ ip || '未知' }}）</span>
        </div>
      </div>
    </div>

    <!-- 常用统计：5 张等宽小卡片（数字在上、文字在下；复用各列表接口取 total，无权限项显示 '-'） -->
    <div class="stat-row mb-16">
      <div class="panel stat-card" v-for="c in statCards" :key="c.label" @click="goStat(c)" role="button" tabindex="0" @keyup.enter="goStat(c)">
        <div class="stat-ic" :style="{ background: c.bg, color: c.color }">
          <svg v-if="c.key === 'article'" class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          <svg v-else-if="c.key === 'page'" class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z"/><path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1"/></svg>
          <svg v-else-if="c.key === 'comment'" class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
          <svg v-else-if="c.key === 'category'" class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>
          <svg v-else class="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="stat-meta">
          <div class="stat-value">{{ c.value }}</div>
          <div class="stat-label">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <!-- 系统特色 / 技术架构（纯静态展示，不依赖任何统计模块） -->
    <el-row :gutter="16" class="mb-16">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="panel chart-panel">
          <div class="panel-hd">
            <el-icon class="hd-ic" :size="15"><Star /></el-icon>
            <span>系统特色</span>
          </div>
          <div class="chart-body feat-ring">
            <ChanEcharts :option="featureOption" />
            <div class="ring-center">
              <b>{{ sysFeatures.length }}</b>
              <span>大特色</span>
            </div>
          </div>
          <ul class="feat-legend">
            <li v-for="f in sysFeatures" :key="f.name">
              <el-icon class="feat-ic" :size="15" :style="{ color: f.color }"><component :is="f.icon" /></el-icon>
              <span>{{ f.name }}</span>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <div class="panel chart-panel">
          <div class="panel-hd">
            <el-icon class="hd-ic" :size="15"><PieChart /></el-icon>
            <span>技术架构</span>
          </div>
          <div class="chart-body feat-ring">
            <ChanEcharts :option="option" />
            <div class="ring-center">
              <b>{{ techFeatures.length }}</b>
              <span>大技术栈</span>
            </div>
          </div>
          <ul class="feat-legend">
            <li v-for="f in techFeatures" :key="f.name">
              <el-icon class="feat-ic" :size="15" :style="{ color: f.color }"><component :is="f.icon" /></el-icon>
              <span>{{ f.name }}</span>
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>

    <!-- 技术架构与开发优势 / AI赋能网站建设 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <div class="panel about-panel">
          <div class="panel-hd">
            <el-icon class="hd-ic" :size="15"><SetUp /></el-icon>
            <span>技术架构与开发优势</span>
            <span class="hd-tip">ChanCMS Lite</span>
          </div>
          <p class="ab-desc">
            支持 PC、手机、平板多端自适应，满足企业、学校、政府、工厂、外贸、医院等不同类型网站的展示与运营需求。
          </p>
          <ul class="serv-list">
            <li class="serv-item" v-for="t in techList" :key="t.name">
              <el-icon class="serv-ic" :size="15"><component :is="t.icon" /></el-icon>
              <span class="serv-name">{{ t.name }}</span>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <div class="panel about-panel">
          <div class="panel-hd">
            <el-icon class="hd-ic" :size="15"><MagicStick /></el-icon>
            <span>AI赋能网站建设</span>
            <span class="hd-tip">定制方案</span>
          </div>
          <p class="ab-sub">为企业、学校、政府、工厂、外贸、医院提供定制化官网解决方案</p>
          <ul class="serv-list">
            <li class="serv-item" v-for="s in industryList" :key="s.name">
              <el-icon class="serv-ic" :size="15"><component :is="s.icon" /></el-icon>
              <span class="serv-name">{{ s.name }}</span>
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>

    <Footer />
  </div>
</template>

<script name="DashBoard" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Star, PieChart, Location,
  Cpu, Lightning, MagicStick, Lock, Aim, Grid,
  Connection, DataAnalysis, Document, Coin, Brush,
  Monitor, Cellphone, Tools, Platform,
  OfficeBuilding, School, Stamp, Shop, Position, FirstAidKit, SetUp,
} from '@element-plus/icons-vue'
import ChanEcharts from '@/components/ChanEcharts/index.vue'
import { getCookie } from '@/utils/tool'
import Footer from '@/layout/Footer/index.vue'
import { search as searchArticle } from '@/api/article.js'
import { find as findCategory } from '@/api/category.js'
import { list as listUser } from '@/views/base/user/api/index.js'
import { list as listComment } from '@/views/vip/comment/api/index.js'
import { DOMAIN } from '@/constants/contentTypes.js'

const username = ref(getCookie('n') || '')
const ip = ref(getCookie('ip') || '')
const region = ref(null)
const router = useRouter()

// 统计卡作为快速导航：点击进入对应管理页
function goStat(c) {
  if (c.path) router.push(c.path)
}

// 常用统计（复用各列表接口取 total，无独立统计接口）
// Promise.allSettled：某项无权限/失败时只让该卡显示 '-'，不影响其它卡
const statCards = ref([
  // 扁平：浅色填充（Arco x-1 浅色调） + Lucide 线性图标（模板内联渲染，svg 用 currentColor 跟随 color）
  { key: 'article', label: '文章数', value: '-', path: '/article', color: 'rgb(22, 93, 255)', bg: 'rgb(228, 238, 255)' },
  { key: 'page', label: '单页数', value: '-', path: '/page', color: 'rgb(0, 180, 42)', bg: 'rgb(232, 247, 239)' },
  { key: 'comment', label: '评论数', value: '-', path: '/comment', color: 'rgb(255, 125, 0)', bg: 'rgb(255, 242, 230)' },
  { key: 'category', label: '栏目数', value: '-', path: '/category', color: 'rgb(36, 159, 242)', bg: 'rgb(230, 244, 254)' },
  { key: 'admin', label: '管理员数', value: '-', path: '/user', color: 'rgb(245, 63, 63)', bg: 'rgb(255, 236, 232)' },
])

async function loadStats() {
  const [art, page, cmt, cat, usr] = await Promise.allSettled([
    // 口径与各列表页一致：文章=article/image/video 域，单页=page 域（均存 cms_article）
    searchArticle({ page: 1, pageSize: 1, content_type: DOMAIN.article }),
    searchArticle({ page: 1, pageSize: 1, content_type: DOMAIN.page }),
    listComment(1, 1),
    findCategory(),
    listUser({ cur: 1, pageSize: 1 }),
  ])
  const total = (r) => (r.status === 'fulfilled' ? Number(r.value?.data?.total ?? 0) : '-')
  const treeLen = (r) =>
    r.status === 'fulfilled' && Array.isArray(r.value?.data) ? r.value.data.length : '-'
  statCards.value[0].value = total(art)
  statCards.value[1].value = total(page)
  statCards.value[2].value = total(cmt)
  statCards.value[3].value = treeLen(cat)
  statCards.value[4].value = total(usr)
}

// 技术架构与开发优势（左卡）
const techList = [
  { name: '响应式布局', icon: Monitor },
  { name: '多端适配', icon: Cellphone },
  { name: '模块化开发', icon: Grid },
  { name: '易维护可扩展', icon: Tools },
  { name: '稳定架构', icon: Platform },
  { name: '快速交付', icon: Lightning },
]
// AI 赋能网站建设：行业解决方案（右卡）
const industryList = [
  { name: '企业官网', icon: OfficeBuilding },
  { name: '学校院校', icon: School },
  { name: '政府单位', icon: Stamp },
  { name: '工厂企业', icon: Shop },
  { name: '外贸站点', icon: Position },
  { name: '医院医疗', icon: FirstAidKit },
]

// 登录地址文案：优先「省 · 市」，退化到国家，再退化到未知（仅读 cookie，不请求接口）
const locationText = computed(() => {
  const r = region.value
  if (!r) return '未知位置'
  const parts = [r.prov, r.city].filter(Boolean)
  if (parts.length) return parts.join(' · ')
  return r.country || '未知位置'
})

// 问候语按当前时段变化
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// 系统特色（环形，静态展示）
const sysFeatures = [
  { name: '自研框架 chanjs', icon: Cpu, color: '#4A82F7' },
  { name: '高性能', icon: Lightning, color: '#34D399' },
  { name: '极灵活', icon: MagicStick, color: '#FBBF24' },
  { name: '强安全', icon: Lock, color: '#A78BFA' },
  { name: 'AI GEO', icon: Aim, color: '#22D3EE' },
  { name: '多模块', icon: Grid, color: '#F87171' },
]
const featureOption = ref({
  tooltip: { trigger: 'item', borderWidth: 0, backgroundColor: '#fff', textStyle: { color: '#000' }, formatter: (p) => `${p.marker}${p.name}` },
  series: [{
    name: '系统特色', type: 'pie', radius: ['46%', '70%'], center: ['50%', '50%'], padAngle: 4,
    color: sysFeatures.map((f) => f.color), itemStyle: { borderRadius: 8, borderWidth: 0 },
    label: { show: false }, emphasis: { label: { show: false } }, labelLine: { show: false },
    data: sysFeatures.map((f) => ({ value: 1, name: f.name })),
  }],
})

// 技术架构（环形，静态展示）
const techFeatures = [
  { name: 'Chanjs', icon: Cpu, color: '#FADC19' },
  { name: 'Node', icon: Connection, color: '#9FDB1D' },
  { name: 'Vue3', icon: DataAnalysis, color: '#00B42A' },
  { name: 'Javascript', icon: Document, color: '#3491FA' },
  { name: 'Mysql/Redis', icon: Coin, color: '#165DFF' },
  { name: 'HTML5/CSS3', icon: Brush, color: '#722ED1' },
]
const option = ref({
  tooltip: { trigger: 'item', borderWidth: 0, backgroundColor: '#fff', textStyle: { color: '#000' }, formatter: (p) => `${p.marker}${p.name}` },
  series: [{
    name: '技术架构', type: 'pie', radius: ['46%', '70%'], center: ['50%', '50%'], padAngle: 4,
    color: techFeatures.map((f) => f.color), itemStyle: { borderRadius: 8, borderWidth: 0 },
    label: { show: false }, emphasis: { label: { show: false } }, labelLine: { show: false },
    data: techFeatures.map((f) => ({ value: 1, name: f.name })),
  }],
})

onMounted(() => {
  // 登录地址仅读 pos cookie，不发任何统计/内容统计请求
  const pos = getCookie('pos')
  if (!pos) return
  try { region.value = JSON.parse(pos) } catch (e) { region.value = null }

  loadStats()
})
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 110px);
}

/* 非栅格面板（顶部融合卡）：按内容自适应高度，不跟随全局 height:100% */
.dashboard > .panel {
  height: auto;
}

/* 内容不足一屏时把 Footer 顶到底部（取代根容器的 justify-between，避免中部被撑出空档） */
.dashboard > footer {
  margin-top: auto;
}

/* 顶部融合卡：上半蓝顶带（欢迎语 + 登录地址），下半白色数据带（5 指标）
   容器去掉 .panel 的 padding，让顶带铺满整宽；overflow 保证顶带跟随圆角 */
.panel.hero {
  padding: 0;
  overflow: hidden;
}
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 20px;
}
/* 问候语：单行大字、无任何装饰（用户明确要求去掉竖线与日期副行） */
.hero-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}
.hero-addr {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4e5969;
  background: rgba(74, 130, 247, 0.1);
  border-radius: 999px;
  padding: 6px 14px;
}
.hero-addr .el-icon {
  color: #4A82F7;
}
/* 底部「技术架构与开发优势 / AI赋能网站建设」两卡 */
.about-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.ab-desc {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: #4e5969;
}
.ab-sub {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #86909c;
}
.serv-list {
  flex: 1;
  align-content: start;
}
.about-ft {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.ft-site {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4A82F7;
  text-decoration: none;
}
.ft-site:hover {
  text-decoration: underline;
}
.visit-site .el-icon {
  margin-right: 4px;
}
.serv-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.serv-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f7f9fc;
  transition: all .2s;
}
.serv-item:hover {
  background: #eef3ff;
}
.serv-ic {
  color: #4A82F7;
}
.serv-name {
  font-size: 13px;
  color: #1d2129;
}
/* 常用统计：一行 5 张等宽紧凑小卡（数字在上、文字在下），窄屏 3 列/2 列降级 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 1280px) {
  .stat-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: auto;
  padding: 16px 18px;
  cursor: pointer;
  transition: box-shadow .2s, transform .2s;
}
.stat-card:hover {
  box-shadow: var(--card-hover-shadow);
  transform: translateY(-2px);
}
.stat-ic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-svg {
  width: 20px;
  height: 20px;
  display: block;
}
.stat-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  color: #1d2129;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  margin-top: 3px;
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
}

/* 图表卡片：纵向布局，图表区吃满剩余高度 → 同一行三张自动等高（借全局 .panel height:100%） */
.chart-panel {
  display: flex;
  flex-direction: column;
}
.chart-panel .panel-hd {
  flex: none;
}
.chart-body {
  flex: 1;
  min-height: 240px;
}

/* 系统特色：环形 + 居中概要 + 图标图例 */
.feat-ring {
  position: relative;
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #1d2129;
}
.ring-center b {
  font-size: 26px;
  line-height: 1;
  font-weight: 700;
}
.ring-center span {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}
.feat-legend {
  list-style: none;
  margin: 4px 0 2px;
  padding: 0 6px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.feat-legend li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #4e5969;
  min-width: 0;
}
.feat-ic {
  flex: none;
}
.feat-legend li span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

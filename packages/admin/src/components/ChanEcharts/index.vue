<template>
  <div class="echarts">
    <div ref="myEcharts" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
// ECharts 按需引入：仅注册项目实际使用的图表与组件，避免全量打包
// dashboard/index.vue 使用 pie（架构/新访客/来源/设备/浏览器/系统）、line（访问趋势）、bar（内容统计）
import * as echarts from 'echarts/core'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  CanvasRenderer
])

export default {
  name: 'ChanEcharts',
  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['chart-click'],
  data () {
    return {
      myEcharts: null,
      resizeObserver: null,
      resizeRaf: 0
    }
  },
  mounted () {
    this.initEcharts()
    this.addResizeListener()
  },
  methods: {
    initEcharts () {
      this.myEcharts = echarts.init(this.$refs.myEcharts)
      this.myEcharts.setOption(this.option)
      // 透传图表点击事件（如首页「内容统计」柱形点击跳转对应列表）
      this.myEcharts.on('click', (params) => this.$emit('chart-click', params))
    },
    addResizeListener () {
      this.resizeObserver = new ResizeObserver(() => {
        // 保护 1：option 为空（图表还没拿到数据）时不 resize
        const hasSeries = Array.isArray(this.option?.series) && this.option.series.length > 0
        if (!hasSeries || !this.myEcharts || this.myEcharts.isDisposed()) return
        // 保护 2：把 resize 推迟到下一帧。若与 setOption 的更新同帧执行，
        // echarts 内部 dataSample 处理器可能读不到 seriesModel.coordinateSystem
        // 而抛错（Cannot read properties of undefined (reading 'type')）。
        cancelAnimationFrame(this.resizeRaf)
        this.resizeRaf = requestAnimationFrame(() => {
          if (!this.myEcharts || this.myEcharts.isDisposed()) return
          try {
            this.myEcharts.resize()
          } catch {
            // 兜底：极少数时序下仍失败，改为重新应用 option（同样按新尺寸重新布局）
            try { this.myEcharts.setOption(this.option) } catch { /* 图表已渲染，忽略 */ }
          }
        })
      })
      this.resizeObserver.observe(this.$refs.myEcharts)
    }
  },
  watch: {
    option: {
      handler (val) {
        this.myEcharts.setOption(val)
      },
      deep: true
    }
  },
  beforeUnmount () {
    cancelAnimationFrame(this.resizeRaf)
    this.myEcharts.dispose()
    this.resizeObserver.disconnect()
  }
}
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}

.echarts :deep( div div) {
  margin: 0 auto !important;
}
</style>
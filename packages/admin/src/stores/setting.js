import { defineStore } from 'pinia'
import setting from '@/config/setting'
export const settingStore = defineStore('setting', {
  state() {
    return {
      ...setting,
    }
  },
  getters: {},
  actions: {},
})

export default settingStore

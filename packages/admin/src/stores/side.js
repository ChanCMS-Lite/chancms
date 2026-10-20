import { defineStore } from 'pinia'
export const useSideStore = defineStore('side', {
  state: () => ({
    sideFlag: true, //true->开 false->关闭
  }),
  actions: {
    setSide(status) {
      this.sideFlag = status
    },
    toggleSide() {
      this.sideFlag = !this.sideFlag
    },
  },
})

import { createPinia } from 'pinia'
import { useContentStore } from './content'

const pinia = createPinia()

export {
  pinia,
  useContentStore
}
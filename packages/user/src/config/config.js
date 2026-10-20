export const hosts = {
  BASE_API: {
    dev: import.meta.env.VITE_API_BASE_URL || '',
    prd: import.meta.env.VITE_API_BASE_URL || '',
  },
}

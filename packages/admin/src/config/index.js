let api = {
  pre: {
    BASE_API: import.meta.env.VITE_APP_BASE_API || "",
  },
  prd: {
    BASE_API: import.meta.env.VITE_APP_BASE_API || "",
  },
};

const env = import.meta.env.PROD ? "prd" : "pre";
export default api[env];

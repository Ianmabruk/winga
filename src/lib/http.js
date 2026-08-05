import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || ''

export const http = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 12000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
})

http.interceptors.request.use((config) => {
  if (!config.params) config.params = {}
  config.params.t = Date.now()
  return config
})

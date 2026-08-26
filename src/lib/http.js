import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || ''

export const http = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 12000,
  // Keep client-side request headers minimal to avoid unnecessary CORS
  // preflights. Server responses control caching directives.
  headers: {},
})

http.interceptors.request.use((config) => {
  if (!config.params) config.params = {}
  config.params.t = Date.now()
  return config
})

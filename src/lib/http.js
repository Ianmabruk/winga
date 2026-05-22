import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const resolveApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (import.meta.env.DEV) return 'http://localhost:4000'
  return window.location.origin
}

const API_URL = resolveApiUrl()

export const http = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 12000,
})

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise = null

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error)
    }

    const { refreshToken, logout, setAuth, user } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    original._retry = true

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${API_URL}/api/auth/refresh`, { refreshToken })
        .then((res) => {
          setAuth({
            user,
            accessToken: res.data.accessToken,
            refreshToken,
          })
          return res.data.accessToken
        })
        .catch((refreshError) => {
          logout()
          throw refreshError
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    const nextToken = await refreshPromise
    original.headers.Authorization = `Bearer ${nextToken}`
    return http(original)
  },
)

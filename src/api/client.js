/**
 * Winga Forex Bureau — Centralized Axios Client
 * Connects to: https://forex.wingaforex.co.tz (Frappe/ERPNext)
 * Auth:  Authorization: token a17fdb15f2843fb:90e346cda372a8f
 */
import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_WINGA_API_BASE || 'https://forex.wingaforex.co.tz'
const API_TOKEN =
  import.meta.env.VITE_WINGA_API_TOKEN ||
  'token a17fdb15f2843fb:90e346cda372a8f'

const MAX_RETRIES = 3
const TIMEOUT_MS = 15_000

// Active request cancellation map (deduplication)
const pendingRequests = new Map()

const buildKey = (config) =>
  [config.method, config.url, JSON.stringify(config.params)].join('|')

export const wingaClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    Authorization: API_TOKEN,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
wingaClient.interceptors.request.use(
  (config) => {
    // Always inject auth header
    config.headers['Authorization'] = API_TOKEN

    // Deduplication: cancel in-flight duplicate GET requests
    if (config.method?.toLowerCase() === 'get') {
      const key = buildKey(config)
      if (pendingRequests.has(key)) {
        pendingRequests.get(key).abort()
      }
      const controller = new AbortController()
      config.signal = controller.signal
      pendingRequests.set(key, controller)
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
wingaClient.interceptors.response.use(
  (response) => {
    // Remove from pending map
    const key = buildKey(response.config)
    pendingRequests.delete(key)
    return response
  },
  async (error) => {
    const config = error.config

    // Clean up pending map
    if (config) {
      const key = buildKey(config)
      pendingRequests.delete(key)
    }

    // Don't retry cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // Retry on network/server errors
    config._retryCount = config._retryCount || 0
    const isRetryable =
      !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED'

    if (config._retryCount < MAX_RETRIES && isRetryable) {
      config._retryCount++
      const delay = Math.min(1000 * 2 ** config._retryCount, 10_000)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return wingaClient(config)
    }

    return Promise.reject(error)
  },
)

export default wingaClient

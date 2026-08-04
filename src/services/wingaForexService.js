// Rate source: LIVE Winga API (via /api/rates/live) is the primary source.
// No synthetic / generated rates are ever produced here. If Winga is unavailable
// the frontend surfaces an error state so users know the live feed is down.
//
// Chrome caches cross-origin fetch responses more aggressively than Firefox/Safari.
// To guarantee identical live-rate behaviour across all browsers, every request
// disables the HTTP cache via `cache: "no-store"`, sends anti-cache headers, and
// appends a cache-busting timestamp query parameter.

import { API_URL } from '../lib/http'

const PROXY_BASE = `${API_URL}/api/rates/live`
const BRANCHES_BASE = `${API_URL}/api/rates/branches`

const CACHE_BUST = () => `t=${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

const buildDebugInfo = () => {
  if (typeof window === 'undefined') return null
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
    cookieEnabled: navigator.cookieEnabled,
    storage: typeof localStorage !== 'undefined' ? 'localStorage available' : 'no localStorage',
  }
}

const logDebug = (label, data) => {
  if (typeof window === 'undefined') return
  const isDev = import.meta.env.DEV || window.__WING_DEBUG__
  if (!isDev) return
  console.log(`[WING][${label}]`, data)
}

const fetchNoCache = async (url, { method = 'GET', headers = {} } = {}) => {
  const separator = url.includes('?') ? '&' : '?'
  const bustUrl = `${url}${separator}${CACHE_BUST()}`
  logDebug('request-url', { url: bustUrl, method, headers })

  const response = await fetch(bustUrl, {
    method,
    headers: { ...NO_CACHE_HEADERS, ...headers },
    cache: 'no-store',
    credentials: 'same-origin',
    mode: 'cors',
  })

  logDebug('response-status', { url: bustUrl, status: response.status, statusText: response.statusText })
  return response
}

const normalizeRateData = (data) => {
  const rates = []
  const seen = new Set()

  const pushReal = (entry) => {
    if (!entry || !entry.currency_code) return
    const code = String(entry.currency_code).toUpperCase()
    if (code.length > 3 || seen.has(code)) return

    const buy = Number(entry.buying_rate)
    const sell = Number(entry.selling_rate)
    if (!(buy > 0) || !(sell > 0)) return

    seen.add(code)
    rates.push({
      branch_name: entry.branch_name || 'HEAD OFFICE',
      currency_code: code,
      currency_name: entry.currency_name || entry.currency_actual_name || code,
      currency_actual_name: entry.currency_actual_name || code,
      currency_sequence: Number(entry.currency_sequence) || rates.length + 1,
      buying_rate: buy,
      selling_rate: sell,
      effective_date_and_time: entry.effective_date_and_time || new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
      source: entry.source || 'winga',
    })
  }

  if (!data || typeof data !== 'object') return []

  if (Array.isArray(data.message)) {
    data.message.forEach(pushReal)
  } else if (Array.isArray(data)) {
    data.forEach(pushReal)
  }

  rates.sort((a, b) => (a.currency_sequence || 999) - (b.currency_sequence || 999))
  return rates
}

const loadBranches = async () => {
  try {
    const response = await fetchNoCache(BRANCHES_BASE)
    if (!response.ok) throw new Error(`Branch API error: ${response.status}`)
    const data = await response.json()
    let branches = data.message || []
    if (!Array.isArray(branches) || branches.length === 0) {
      branches = data.branches || data.data || data.results || []
    }
    logDebug('branches-loaded', { count: branches.length, branches })
    return Array.isArray(branches) && branches.length > 0
      ? branches
      : [{ branch_name: 'HEAD OFFICE', branch_abbr: 'HO', city: 'Dar es Salaam', country: 'Tanzania', status: 'active' }]
  } catch (err) {
    console.error('[wingaForexService] Branch fetch failed, using default:', err.message)
    return [{ branch_name: 'HEAD OFFICE', branch_abbr: 'HO', city: 'Dar es Salaam', country: 'Tanzania', status: 'active' }]
  }
}

const loadRates = async (branchName = 'HEAD OFFICE') => {
  const safeBranch = String(branchName || '').trim()
  const branch = safeBranch.length ? safeBranch : 'HEAD OFFICE'

  const response = await fetchNoCache(`${PROXY_BASE}?branch_name=${encodeURIComponent(branch)}`)
  logDebug('rates-fetched', { branch, status: response.status, debug: buildDebugInfo() })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Rates API error: ${response.status} ${errBody.slice(0, 200)}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Rates API returned non-JSON response: ${contentType}`)
  }

  const data = await response.json()
  logDebug('rates-raw', { branch, body: data })

  // Always read from response.data.message (Winga API contract)
  const normalized = normalizeRateData(data)
  logDebug('rates-parsed', {
    branch,
    count: normalized.length,
    currencies: normalized.map((r) => ({
      code: r.currency_code,
      seq: r.currency_sequence,
      buy: r.buying_rate,
      sell: r.selling_rate,
      updated: r.effective_date_and_time,
    })),
    lastUpdate: new Date().toISOString(),
  })

  if (normalized.length > 0) {
    console.log('[wingaForexService] Live Winga rates loaded:', normalized.length, 'currencies for branch:', branch)
  } else {
    console.warn('[wingaForexService] Winga API returned empty rates (message:[]) for branch:', branch)
  }

  return normalized
}

export { loadBranches, loadRates, normalizeRateData }

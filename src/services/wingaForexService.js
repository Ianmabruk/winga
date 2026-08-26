// Rate source: Cache-first architecture.
// The frontend always communicates with OUR backend, never directly with the
// Winga provider.  The backend maintains a persistent cached snapshot of the
// latest RAW Winga response and returns it immediately from
//   - Database (exchange_rates table)
//   - In-memory cache (syncService.cachedRates)
//   - File snapshot (last-snapshot.json)
//
// The browser must NOT call the Winga API directly.  Provider credentials
// must stay server-side.  If the backend is unreachable, the frontend returns
// an empty rates array (controlled state) so the UI can show a fallback
// without blocking the user for an extended period.
//
// Chrome caches cross-origin fetch responses more aggressively than Firefox/Safari.
// To guarantee identical behaviour across all browsers, every request disables
// the HTTP cache via `cache: "no-store"`, sends anti-cache headers, and appends
// a cache-busting timestamp query parameter.

import { API_URL } from '../lib/config'

const CACHE_BASE = `${API_URL}/api/rates`
const LIVE_BASE = `${API_URL}/api/rates/live`
const BRANCHES_BASE = `${API_URL}/api/rates/branches`

// Same-origin fallback proxy (cPanel /api/winga-rates.php) — returns cached
// rates immediately (no synchronous provider call).
const SAME_ORIGIN_FALLBACK = '/api/winga-rates.php'

// Timeout for each fetch attempt.  When the backend is slow to respond we
// fall back to the same-origin cache rather than hanging the page.
const FETCH_TIMEOUT_MS = Number(import.meta.env.VITE_FETCH_TIMEOUT_MS) || 5_000

// Short delay before retry — allows the browser's Happy Eyeballs algorithm
// to prefer IPv4 on mobile carriers / dual-stack networks.
const RETRY_DELAY_MS = Number(import.meta.env.VITE_RETRY_DELAY_MS) || 300

const STALE_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

const CACHE_BUST = () => `t=${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  Accept: 'application/json',
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

  const doFetch = async (signal) => {
    return await fetch(bustUrl, {
      method,
      headers: { ...NO_CACHE_HEADERS, ...headers },
      cache: 'no-store',
      credentials: 'omit',
      mode: 'cors',
      signal,
    })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    try {
      const response = await doFetch(controller.signal)
      logDebug('response-status', { url: bustUrl, status: response.status, statusText: response.statusText })
      return response
    } catch (err) {
      // Network errors — retry once after a short delay.  This handles
      // transient IPv6 resolution failures on mobile carriers and dual-stack
      // networks where IPv6 is preferred but broken.
      clearTimeout(timer)
      logDebug('request-error-retry', { url: bustUrl, error: err.message })

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))

      const retryController = new AbortController()
      const retryTimer = setTimeout(() => retryController.abort(), FETCH_TIMEOUT_MS)
      try {
        const response = await doFetch(retryController.signal)
        logDebug('response-status-retry', { url: bustUrl, status: response.status, statusText: response.statusText })
        return response
      } finally {
        clearTimeout(retryTimer)
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      logDebug('request-timeout', { url: bustUrl, timeout: FETCH_TIMEOUT_MS })
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000}s`, { cause: err })
    }
    logDebug('request-error', { url: bustUrl, error: err.message })
    throw err
  } finally {
    clearTimeout(timer)
  }
}

const parseEffectiveDate = (dateStr) => {
  if (!dateStr) return null
  try {
    const safe = String(dateStr).trim()
    const iso = safe.includes('T') ? safe : safe.replace(' ', 'T')
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return d
  } catch {
    return null
  }
}

const normalizeRateData = (data) => {
  const rates = []

  if (!data || typeof data !== 'object') return []

  // Collect raw entries from the Winga API response
  // Live endpoint returns { message: [...] } or { message: {...} }
  // Cached endpoint returns { rates: [...] } (already-normalized entries)
  const raw = Array.isArray(data.message) ? data.message
    : (data.message && typeof data.message === 'object' && !Array.isArray(data.message))
      ? Object.values(data.message)
      : (Array.isArray(data.rates) ? data.rates
        : (Array.isArray(data) ? data : []))

  // Group by currency_code — Winga may return multiple rows per currency
  // (e.g. USD for different bill denominations). We must pick the canonical
  // entry, not the first or last one.
  const candidates = {}
  for (const entry of raw) {
    if (!entry || !entry.currency_code) continue
    const code = String(entry.currency_code).toUpperCase()
    if (code.length > 3) continue
    const buy = Number(entry.buying_rate)
    const sell = Number(entry.selling_rate)
    if (!(buy > 0) || !(sell > 0)) continue
    if (!candidates[code]) candidates[code] = []
    candidates[code].push(entry)
  }

  for (const [code, entries] of Object.entries(candidates)) {
    let chosen = entries[0]

    if (entries.length > 1) {
      // Match backend syncService.fetchWingaRates deduplication logic:
      // iterate in order, override with standard-denom, then canonical.
      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i]
        const name = String(entry.currency_name || '').toUpperCase()
        const actual = String(entry.currency_actual_name || '').toUpperCase()
        const isStandardDenom =
          (name.startsWith(code + ' ($') || actual.startsWith(code + ' ($')) &&
          !/\(\d{4}/.test(name) &&
          !/\(\d{4}/.test(actual)
        const isCanonical = name === code

        if (isCanonical) {
          chosen = entry
        } else if (isStandardDenom) {
          chosen = entry
        }
      }

      logDebug('duplicate-currency', {
        code,
        count: entries.length,
        chosen: chosen.currency_name,
        all: entries.map((e) => ({
          name: e.currency_name,
          buy: e.buying_rate,
          sell: e.selling_rate,
        })),
      })
    }

    const buy = Number(chosen.buying_rate)
    const sell = Number(chosen.selling_rate)
    if (!(buy > 0) || !(sell > 0)) continue

     const effDate = parseEffectiveDate(chosen.effective_date_and_time)
    const isRateStale = effDate ? (Date.now() - effDate.getTime() > STALE_THRESHOLD_MS) : false

    if (isRateStale) {
      logDebug('stale-rate', { code, effectiveDate: chosen.effective_date_and_time })
    }

    rates.push({
      branch_name: chosen.branch_name || 'HEAD OFFICE',
      currency_code: code,
      currency_name: chosen.currency_name || chosen.currency_actual_name || code,
      currency_actual_name: chosen.currency_actual_name || code,
      currency_sequence:
        Number(chosen.currency_sequence) > 0
          ? Number(chosen.currency_sequence)
          : rates.length + 1,
      buying_rate: buy,
      selling_rate: sell,
      effective_date_and_time: chosen.effective_date_and_time || '',
      stale: isRateStale,
      source: chosen.source || 'winga',
      providerStale: data.stale === true,
    })
  }

  rates.sort((a, b) => a.currency_sequence - b.currency_sequence)
  return rates
}

const loadBranches = async () => {
  try {
    const response = await fetchNoCache(BRANCHES_BASE)
    if (!response.ok) throw new Error(`Branch API error: ${response.status}`)
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Branch API returned non-JSON response: ${contentType}`)
    }
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
    logDebug('branches-failed', { error: err.message })
    return [{ branch_name: 'HEAD OFFICE', branch_abbr: 'HO', city: 'Dar es Salaam', country: 'Tanzania', status: 'active' }]
  }
}

const loadCachedRates = async (branchName = 'HEAD OFFICE') => {
  const safeBranch = String(branchName || '').trim()
  const branch = safeBranch.length ? safeBranch : 'HEAD OFFICE'

  try {
    const response = await fetchNoCache(`${CACHE_BASE}?branch_name=${encodeURIComponent(branch)}`)
    logDebug('cached-rates-fetched', { branch, status: response.status })

    if (!response.ok) {
      throw new Error(`Cached rates API error: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Cached rates API returned non-JSON response: ${contentType}`)
    }

    const data = await response.json()
    logDebug('cached-rates-raw', { branch, body: data })

    const normalized = normalizeRateData(data)
    logDebug('cached-rates-parsed', { branch, count: normalized.length })

    return {
      rates: normalized,
      source: data.source || 'database',
      lastUpdated: data.updated_at || data.lastUpdated || null,
      providerTimestamp: data.providerTimestamp || null,
      stale: data.stale || false,
    }
  } catch (err) {
    logDebug('cached-rates-failed', { error: err.message })
    return { rates: [], source: 'unavailable', lastUpdated: null, providerTimestamp: null, stale: true }
  }
}

const fetchLiveRates = async (branch) => {
  const response = await fetchNoCache(`${LIVE_BASE}?branch_name=${encodeURIComponent(branch)}`)

  if (!response.ok) {
    throw new Error(`Rates API error: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Rates API returned non-JSON response: ${contentType}`)
  }

  const data = await response.json()
  logDebug('rates-raw', { branch, body: data })

  const normalized = normalizeRateData(data)

  const isProviderStale = data.stale === true
  const staleTimestamp = data.staleTimestamp === true
  const staleReason = data.staleReason || data.reason || null

  logDebug('rates-parsed', {
    branch,
    count: normalized.length,
    isProviderStale,
    staleTimestamp,
    staleReason,
    currencies: normalized.map((r) => ({
      code: r.currency_code,
      seq: r.currency_sequence,
      buy: r.buying_rate,
      sell: r.selling_rate,
      updated: r.effective_date_and_time,
      stale: r.stale,
    })),
    lastUpdate: new Date().toISOString(),
  })

  if (normalized.length > 0) {
    logDebug('cached-rates-loaded', { count: normalized.length, branch, staleTimestamp })
    if (staleTimestamp) {
      logDebug('provider-stale', { message: 'Provider timestamp stale. Rates are current.' })
    }
  } else {
    logDebug('no-cached-rates', { branch })
  }

  return {
    rates: normalized,
    stale: isProviderStale,
    staleTimestamp,
    staleReason,
    providerTimestamp: data.providerTimestamp || data.updated_at || null,
    source: data.source || 'database',
    lastUpdated: data.updated_at || null,
  }
}

const fetchCachedRates = async (branch) => {
  const response = await fetchNoCache(`${SAME_ORIGIN_FALLBACK}?branch_name=${encodeURIComponent(branch)}`)

  if (!response.ok) {
    throw new Error(`Fallback API error: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Fallback API returned non-JSON response: ${contentType}`)
  }

  const data = await response.json()
  const normalized = normalizeRateData(data)

  logDebug('fallback-rates-loaded', { count: normalized.length, branch, source: data.source })

  return {
    rates: normalized,
    stale: data.stale === true,
    staleTimestamp: false,
    staleReason: data.stale ? 'Rates may be stale — background refresh in progress' : null,
    providerTimestamp: data.providerTimestamp || data.updated_at || null,
    source: data.source || 'fallback',
    lastUpdated: data.updated_at || null,
  }
}

const loadRates = async (branchName = 'HEAD OFFICE') => {
  const safeBranch = String(branchName || '').trim()
  const branch = safeBranch.length ? safeBranch : ''

  let lastError

  // We always go through OUR backend — never directly to the Winga provider.
  // The backend serves the latest cached snapshot (DB → in-memory → file)
  // and triggers background sync independently.
  const sources = [
    () => fetchLiveRates(branch),
    () => fetchCachedRates(branch),
  ]

  for (const fn of sources) {
    try {
      const result = await fn()
      if (result && result.rates && result.rates.length > 0) {
        return result
      }
      if (result && !lastError) {
        lastError = result.staleReason || null
      }
    } catch (err) {
      lastError = err.message || String(err)
    }
  }

  logDebug('all-cache-sources-exhausted', { error: lastError, branch })

  // No cached rates available from any backend source.  Return a controlled
  // empty response — the UI shows a loading state, and the backend's
  // background sync will populate the cache.  We do NOT fall back to a direct
  // provider call from the browser (that would expose provider credentials and
  // reintroduce cross-browser CORS/network inconsistencies).
  return {
    rates: [],
    stale: true,
    staleTimestamp: false,
    staleReason: lastError || 'No cached rates available — background sync in progress',
    providerTimestamp: null,
    source: 'unavailable',
  }
}

export { loadBranches, loadRates, normalizeRateData, loadCachedRates }

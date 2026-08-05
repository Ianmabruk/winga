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

const STALE_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour — rates should refresh every 15 seconds

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
  const raw = Array.isArray(data.message) ? data.message
    : (data.message && typeof data.message === 'object' && !Array.isArray(data.message))
      ? Object.values(data.message)
      : (Array.isArray(data) ? data : [])

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
      // Preference 1: canonical entry where currency_name === currency_code
      chosen = entries.find((e) =>
        String(e.currency_name || '').toUpperCase() === code
      )
      // Preference 2: canonical actual_name starting with the code
      if (!chosen) {
        chosen = entries.find((e) =>
          String(e.currency_actual_name || '').toUpperCase().startsWith(code)
        )
      }
      // Preference 3: highest buying_rate (most likely the standard, not old-denomination rate)
      if (!chosen) {
        chosen = entries.reduce(
          (best, e) => Number(e.buying_rate) > Number(best.buying_rate) ? e : best,
          entries[0],
        )
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
      const ageMin = Math.round((Date.now() - effDate.getTime()) / 60_000)
      console.warn(
        `[wingaForexService] Stale rate for ${code}: effective_date_and_time=${chosen.effective_date_and_time} (${ageMin} minutes old)`,
      )
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
    console.log('[wingaForexService] Live Winga rates loaded:', normalized.length, 'currencies for branch:', branch)
    if (staleTimestamp) {
      console.warn(
        '[wingaForexService] WARNING: Provider timestamp is outdated. ' +
          'Rates are current but the effective_date_and_time field is stale. ' +
          `Reason: ${staleReason}`,
      )
    }
  } else {
    console.warn('[wingaForexService] Winga API returned empty rates (message:[]) for branch:', branch)
  }

  return { rates: normalized, stale: isProviderStale, staleTimestamp, staleReason, providerTimestamp: data.providerTimestamp }
}

export { loadBranches, loadRates, normalizeRateData }

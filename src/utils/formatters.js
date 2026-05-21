/**
 * Formatting utilities for the Winga Forex Bureau application.
 */

/**
 * Format a TZS amount with comma separators.
 * e.g. 2700 → "2,700.00"
 */
export const formatTZS = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-TZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a rate with appropriate decimal places.
 * Rates < 1 get 4 dp, rates >= 1 get 2 dp.
 */
export const formatRate = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  const dp = value < 1 ? 4 : 2
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value)
}

/**
 * Format a generic currency amount.
 */
export const formatAmount = (value, currency = 'TZS', decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(decimals)}`
  }
}

/**
 * Format a datetime string from the API: "2026-05-21 11:01:50"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr.replace(' ', 'T'))
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format a time string from an ISO date for the "last updated" display.
 */
export const formatTime = (isoString) => {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return isoString
  }
}

/**
 * Calculate spread percentage between buy and sell.
 */
export const spreadPercent = (buy, sell) => {
  if (!buy || !sell || buy <= 0) return 0
  return ((sell - buy) / buy) * 100
}

/**
 * Debounce a function call.
 */
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

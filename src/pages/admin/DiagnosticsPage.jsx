import { useState } from 'react'
import { http } from '../../lib/http'

const WINGA_RATES_ENDPOINT =
  'https://forex.wingaforex.co.tz/api/method/forex_bureau.vsd_forex_bureau.doctype.branch.api.get_exchange_rates'

const STALE_THRESHOLD_MS = 60 * 60 * 1000
const DEFAULT_BRANCH = 'HEAD OFFICE'

const formatHeaders = (headers) => {
  if (!headers || typeof headers !== 'object') return []
  return Object.entries(headers).map(([k, v]) => ({
    key: k,
    value: Array.isArray(v) ? v.join(', ') : String(v),
  }))
}

const maskAuth = (headers) => {
  if (!headers || !headers.Authorization) return headers
  const auth = String(headers.Authorization)
  return { ...headers, Authorization: auth.slice(0, 20) + '...' }
}

const safeJson = (val) => {
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return String(val)
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

const isStale = (effDateStr) => {
  const d = parseEffectiveDate(effDateStr)
  if (!d) return true
  return Date.now() - d.getTime() > STALE_THRESHOLD_MS
}

const ageString = (effDateStr) => {
  const d = parseEffectiveDate(effDateStr)
  if (!d) return 'unknown'
  const ms = Date.now() - d.getTime()
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function DiagnosticsPage() {
  const [selectedBranch, setSelectedBranch] = useState(DEFAULT_BRANCH)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [expectedRates, setExpectedRates] = useState({ AED: 722 })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('currency_code')
  const [sortDir, setSortDir] = useState('asc')
  const [activeSection, setActiveSection] = useState('test')

  const runDiagnostics = async (branchName = selectedBranch) => {
    setIsTesting(true)
    setTestResults(null)

    const startTime = Date.now()
    const logs = []

    logs.push({
      timestamp: new Date().toISOString(),
      message: `Starting diagnostics for branch: ${branchName}`,
      type: 'info',
    })

    const ratesResult = await http
      .get('admin/diagnostics/winga-rates', {
        params: { branch_name: branchName },
      })
      .then((r) => ({ ok: true, status: r.status, statusText: r.statusText, data: r.data, headers: r.headers }))
      .catch((err) => ({
        ok: false,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        error: err.message,
      }))

    logs.push({
      timestamp: new Date().toISOString(),
      message: `Rates API responded: status=${ratesResult.status}, time=${ratesResult.data?.responseTimeMs || 'N/A'}ms`,
      type: ratesResult.ok ? 'info' : 'error',
    })

    const branchesResult = await http
      .get('admin/diagnostics/winga-branches')
      .then((r) => ({ ok: true, status: r.status, statusText: r.statusText, data: r.data, headers: r.headers }))
      .catch((err) => ({
        ok: false,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        error: err.message,
      }))

    logs.push({
      timestamp: new Date().toISOString(),
      message: `Branches API responded: status=${branchesResult.status}`,
      type: branchesResult.ok ? 'info' : 'error',
    })

    const totalTime = Date.now() - startTime
    logs.push({
      timestamp: new Date().toISOString(),
      message: `Diagnostics complete in ${totalTime}ms`,
      type: 'info',
    })

    setTestResults({
      branch: branchName,
      totalTime,
      logs,
      ratesResult,
      branchesResult,
    })
  }

  const extractRates = (testResults) => {
    if (!testResults?.ratesResult?.ok) return []
    const data = testResults.ratesResult.data
    if (!data?.data?.message) return []
    return data.data.message
  }

  const extractBranches = (testResults) => {
    if (!testResults?.branchesResult?.ok) return []
    const data = testResults.branchesResult.data
    if (!data?.data?.message) return []
    return data.data.message
  }

  const computeValidationIssues = (rates) => {
    const issues = []
    const seen = new Map()

    rates.forEach((r) => {
      const code = r.currency_code
      if (!code) {
        issues.push({ severity: 'high', message: 'Missing currency_code', raw: r })
        return
      }

      const buy = Number(r.buying_rate)
      const sell = Number(r.selling_rate)
      const seq = Number(r.currency_sequence)

      if (!(buy > 0)) {
        issues.push({
          severity: 'high',
          message: `${code}: Missing or invalid buying_rate (${r.buying_rate})`,
          currency: code,
        })
      }
      if (!(sell > 0)) {
        issues.push({
          severity: 'high',
          message: `${code}: Missing or invalid selling_rate (${r.selling_rate})`,
          currency: code,
        })
      }
      if (buy > 0 && sell > 0 && sell < buy) {
        issues.push({
          severity: 'medium',
          message: `${code}: Selling rate (${sell}) is lower than buying rate (${buy}) — inverted spread`,
          currency: code,
        })
      }
      if (r.effective_date_and_time == null) {
        issues.push({
          severity: 'medium',
          message: `${code}: Missing effective_date_and_time`,
          currency: code,
        })
      }
      if (isStale(r.effective_date_and_time)) {
        issues.push({
          severity: 'high',
          message: `${code}: Stale rate (effective: ${r.effective_date_and_time}, age: ${ageString(r.effective_date_and_time)})`,
          currency: code,
        })
      }
      if (seq === 0 || seq == null) {
        issues.push({
          severity: 'low',
          message: `${code}: currency_sequence is 0 or missing — sorting may be unreliable`,
          currency: code,
        })
      }

      if (seen.has(code)) {
        issues.push({
          severity: 'medium',
          message: `${code}: Duplicate currency entry detected`,
          currency: code,
        })
      } else {
        seen.set(code, true)
      }
    })

    const seqs = rates.map((r) => Number(r.currency_sequence)).filter((n) => n > 0)
    if (seqs.length > 1) {
      const sorted = [...seqs].sort((a, b) => a - b)
      if (JSON.stringify(seqs) !== JSON.stringify(sorted)) {
        issues.push({
          severity: 'low',
          message: `currency_sequence values are not in ascending order in API response`,
        })
      }
    }

    return issues
  }

  const computeFreshness = (rates) => {
    const serverTime = new Date()
    const effectiveDates = rates.map((r) => r.effective_date_and_time).filter(Boolean)
    const latestEffective = effectiveDates.sort().pop()
    const oldestEffective = effectiveDates.sort().shift()
    return {
      serverTime: serverTime.toISOString(),
      latestEffective,
      oldestEffective,
      allStale: rates.every((r) => isStale(r.effective_date_and_time)),
      staleCount: rates.filter((r) => isStale(r.effective_date_and_time)).length,
    }
  }

  const computeComparisons = (rates, expected) => {
    const results = []
    Object.entries(expected).forEach(([code, value]) => {
      const found = rates.find((r) => r.currency_code === code)
      if (found) {
        const buy = Number(found.buying_rate)
        const match = Math.abs(buy - value) < 0.01
        results.push({
          code,
          expected: value,
          actual: buy,
          match,
          diff: buy - value,
          diffPct: buy ? ((buy - value) / buy) * 100 : 0,
        })
      } else {
        results.push({ code, expected: value, actual: null, match: false, diff: null, diffPct: null })
      }
    })
    return results
  }

  const checkCache = () => {
    const findings = []
    if (typeof window !== 'undefined') {
      findings.push({
        name: 'Browser Cache-Control',
        status: 'Checked',
        detail: 'Frontend uses cache: "no-store" on all Winga API fetch calls',
      })
      findings.push({
        name: 'Service Worker',
        status: window.navigator?.serviceWorker?.controller ? 'Present' : 'Not Present',
        detail: window.navigator?.serviceWorker?.controller
          ? 'A service worker is registered and may cache responses'
          : 'No service worker is registered — no SW-level caching',
      })
      findings.push({
        name: 'LocalStorage',
        status: Object.keys(localStorage).length > 0 ? `${Object.keys(localStorage).length} keys` : 'Empty',
        detail: Object.keys(localStorage)
          .filter((k) => k.toLowerCase().includes('rate') || k.toLowerCase().includes('cache') || k.toLowerCase().includes('forex'))
          .join(', ') || 'No rate/cache-related keys found',
      })
      findings.push({
        name: 'SessionStorage',
        status: Object.keys(sessionStorage).length > 0 ? `${Object.keys(sessionStorage).length} keys` : 'Empty',
        detail: Object.keys(sessionStorage)
          .filter((k) => k.toLowerCase().includes('rate') || k.toLowerCase().includes('cache'))
          .join(', ') || 'No rate/cache-related keys found',
      })
      findings.push({
        name: 'Application Cache',
        status: typeof window.applicationCache !== 'undefined' ? window.applicationCache.status.toString() : 'N/A',
        detail: 'HTML5 AppCache API status (0=uncached, 1=idle, 2=checking, 3=downloading, 4=updateready, 5=obsolete)',
      })
      findings.push({
        name: 'Cookie Cache',
        status: document.cookie ? 'Present' : 'None',
        detail: `Cookies: ${document.cookie ? document.cookie.slice(0, 100) : 'none'}`,
      })
    }
    return findings
  }

  const rates = extractRates(testResults)
  const branches = extractBranches(testResults)
  const validationIssues = testResults ? computeValidationIssues(rates) : []
  const freshness = testResults ? computeFreshness(rates) : null
  const comparisons = testResults ? computeComparisons(rates, expectedRates) : []
  const cacheFindings = testResults ? checkCache() : []

  const filteredRates = rates.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.currency_code?.toLowerCase().includes(q) ||
      (r.currency_name || '').toLowerCase().includes(q) ||
      (r.currency_actual_name || '').toLowerCase().includes(q) ||
      String(r.buying_rate || '').includes(q)
    )
  })

  const sortedRates = [...filteredRates].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    if (sortField === 'buying_rate' || sortField === 'selling_rate') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const copyReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      branch: selectedBranch,
      totalTimeMs: testResults?.totalTime,
      api: testResults?.ratesResult?.data
        ? {
            status: testResults.ratesResult.status,
            responseTime: testResults.ratesResult.data?.responseTimeMs,
            requestUrl: testResults.ratesResult.data?.requestUrl,
          }
        : null,
      serverTime: freshness?.serverTime,
      latestEffectiveDate: freshness?.latestEffective,
      rates: rates.map((r) => ({
        code: r.currency_code,
        buy: r.buying_rate,
        sell: r.selling_rate,
        eff: r.effective_date_and_time,
        seq: r.currency_sequence,
      })),
      validationIssues,
      comparisons,
      cacheFindings,
      logs: testResults?.logs,
    }
    const text = safeJson(report)
    navigator.clipboard.writeText(text).then(() => {
      alert('Debug report copied to clipboard!')
    })
  }

  const renderSummary = () => {
    if (!testResults) {
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">No tests run yet. Click "Test API" to begin diagnostics.</p>
        </div>
      )
    }

    const apiReachable = testResults.ratesResult?.ok && testResults.ratesResult?.status === 200
    const authSuccess = testResults.ratesResult?.status !== 403
    const branchFound = branches.length > 0
    const branchMatches = branches.some((b) => b.branch_name === selectedBranch)

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">API Reachable</p>
          <p className={`text-2xl font-bold ${apiReachable ? 'text-emerald-600' : 'text-rose-600'}`}>
            {apiReachable ? 'Yes' : 'No'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Status: {testResults.ratesResult?.status || 'N/A'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Authentication</p>
          <p className={`text-2xl font-bold ${authSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
            {authSuccess ? 'Success' : 'Failed'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Time: {testResults.ratesResult?.data?.responseTimeMs || 'N/A'}ms</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Branch Found</p>
          <p className={`text-2xl font-bold ${branchFound ? 'text-emerald-600' : 'text-rose-600'}`}>
            {branchFound ? branches.length : 0} branches
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Match: {branchMatches ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Data Freshness</p>
          <p className={`text-2xl font-bold ${freshness?.allStale ? 'text-amber-600' : 'text-emerald-600'}`}>
            {freshness?.allStale ? 'Stale' : freshness?.staleCount > 0 ? 'Partial' : 'Fresh'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {freshness?.staleCount}/{rates.length} stale ({ageString(freshness?.oldestEffective) || 'N/A'})
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Forex API Diagnostics</h1>
          <p className="mt-1 text-sm text-slate-600">
            Test Winga Forex Bureau API connectivity, validate rates, and identify data issues.
          </p>
        </div>
        <button
          onClick={() => runDiagnostics(selectedBranch)}
          disabled={isTesting}
          className="inline-flex items-center gap-2 rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-skybrand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTesting ? 'Testing...' : 'Test API'}
        </button>
      </div>

      {/* Branch selector */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            {branches.length > 0 ? (
              branches.map((b) => (
                <option key={b.branch_name} value={b.branch_name}>
                  {b.branch_name} {b.branch_abbr ? `(${b.branch_abbr})` : ''}
                </option>
              ))
            ) : (
              <option value={DEFAULT_BRANCH}>{DEFAULT_BRANCH}</option>
            )}
          </select>
        </div>
        <button
          onClick={() => runDiagnostics(selectedBranch)}
          disabled={isTesting}
          className="rounded-xl border border-skybrand-300 bg-skybrand-50 px-4 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-100"
        >
          Test This Branch
        </button>
        <button
          onClick={() => {
            const branchesText = JSON.stringify(branches, null, 2)
            navigator.clipboard.writeText(branchesText)
            alert('Branches copied to clipboard')
          }}
          disabled={!branches.length}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Copy Branches
        </button>
      </div>

      {/* Summary cards */}
      {testResults && renderSummary()}

      {/* Tabs */}
      {testResults && (
        <div className="flex gap-2 border-b border-slate-200">
          {['test', 'currencies', 'validation', 'comparison', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-4 py-2 text-sm font-semibold ${
                activeSection === tab
                  ? 'border-b-2 border-skybrand-500 text-skybrand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'test' && 'API Test Details'}
              {tab === 'currencies' && 'Currency Table'}
              {tab === 'validation' && 'Validation Issues'}
              {tab === 'comparison' && 'Rate Comparison'}
              {tab === 'logs' && 'Debug Log'}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {testResults && activeSection === 'test' && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-bold text-slate-800">Request Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-600">Request URL:</span>
                <span className="ml-2 font-mono text-slate-900 break-all">{testResults.ratesResult?.data?.requestUrl || WINGA_RATES_ENDPOINT}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Response Status:</span>
                <span className="ml-2">{testResults.ratesResult?.status} {testResults.ratesResult?.statusText}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Response Time:</span>
                <span className="ml-2">{testResults.ratesResult?.data?.responseTimeMs || 'N/A'}ms</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Branch Requested:</span>
                <span className="ml-2">{selectedBranch}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-bold text-slate-800">Request Headers (credentials hidden)</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2">Header</th>
                  <th className="border-b border-slate-200 px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {formatHeaders(maskAuth(testResults.ratesResult?.data?.requestHeaders)).map((h) => (
                  <tr key={h.key}>
                    <td className="px-3 py-1 font-mono text-slate-600">{h.key}</td>
                    <td className="px-3 py-1 font-mono text-slate-900">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Response Headers</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2">Header</th>
                  <th className="border-b border-slate-200 px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {formatHeaders(testResults.ratesResult?.headers || {}).map((h) => (
                  <tr key={h.key}>
                    <td className="px-3 py-1 font-mono text-slate-600">{h.key}</td>
                    <td className="px-3 py-1 font-mono text-slate-900 break-all">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-bold text-slate-800">Raw JSON Response</h3>
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300">
              {safeJson(testResults.ratesResult?.data?.data || testResults.ratesResult?.data || 'No data')}
            </pre>
          </div>
        </div>
      )}

      {testResults && activeSection === 'currencies' && (
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currencies..."
                className="w-64 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="text-sm text-slate-600">
              Showing {sortedRates.length} of {rates.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    { key: 'currency_code', label: 'Currency Code' },
                    { key: 'currency_name', label: 'Currency Name' },
                    { key: 'buying_rate', label: 'Buying Rate' },
                    { key: 'selling_rate', label: 'Selling Rate' },
                    { key: 'currency_sequence', label: 'Sequence' },
                    { key: 'effective_date_and_time', label: 'Effective Date' },
                    { key: 'branch_name', label: 'Branch' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 whitespace-nowrap cursor-pointer select-none"
                      onClick={() => {
                        if (sortField === col.key) {
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                        } else {
                          setSortField(col.key)
                          setSortDir('asc')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.key && (
                          <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRates.map((r, idx) => {
                  const stale = isStale(r.effective_date_and_time)
                  return (
                    <tr
                      key={`${r.currency_code}_${idx}`}
                      className={`border-b border-slate-100 last:border-none ${
                        stale ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-medium">{r.currency_code || <span className="text-rose-500">MISSING</span>}</td>
                      <td className="px-4 py-2">{r.currency_name || r.currency_actual_name || '—'}</td>
                      <td
                        className={`px-4 py-2 font-mono ${
                          Number(r.buying_rate) <= 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {r.buying_rate ?? <span className="text-rose-500">MISSING</span>}
                      </td>
                      <td
                        className={`px-4 py-2 font-mono ${
                          Number(r.selling_rate) <= 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {r.selling_rate ?? <span className="text-rose-500">MISSING</span>}</td>
                      <td className="px-4 py-2">{r.currency_sequence ?? '—'}</td>
                      <td className={`px-4 py-2 ${stale ? 'text-amber-700 font-medium' : 'text-slate-700'}`}>
                        {r.effective_date_and_time || <span className="text-rose-500">MISSING</span>}
                        {stale && <span className="ml-2 rounded bg-amber-200 px-2 py-0.5 text-xs font-bold">STALE</span>}
                      </td>
                      <td className="px-4 py-2">{r.branch_name || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {testResults && activeSection === 'validation' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Validation Issues ({validationIssues.length})</h3>
          <div className="rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2">Severity</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Currency</th>
                </tr>
              </thead>
              <tbody>
                {validationIssues.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-slate-500">
                      No validation issues found
                    </td>
                  </tr>
                ) : (
                  validationIssues.map((issue, idx) => (
                    <tr
                      key={idx}
                      className={
                        issue.severity === 'high'
                          ? 'bg-rose-50 border-b border-slate-100'
                          : issue.severity === 'medium'
                            ? 'bg-amber-50 border-b border-slate-100'
                            : 'border-b border-slate-100'
                      }
                    >
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${
                            issue.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : issue.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {issue.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2">{issue.message}</td>
                      <td className="px-4 py-2">{issue.currency || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-bold text-slate-800">Data Freshness Report</h3>
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-medium text-slate-600">Current Server Time:</span>
                <span className="ml-2 font-mono">{freshness?.serverTime}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Latest effective_date_and_time from API:</span>
                <span className="ml-2 font-mono">{freshness?.latestEffective || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Oldest effective_date_and_time from API:</span>
                <span className="ml-2 font-mono">{freshness?.oldestEffective || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">All rates stale (&gt;1hr old):</span>
                <span className={`ml-2 font-bold ${freshness?.allStale ? 'text-amber-700' : 'text-emerald-600'}`}>
                  {freshness?.allStale ? 'YES — API is serving stale data' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Stale threshold:</span>
                <span className="ml-2 text-slate-600">{STALE_THRESHOLD_MS / 3600000} hour(s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {testResults && activeSection === 'comparison' && (
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600">Expected Rates</label>
              <textarea
                value={Object.entries(expectedRates)
                  .map(([k, v]) => `${k}=${v}`)
                  .join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.trim().split('\n')
                  const parsed = {}
                  lines.forEach((line) => {
                    const [k, v] = line.split('=')
                    if (k && v) parsed[k.trim().toUpperCase()] = Number(v.trim())
                  })
                  setExpectedRates(parsed)
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm"
                rows={4}
                placeholder="AED=722&#10;USD=2640&#10;EUR=2980"
              />
            </div>
            <button
              onClick={copyReport}
              className="self-end rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Copy Debug Report
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2">Currency</th>
                <th className="px-4 py-2">Expected</th>
                <th className="px-4 py-2">Actual (buy)</th>
                <th className="px-4 py-2">Match</th>
                <th className="px-4 py-2">Difference</th>
                <th className="px-4 py-2">% Diff</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => (
                <tr
                  key={c.code}
                  className={c.match ? 'bg-emerald-50' : 'bg-rose-50'}
                >
                  <td className="px-4 py-2 font-bold">{c.code}</td>
                  <td className="px-4 py-2">{c.expected}</td>
                  <td className={`px-4 py-2 font-mono ${c.match ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {c.actual ?? 'MISSING'}
                  </td>
                  <td className="px-4 py-2">
                    {c.match ? (
                      <span className="text-emerald-600 font-bold">✓ Match</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✗ Mismatch</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono">{c.diff ?? 'N/A'}</td>
                  <td className="px-4 py-2">{c.diffPct != null ? `${c.diffPct.toFixed(2)}%` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {comparisons.some((c) => !c.match) && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h3 className="font-bold text-rose-800">Rate Mismatch Analysis</h3>
              <p className="mt-1 text-sm text-rose-700">
                The following currencies do not match expected values. Since our backend proxy
                passes Winga API data through unchanged, if the API returns an incorrect rate,
                the issue originates at the Winga Frappe system — not in our frontend or backend.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
                {comparisons.filter((c) => !c.match).map((c) => (
                  <li key={c.code}>
                    {c.code}: API returns {c.actual} but expected {c.expected} (diff: {c.diff ?? 'N/A'})
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium text-rose-800">
                Root cause is likely: stale Winga Frappe cache, failed rate sync job, or
                incorrect rate values in the Winga database.
              </p>
            </div>
          )}
        </div>
      )}

      {testResults && activeSection === 'logs' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Diagnostic Log</h3>
          <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
            {testResults.logs.map((log, idx) => (
              <div key={idx} className={log.type === 'error' ? 'text-rose-400' : log.type === 'info' ? 'text-emerald-400' : 'text-amber-400'}>
                [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-bold text-slate-800">Cache Check Results</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left">Cache Layer</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {cacheFindings.map((c, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2 text-slate-600">{c.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiagnosticsPage

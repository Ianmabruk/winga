import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FiEdit3, FiRefreshCw, FiClock, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { http } from '../../lib/http'
import { useForexStore } from '../../store/useForexStore'
import { useBranches } from '../../hooks/useBranches'
import { useRates } from '../../hooks/useRates'
import { formatRate, formatTime, formatDateTime, spreadPercent } from '../../utils/formatters'
import BuySellTabs from '../../components/BuySellTabs'
import Flag from '../../components/Flag'
import Seo from '../../components/Seo'

export default function RatesPage() {
  const queryClient = useQueryClient()
  const { ratesData, lastUpdated, previousRatesMap, rateView, setRateView, staleData } = useForexStore()
  const { refetch, isFetching, isError } = useRates()
  useBranches()

  const availableCodes = ratesData?.map((r) => r.currency_code) || []
  const [selectedCode, setSelectedCode] = useState(availableCodes[0] || 'USD')
  const [editingRate, setEditingRate] = useState(null)

  const currentRate = ratesData?.find((r) => r.currency_code === selectedCode)

  const historyQuery = useQuery({
    queryKey: ['admin-rates-history'],
    queryFn: async () => (await http.get('rates/history')).data.history,
  })

  const updateMutation = useMutation({
    mutationFn: async (values) =>
      http.put('rates', {
        rates: {
          [values.code]: {
            buy: Number(values.buy),
            sell: Number(values.sell),
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rates-history'] })
      queryClient.invalidateQueries({ queryKey: ['rates'] })
      refetch()
      setEditingRate(null)
    },
  })

  const handleEdit = (rate) => {
    setEditingRate({
      code: rate.currency_code,
      buy: rate.buying_rate,
      sell: rate.selling_rate,
    })
  }

  const handleSave = () => {
    if (!editingRate) return
    updateMutation.mutate({ code: editingRate.code, buy: editingRate.buy, sell: editingRate.sell })
  }

  const computeTrend = (rate) => {
    const prev = previousRatesMap[rate.currency_code]
    if (!prev) return { direction: 'neutral', pct: 0 }

    const curr = Number(rateView === 'buy' ? rate.buying_rate : rate.selling_rate)
    const oldVal = Number(rateView === 'buy' ? prev.buying_rate : prev.selling_rate)

    if (curr === oldVal || oldVal === 0) return { direction: 'neutral', pct: 0 }

    const pct = Math.abs(((curr - oldVal) / oldVal) * 100)
    return { direction: curr > oldVal ? 'up' : 'down', pct }
  }

  return (
    <>
      <Seo
        title="Rates Dashboard | Admin | Winga Forex Bureau"
        description="Live rates dashboard — raw Winga API rates with buy/sell views, trend indicators, and publish controls."
        path="/admin/rates"
      />

      <div className="grid gap-6">
        <article className="rounded-[28px] border border-white/50 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-navysoft">Rates Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">Raw live rates from Winga API — buy/sell views with trend tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                <FiClock size={12} />
                {lastUpdated ? formatTime(lastUpdated) : 'Loading...'}
              </div>
              {isFetching && (
                <div className="inline-flex items-center gap-2 rounded-full border border-skybrand-200 bg-skybrand-50 px-3 py-1.5 text-xs font-medium text-skybrand-700">
                  <FiRefreshCw size={12} className="animate-spin" />
                  Refreshing
                </div>
              )}
               {staleData && (
                 <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                   <FiAlertCircle size={12} />
                   Stale
                 </div>
               )}
            </div>
          </div>

          {isError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Live rates unavailable. Showing last known data.
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="currency-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Edit Currency:
              </label>
              <select
                id="currency-select"
                value={selectedCode}
                onChange={(e) => { setSelectedCode(e.target.value); setEditingRate(null) }}
                className="rounded-xl border border-skybrand-200 px-3 py-2 text-sm text-navysoft focus:outline-none focus:ring-2 focus:ring-skybrand-400"
              >
                {availableCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <BuySellTabs value={rateView} onChange={setRateView} />
            </div>
          </div>

          {currentRate && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">Currency</p>
                <p className="mt-1 flex items-center gap-2 font-bold text-navysoft">
                  <Flag code={currentRate.currency_code} size="sm" />
                  {currentRate.currency_code}
                </p>
                <p className="mt-1 text-xs text-slate-500">{currentRate.currency_actual_name}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">Buy Rate (TZS)</p>
                <p className="mt-1 font-display text-2xl font-bold text-navysoft">{formatRate(currentRate.buying_rate)}</p>
                <p className="mt-1 text-xs text-slate-500">What we pay you</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">Sell Rate (TZS)</p>
                <p className="mt-1 font-display text-2xl font-bold text-navysoft">{formatRate(currentRate.selling_rate)}</p>
                <p className="mt-1 text-xs text-slate-500">What you pay us</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">Spread</p>
                <p className="mt-1 font-display text-2xl font-bold text-navysoft">{spreadPercent(currentRate.buying_rate, currentRate.selling_rate).toFixed(2)}%</p>
                <button
                  onClick={() => {
                    if (editingRate?.code === currentRate.currency_code) {
                      setEditingRate(null)
                    } else {
                      handleEdit(currentRate)
                    }
                  }}
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    editingRate?.code === currentRate.currency_code
                      ? 'border border-amber-300 bg-amber-50 text-amber-700'
                      : 'border border-skybrand-200 bg-white text-navysoft hover:bg-skybrand-50'
                  }`}
                >
                  {editingRate?.code === currentRate.currency_code ? 'Cancel Edit' : <><FiEdit3 size={12} /> Edit Rate</>}
                </button>
              </div>
            </div>
          )}

          {editingRate && editingRate.code === currentRate?.currency_code && (
            <div className="mb-6 rounded-[22px] border border-skybrand-200 bg-skybrand-50/50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-navysoft">Publish New Rates for {editingRate.code}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Buy</label>
                  <input
                    type="number"
                    step="any"
                    value={editingRate.buy}
                    onChange={(e) => setEditingRate((prev) => ({ ...prev, buy: e.target.value }))}
                    className="mt-1 w-full rounded-xl border-2 border-skybrand-200 px-3 py-2 text-sm focus:border-skybrand-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Sell</label>
                  <input
                    type="number"
                    step="any"
                    value={editingRate.sell}
                    onChange={(e) => setEditingRate((prev) => ({ ...prev, sell: e.target.value }))}
                    className="mt-1 w-full rounded-xl border-2 border-skybrand-200 px-3 py-2 text-sm focus:border-skybrand-600 focus:outline-none"
                  />
                </div>
                <div>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="w-full rounded-xl bg-skybrand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-skybrand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateMutation.isPending ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </div>
              {updateMutation.isSuccess && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                  <FiCheck size={14} />
                  Rates published and broadcast to all clients.
                </div>
              )}
            </div>
          )}

          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">All Live Rates ({ratesData.length})</h3>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              <span className={`h-2 w-2 rounded-full ${staleData ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {staleData ? 'Stale data' : 'Live data'}
            </div>
          </div>

          <div className="overflow-x-auto rounded-[22px] border border-white/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <table className="w-full min-w-[760px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${rateView === 'buy' ? 'text-skybrand-700' : 'text-slate-400'}`}>Buy (TZS)</th>
                  <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${rateView === 'sell' ? 'text-skybrand-700' : 'text-slate-400'}`}>Sell (TZS)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trend</th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Spread</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
                </tr>
              </thead>
              <tbody>
                {(ratesData || []).map((row, index) => {
                  const trend = computeTrend(row)
                  const spread = spreadPercent(row.buying_rate, row.selling_rate)

                  return (
                    <tr
                      key={`${row.currency_code}_${index}`}
                      className={`border-b border-slate-50/50 last:border-none transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-skybrand-50/30`}
                    >
                      <td className="px-3 py-4">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Flag code={row.currency_code} size="md" />
                          <span className="font-bold text-navysoft">{row.currency_code}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">
                        <span className="block max-w-[180px] break-words leading-5">{row.currency_actual_name}</span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <span className={`inline-block font-semibold whitespace-nowrap ${rateView === 'buy' ? 'text-lg text-skybrand-700' : 'text-navysoft'}`}>
                          {formatRate(row.buying_rate)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <span className={`inline-block font-semibold whitespace-nowrap ${rateView === 'sell' ? 'text-lg text-skybrand-700' : 'text-navysoft'}`}>
                          {formatRate(row.selling_rate)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        {trend.direction === 'up' && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700">
                            <FiTrendingUp size={10} /> +{trend.pct.toFixed(2)}%
                          </span>
                        )}
                        {trend.direction === 'down' && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-700">
                            <FiTrendingDown size={10} /> -{trend.pct.toFixed(2)}%
                          </span>
                        )}
                        {trend.direction === 'neutral' && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-3 py-4 text-right text-sm text-slate-500">
                        {spread.toFixed(2)}%
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{row.source || 'winga-live'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/50 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-navysoft">Rate History</h2>
              <p className="mt-1 text-sm text-slate-500">Last 500 rate changes from database</p>
            </div>
            <button
              onClick={() => historyQuery.refetch()}
              disabled={historyQuery.isFetching}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navysoft hover:bg-skybrand-50"
            >
              <FiRefreshCw size={12} className={historyQuery.isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto rounded-[22px] border border-white/80 bg-white/50">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Buy</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Sell</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Effective</th>
                </tr>
              </thead>
              <tbody>
                {(historyQuery.data || []).map((row, index) => (
                  <tr key={`${row.currency_code}_${index}`} className="border-b border-slate-100/50 last:border-none">
                    <td className="px-4 py-3 font-medium text-navysoft">{row.currency_code}</td>
                    <td className="px-4 py-3 text-slate-600">{row.currency_actual_name || row.currency_name}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{row.buying_rate}</td>
                    <td className="px-4 py-3 text-right text-skybrand-700">{row.selling_rate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        row.source === 'admin-published'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {row.source === 'admin-published' ? <FiCheck size={10} /> : null}
                        {row.source || 'winga-live'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{formatTime(row.updated_at)}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{formatDateTime(row.effective_date_and_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {historyQuery.isFetching && (
              <div className="p-8 text-center text-slate-400">Loading history...</div>
            )}

            {historyQuery.data?.length === 0 && !historyQuery.isFetching && (
              <div className="p-8 text-center text-slate-500">No rate history available.</div>
            )}
          </div>
        </article>
      </div>
    </>
  )
}

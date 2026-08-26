import { useMemo, useState } from 'react'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import BranchSelector from '../components/BranchSelector'
import ForexCalculatorPanel from '../components/ForexCalculatorPanel'
import Flag from '../components/Flag'
import BuySellTabs from '../components/BuySellTabs'
import RateCard from '../components/RateCard'
import RatesDataTable from '../components/RatesDataTable'
import { CurrencyCardSkeleton } from '../components/LoadingSkeleton'
import { formatDateTime, formatTime } from '../utils/formatters'
import Seo from '../components/Seo'

export default function LiveRatesPage() {
  const { isFetching, isError } = useRates()
  const { rateView, setRateView, searchQuery, ratesData, staleData, providerTimestamp } = useForexStore()
  const [searchText, setSearchText] = useState('')

  const displayRates = useMemo(() => {
    const data = ratesData || []
    const query = (searchQuery || '').trim().toLowerCase()
    const text = searchText.trim().toLowerCase()

    return data.filter((rate) => {
      const code = (rate.currency_code || '').toLowerCase()
      const name = (rate.currency_actual_name || '').toLowerCase()
      return code.includes(query) || code.includes(text) || name.includes(query) || name.includes(text)
    })
  }, [ratesData, searchQuery, searchText])

  const computeDelta = (field) => {
    if (!displayRates.length) return 0
    const total = displayRates.reduce((sum, r) => sum + Number(r[field] || 0), 0)
    return displayRates.length > 0 ? total / displayRates.length : 0
  }

  const buyDelta = computeDelta('buying_rate')
  const sellDelta = computeDelta('selling_rate')

  return (
    <>
      <Seo
        title="Live Forex Rates | Winga Forex Bureau"
        description="Real-time exchange rates for USD, EUR, GBP, ZAR, JPY and more. Buy and sell rates updated live."
        canonical="https://winga.forex/rates"
      />

      <section className="pt-safe pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-3">
              <Flag code="USD" size="lg" />
              <span className="text-2xl font-extrabold text-navysoft sm:text-3xl">Live Exchange Rates</span>
              <Flag code="EUR" size="lg" />
            </div>
            <p className="text-slate-500">
              Updated: {providerTimestamp ? formatTime(providerTimestamp) : formatDateTime(new Date().toISOString())}
              {staleData && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Stale
                </span>
              )}
            </p>
          </div>

          <div className="mb-6">
            <BranchSelector />
          </div>

          <div className="mb-6">
            <BuySellTabs value={rateView} onChange={setRateView} buyDelta={buyDelta} sellDelta={sellDelta} />
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search currency (e.g. USD, EUR)..."
                className="w-full rounded-[18px] border-2 border-skybrand-200 px-5 py-3 pl-11 text-base text-navysoft placeholder-slate-400 transition-colors focus:border-skybrand-500 focus:outline-none focus:ring-0"
                aria-label="Search currencies"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M9.5 17A7.5 7.5 0 109.5 2.5 7.5 7.5 0 009.5 17z"
                />
              </svg>
            </div>
          </div>

          {isError && (
            <div className="mb-6 rounded-[18px] border border-red-200 bg-red-50 p-4 text-center text-red-800">
              Unable to load live rates. Please try again later.
            </div>
          )}

          {isFetching && !ratesData.length && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CurrencyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {displayRates.length === 0 && !isFetching && !isError && (
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 py-12 text-center text-slate-500">
              No currencies match your search.
            </div>
          )}

          <div className="hidden lg:block">
            {displayRates.length > 0 ? (
              <RatesDataTable data={displayRates} rateView={rateView} />
            ) : (
              <div className="overflow-x-auto rounded-[22px] border border-white/80 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                <table className="w-full min-w-[680px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Currency</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Buy (TZS)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Sell (TZS)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Trend</th>
                      <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Spread</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-sm text-slate-500">
                        {isFetching ? 'Loading live rates...' : isError ? 'Live rates temporarily unavailable. Please try again later.' : 'No currencies match your search.'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayRates.map((rate) => (
                <RateCard key={rate.currency_code} rate={rate} />
              ))}
              {isFetching &&
                Array.from({ length: 4 }).map((_, i) => (
                  <CurrencyCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
          </div>

          <div className="mt-12">
            <ForexCalculatorPanel />
          </div>
        </div>
      </section>
    </>
  )
}

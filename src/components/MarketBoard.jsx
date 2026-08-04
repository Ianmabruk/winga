/**
 * MarketBoard — compact rates card grid used on the HomePage.
 * Uses real Winga API data. Shows all available currencies.
 */
import { lazy, Suspense } from 'react'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { getFlagUrl, getCurrencyBadge } from '../data/flags'
import { formatRate } from '../utils/formatters'

const SparklineChart = lazy(() => import('./SparklineChart'))

export default function MarketBoard({ limit = 8 }) {
  const { isLoading, isError } = useRates()
  const { ratesData, lastUpdated } = useForexStore()

  // Show all rates data - with optional limit for homepage preview
  const visibleRates = ratesData.length > 0 ? ratesData.slice(0, limit) : []
  const hasData = visibleRates.length > 0

  return (
    <div className="grid gap-5">
      {isError && !hasData && (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Unable to load live rates. Please check your connection.
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading && !hasData
          ? Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="glass-surface rounded-2xl p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-3 h-6 w-20 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-1 h-4 w-16 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-3 h-14 animate-pulse rounded bg-skybrand-100" />
              </article>
            ))
          : visibleRates.map((rate) => (
              <article
                key={rate.currency_code}
                className="glass-surface rounded-2xl p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={getFlagUrl(rate.currency_code) || getCurrencyBadge(rate.currency_code)}
                      alt={rate.currency_code}
                      className="h-4 w-6 rounded-sm object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = getCurrencyBadge(rate.currency_code) }}
                    />
                    <span className="text-sm font-bold text-slate-900">
                      {rate.currency_code}/TZS
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-green-50 px-2 py-1.5">
                    <p className="text-green-700 font-semibold">BUY</p>
                    <p className="font-bold text-slate-900 text-sm">{formatRate(rate.buying_rate)}</p>
                  </div>
                  <div className="rounded-lg bg-sky-50 px-2 py-1.5">
                    <p className="text-sky-700 font-semibold">SELL</p>
                    <p className="font-bold text-sm text-slate-900">{formatRate(rate.selling_rate)}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <Suspense fallback={<div className="h-14 animate-pulse rounded bg-skybrand-50" />}>
                    <SparklineChart up={true} value={rate.selling_rate || 1} />
                  </Suspense>
                </div>

                <p className="mt-1 text-[0.67rem] text-slate-400">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
                </p>
              </article>
            ))}
      </div>
    </div>
  )
}
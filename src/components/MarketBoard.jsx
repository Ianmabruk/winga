/**
 * MarketBoard — compact rates card grid used on the HomePage.
 * Uses real Winga API data. Shows top 6 currencies as cards.
 */
import { lazy, Suspense, useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { getFlagUrl } from '../data/flags'
import { formatRate, spreadPercent } from '../utils/formatters'

const SparklineChart = lazy(() => import('./SparklineChart'))

export default function MarketBoard({ detailed = false }) {
  const { isLoading, isError } = useRates()
  const { ratesData, previousRatesMap, lastUpdated, changedCurrencies } = useForexStore()

  // Show first 6 currencies from the sorted API data (or all if detailed)
  const cards = useMemo(() => {
    const visible = detailed ? ratesData : ratesData.slice(0, 8)
    return visible.map((rate) => {
      const prev = previousRatesMap[rate.currency_code]
      const spread = spreadPercent(rate.buying_rate, rate.selling_rate)
      const changed = changedCurrencies.includes(rate.currency_code)
      const sellUp = prev && rate.selling_rate > prev.selling_rate
      const sellDown = prev && rate.selling_rate < prev.selling_rate
      return { rate, prev, spread, changed, sellUp, sellDown }
    })
  }, [ratesData, previousRatesMap, changedCurrencies, detailed])

  const hasData = cards.length > 0

  return (
    <div className="grid gap-5">
      {isError && !hasData && (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Unable to load live rates. Showing cached data.
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
          : cards.map(({ rate, changed, sellUp, sellDown }) => (
              <article
                key={rate.currency_code}
                className={`glass-surface rounded-2xl p-4 transition-all ${
                  changed ? 'ring-1 ring-skybrand-400 shadow-[0_0_14px_rgba(37,99,235,0.15)]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={getFlagUrl(rate.currency_code)}
                      alt={rate.currency_code}
                      className="h-4 w-6 rounded-sm object-cover"
                      loading="lazy"
                    />
                    <span className="text-sm font-bold text-slate-900">
                      {rate.currency_code}/TZS
                    </span>
                  </div>
                  {(sellUp || sellDown) && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                      sellUp ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {sellUp ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-green-50 px-2 py-1.5">
                    <p className="text-green-700 font-semibold">BUY</p>
                    <p className="font-bold text-slate-900 text-sm">{formatRate(rate.buying_rate)}</p>
                  </div>
                  <div className="rounded-lg bg-sky-50 px-2 py-1.5">
                    <p className="text-sky-700 font-semibold">SELL</p>
                    <p className={`font-bold text-sm ${
                      sellUp ? 'text-green-600' : sellDown ? 'text-red-500' : 'text-slate-900'
                    }`}>{formatRate(rate.selling_rate)}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <Suspense fallback={<div className="h-14 animate-pulse rounded bg-skybrand-50" />}>
                    <SparklineChart up={!sellDown} value={rate.selling_rate || 1} />
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

export default function MarketBoard({ detailed = false }) {
  const { isLoading, isError } = useRates()
  const { rates, lastUpdated } = useForexStore()
  const [selectedSymbol, setSelectedSymbol] = useState('FX_IDC:USDKES')
  const [chartFailed, setChartFailed] = useState(false)

  const cards = useMemo(
    () =>
      pairs.map((base) => {
        const buy = rates[base]?.buy || 0
        const sell = rates[base]?.sell || 0
        const move = movementFromRates(buy, sell)
        return { base, buy, sell, move }
      }),
    [rates],
  )

  const hasValidRates = cards.some((card) => card.buy > 0 || card.sell > 0)

  return (
    <div className="grid gap-5">
      {isError || !hasValidRates ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Live provider data is temporarily unstable. Showing fallback rates while we reconnect.
        </article>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <article key={`skeleton-${idx}`} className="glass-surface rounded-2xl p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-3 h-3 w-16 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-skybrand-100" />
                <div className="mt-4 h-14 animate-pulse rounded bg-skybrand-100" />
              </article>
            ))
          : cards.map((card) => {
          const up = card.move >= 0
          return (
            <article key={card.base} className="glass-surface rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <img src={currencyFlags[card.base]} alt={`${card.base} flag`} className="h-4 w-6 rounded object-cover" loading="lazy" />
                  {card.base}/KES
                </p>
                <span className={up ? 'inline-flex items-center gap-1 text-xs font-semibold text-market-up' : 'inline-flex items-center gap-1 text-xs font-semibold text-market-down'}>
                  {up ? <FaArrowTrendUp /> : <FaArrowTrendDown />} {card.move.toFixed(2)}%
                </span>
              </div>

              <div className="mt-3 grid gap-1 text-sm">
                <p>Buy: <span className="font-semibold">{card.buy.toFixed(4)}</span></p>
                <p>Sell: <span className="font-semibold">{card.sell.toFixed(4)}</span></p>
              </div>

              <div className="mt-3 h-16">
                <Suspense fallback={<div className="h-full animate-pulse rounded bg-skybrand-100/70" />}>
                  <SparklineChart up={up} value={card.sell || 1} />
                </Suspense>
              </div>

              <p className="text-[0.68rem] text-slate-500">Updated {new Date(lastUpdated).toLocaleTimeString()}</p>
              <button
                onClick={() => setSelectedSymbol(`FX_IDC:${card.base}KES`)}
                className="mt-2 rounded-lg border border-skybrand-200 bg-skybrand-50 px-2 py-1 text-xs font-semibold text-slate-700"
              >
                Open chart
              </button>
            </article>
          )
        })}
      </div>

      {detailed ? (
        <div className="glass-surface rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">TradingView Live Candlestick</p>
          <div className="h-[380px]">
            {chartFailed ? (
              <div className="grid h-full place-items-center rounded-xl border border-skybrand-100 bg-white text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Chart unavailable right now</p>
                  <p className="mt-1 text-xs text-slate-600">Provider blocked or network restricted. Try refreshing shortly.</p>
                </div>
              </div>
            ) : (
              <iframe
                title="TradingView Widget"
                src={`https://s.tradingview.com/widgetembed/?symbol=${selectedSymbol}&interval=15&theme=light&style=1&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart`}
                className="h-full w-full rounded-xl border border-skybrand-100"
                loading="lazy"
                onError={() => setChartFailed(true)}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

import { useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { useForexStore } from '../store/useForexStore'
import { getFlagUrl, getCurrencyBadge } from '../data/flags'
import { formatRate } from '../utils/formatters'

export default function LiveTicker() {
  const ratesData = useForexStore((state) => state.ratesData)
  const previousRatesMap = useForexStore((state) => state.previousRatesMap)

  const items = useMemo(() => {
    const visible = ratesData.slice(0, 12) // show top 12 currencies
    return visible.map((r) => {
      const prev = previousRatesMap[r.currency_code]
      const delta = prev ? r.selling_rate - prev.selling_rate : 0
      const pct = prev?.selling_rate ? (delta / prev.selling_rate) * 100 : 0
      return { ...r, delta, pct }
    })
  }, [ratesData, previousRatesMap])

  if (!items.length) return null

  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-cyanice bg-white/90"
      role="marquee"
      aria-label="Live forex ticker"
    >
      <div className="ticker-track flex min-w-max items-center gap-2 px-3 py-2 text-xs">
        {doubled.map((item, idx) => {
          const up = item.delta >= 0
          return (
            <div
              key={`${item.currency_code}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1.5 font-semibold text-navysoft whitespace-nowrap"
            >
<img
                  src={getFlagUrl(item.currency_code) || getCurrencyBadge(item.currency_code)}
                  alt={item.currency_code}
                  className="h-3.5 w-5 rounded-sm object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = getCurrencyBadge(item.currency_code) }}
                />
              <span>{item.currency_code}/TZS</span>
              <span className="font-bold text-slate-800">{formatRate(item.selling_rate)}</span>
              {item.delta !== 0 && (
                <span className={`flex items-center gap-0.5 ${
                  up ? 'text-green-600' : 'text-red-500'
                }`}>
                  {up ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
                  {Math.abs(item.pct).toFixed(2)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

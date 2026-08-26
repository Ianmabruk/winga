import { useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Flag from './Flag'
import { formatRate, spreadPercent } from '../utils/formatters'
import { useForexStore } from '../store/useForexStore'

export default function RatesDataTable({ data = [], rateView = 'buy' }) {
  const { previousRatesMap } = useForexStore()

  const rows = useMemo(() => {
    return data.map((rate) => {
      const prev = previousRatesMap[rate.currency_code]
      const buyUp = prev && Number(rate.buying_rate) > Number(prev.buying_rate)
      const sellUp = prev && Number(rate.selling_rate) > Number(prev.selling_rate)

      let trendDirection = null
      let trendPct = 0

      if (prev) {
        if (rateView === 'buy') {
          const curr = Number(rate.buying_rate)
          const oldV = Number(prev.buying_rate)
          if (curr !== oldV && oldV > 0) {
            trendDirection = curr > oldV ? 'up' : 'down'
            trendPct = Math.abs(((curr - oldV) / oldV) * 100)
          }
        } else {
          const curr = Number(rate.selling_rate)
          const oldV = Number(prev.selling_rate)
          if (curr !== oldV && oldV > 0) {
            trendDirection = curr > oldV ? 'up' : 'down'
            trendPct = Math.abs(((curr - oldV) / oldV) * 100)
          }
        }
      }

      return {
        ...rate,
        trendDirection,
        trendPct,
        buyUp,
        sellUp,
      }
    })
  }, [data, previousRatesMap, rateView])

  if (!rows.length) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-[26px] border border-white/80 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <table className="w-full min-w-[680px] table-fixed text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Currency
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full Name
            </th>
            <th
              className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide transition-colors ${
                rateView === 'buy'
                  ? 'text-skybrand-700'
                  : 'text-slate-500'
              }`}
            >
              Buy (TZS)
            </th>
            <th
              className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide transition-colors ${
                rateView === 'sell'
                  ? 'text-skybrand-700'
                  : 'text-slate-500'
              }`}
            >
              Sell (TZS)
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trend
            </th>
            <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Spread
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((rate, idx) => {
            const spread = spreadPercent(rate.buying_rate, rate.selling_rate)
            const buyEmphasized = rateView === 'buy'
            const sellEmphasized = rateView === 'sell'

            return (
              <tr
                key={rate.currency_code}
                className={`border-b border-slate-50 last:border-none transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                } hover:bg-skybrand-50/40`}
              >
                <td className="px-3 py-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Flag code={rate.currency_code} size="md" className="flex-shrink-0" />
                    <span className="font-bold text-navysoft">{rate.currency_code}</span>
                  </div>
                </td>

                <td className="px-3 py-4 text-sm text-slate-600">
                  <span className="block max-w-[200px] break-words leading-5">
                    {rate.currency_actual_name}
                  </span>
                </td>

                <td className="px-3 py-4 text-right">
                  <span
                    className={`inline-block font-semibold whitespace-nowrap transition-all ${
                      buyEmphasized
                        ? 'text-[clamp(0.85rem,2vw,1rem)] text-skybrand-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatRate(rate.buying_rate)}
                  </span>
                </td>

                <td className="px-3 py-4 text-right">
                  <span
                    className={`inline-block font-semibold whitespace-nowrap transition-all ${
                      sellEmphasized
                        ? 'text-[clamp(0.85rem,2vw,1rem)] text-skybrand-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatRate(rate.selling_rate)}
                  </span>
                </td>

                <td className="px-3 py-4 text-center">
                  {rate.trendDirection ? (
                    <span
                      className={`inline-flex items-center justify-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${
                        rate.trendDirection === 'up'
                          ? 'bg-market-up/10 text-market-up'
                          : 'bg-market-down/10 text-market-down'
                      }`}
                    >
                      {rate.trendDirection === 'up' ? (
                        <FiTrendingUp size={10} />
                      ) : (
                        <FiTrendingDown size={10} />
                      )}
                      {rate.trendPct.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="hidden xl:table-cell px-3 py-4 text-right text-sm text-slate-500">
                  {spread.toFixed(2)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

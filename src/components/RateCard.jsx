import { useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Flag from './Flag'
import { formatRate, spreadPercent } from '../utils/formatters'
import { useForexStore } from '../store/useForexStore'

export default function RateCard({ rate }) {
  const previousRatesMap = useForexStore((s) => s.previousRatesMap)
  const rateView = useForexStore((s) => s.rateView)

  const prev = previousRatesMap[rate.currency_code]
  const buyUp = prev && Number(rate.buying_rate) > Number(prev.buying_rate)
  const sellUp = prev && Number(rate.selling_rate) > Number(prev.selling_rate)
  const buyChanged = prev && rate.buying_rate !== prev.buying_rate
  const sellChanged = prev && rate.selling_rate !== prev.selling_rate

  const spread = useMemo(
    () => spreadPercent(rate.buying_rate, rate.selling_rate),
    [rate.buying_rate, rate.selling_rate],
  )

  return (
    <article
      className="glass-surface rounded-[26px] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <Flag code={rate.currency_code} size="md" className="flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-navysoft">{rate.currency_code}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {rate.currency_actual_name}
          </p>
        </div>
        {buyChanged ? (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${buyUp ? 'text-market-up' : 'text-market-down'}`}>
            {buyUp ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
            {Math.abs(((Number(rate.buying_rate) - Number(prev.buying_rate)) / Number(prev.buying_rate)) * 100).toFixed(2)}%
          </span>
        ) : sellChanged ? (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${sellUp ? 'text-market-up' : 'text-market-down'}`}>
            {sellUp ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
            {Math.abs(((Number(rate.selling_rate) - Number(prev.selling_rate)) / Number(prev.selling_rate)) * 100).toFixed(2)}%
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className={`
            rounded-2xl p-4 text-center
            ${rateView === 'buy'
              ? 'border-2 border-skybrand-600 bg-skybrand-50'
              : 'border border-slate-200 bg-emerald-50'}
          `}
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Buy
          </p>
          <p
            className={`
              mt-2 font-bold whitespace-nowrap
              ${rateView === 'buy'
                ? 'text-[clamp(1.35rem,4vw,1.7rem)] text-skybrand-700'
                : 'text-[clamp(1rem,3vw,1.2rem)] text-slate-700'}
            `}
          >
            {formatRate(rate.buying_rate)}
          </p>
          <p className="mt-1 text-[0.65rem] text-slate-400">TZS</p>
        </div>

        <div
          className={`
            rounded-2xl p-4 text-center
            ${rateView === 'sell'
              ? 'border-2 border-skybrand-600 bg-skybrand-50'
              : 'border border-slate-200 bg-sky-50'}
          `}
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sell
          </p>
          <p
            className={`
              mt-2 font-bold whitespace-nowrap
              ${rateView === 'sell'
                ? 'text-[clamp(1.35rem,4vw,1.7rem)] text-skybrand-700'
                : 'text-[clamp(1rem,3vw,1.2rem)] text-slate-700'}
            `}
          >
            {formatRate(rate.selling_rate)}
          </p>
          <p className="mt-1 text-[0.65rem] text-slate-400">TZS</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Spread {spread.toFixed(2)}%</span>
        <span>· {rate.currency_actual_name ? rate.currency_actual_name.replace(/[()]/g, '').trim() : ''}</span>
      </div>
    </article>
  )
}

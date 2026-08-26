import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Flag from './Flag'
import { formatRate, spreadPercent } from '../utils/formatters'
import { useForexStore } from '../store/useForexStore'

export default function MarketRateCard({ rate, prev }) {
  const rateView = useForexStore((s) => s.rateView)

  const buyUp = prev && Number(rate.buying_rate) > Number(prev.buying_rate)
  const sellUp = prev && Number(rate.selling_rate) > Number(prev.selling_rate)
  const buyChanged = prev && Number(rate.buying_rate) !== Number(prev.buying_rate)
  const sellChanged = prev && Number(rate.selling_rate) !== Number(prev.selling_rate)

  const spread = spreadPercent(rate.buying_rate, rate.selling_rate)

  const activeTrend = rateView === 'buy' ? buyUp : sellUp
  const activeChanged = rateView === 'buy' ? buyChanged : sellChanged

  return (
    <article
      className="glass-card flex items-center gap-3 rounded-[26px] border border-white/50 bg-white/72 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
    >
      <div className="flex min-w-[60px] items-center justify-center">
        <Flag code={rate.currency_code} size="lg" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-navysoft">{rate.currency_code}</p>
            <p className="truncate text-xs text-slate-500">{rate.currency_actual_name}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">Buy</p>
            <p className="mt-1 font-bold text-navysoft text-[clamp(0.9rem,3vw,1.05rem)]">
              {formatRate(rate.buying_rate)}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">Sell</p>
            <p className="mt-1 font-bold text-navysoft text-[clamp(0.9rem,3vw,1.05rem)]">
              {formatRate(rate.selling_rate)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Spread {spread.toFixed(2)}%</span>
          {activeChanged && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold ${
              activeTrend ? 'text-market-up' : 'text-market-down'
            }`}>
              {activeTrend ? <FiTrendingUp size={8} /> : <FiTrendingDown size={8} />}
              {activeTrend ? '+' : '-'}
              {Math.abs(Number(rateView === 'buy'
                ? ((Number(rate.buying_rate) - Number(prev.buying_rate)) / Number(prev.buying_rate)) * 100
                : ((Number(rate.selling_rate) - Number(prev.selling_rate)) / Number(prev.selling_rate)) * 100)).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

import { motion } from 'framer-motion'
import { FiStar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { formatDateTime, formatRate, spreadPercent } from '../utils/formatters'
import { useForexStore } from '../store/useForexStore'
import SparklineChart from './SparklineChart'
import Flag from './Flag'

export default function CurrencyCard({ rate, prev }) {
  const { favorites, toggleFavorite, changedCurrencies } = useForexStore()
  const isFav = favorites.includes(rate.currency_code)
  const isChanged = changedCurrencies.includes(rate.currency_code)

  const spread = spreadPercent(rate.buying_rate, rate.selling_rate)
  const buyChanged = prev && prev.buying_rate !== rate.buying_rate
  const sellChanged = prev && prev.selling_rate !== rate.selling_rate
  const buyUp = buyChanged && rate.buying_rate > (prev?.buying_rate ?? rate.buying_rate)
  const sellUp = sellChanged && rate.selling_rate > (prev?.selling_rate ?? rate.selling_rate)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border bg-white/95 p-5 shadow-sm transition-all ${
        isChanged
          ? 'border-skybrand-400 shadow-[0_0_16px_rgba(37,99,235,0.18)]'
          : 'border-cyanice hover:border-skybrand-200 hover:shadow-glass'
      }`}
    >
      {isChanged && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-skybrand-400/5 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Flag code={rate.currency_code} size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{rate.currency_code}</p>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite(rate.currency_code)}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`rounded-full p-1 transition ${
            isFav ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'
          }`}
        >
          <FiStar size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="mt-1 truncate text-xs text-slate-500">{rate.currency_actual_name}</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-green-50 px-4 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-green-700">BUY</p>
          <div className="flex min-w-0 items-center gap-1">
              {buyChanged && (
                buyUp
                  ? <FiTrendingUp size={11} className="text-green-500 flex-shrink-0" />
                  : <FiTrendingDown size={11} className="text-red-500 flex-shrink-0" />
              )}
              <p
                className={`text-base font-bold leading-tight transition-colors ${
                  buyChanged ? (buyUp ? 'text-green-600' : 'text-red-500') : 'text-slate-900'
                } whitespace-nowrap text-[clamp(0.92rem,3vw,1.15rem)]`}
              >
                {formatRate(rate.buying_rate)}
              </p>
            </div>
        </div>

        <div className="rounded-xl bg-sky-50 px-4 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-sky-700">SELL</p>
          <div className="flex min-w-0 items-center gap-1">
              {sellChanged && (
                sellUp
                  ? <FiTrendingUp size={11} className="text-green-500 flex-shrink-0" />
                  : <FiTrendingDown size={11} className="text-red-500 flex-shrink-0" />
              )}
              <p
                className={`text-base font-bold leading-tight transition-colors ${
                  sellChanged ? (sellUp ? 'text-green-600' : 'text-red-500') : 'text-slate-900'
                } whitespace-nowrap text-[clamp(0.92rem,3vw,1.15rem)]`}
              >
                {formatRate(rate.selling_rate)}
              </p>
            </div>
        </div>
      </div>

      <div className="mt-3 h-12 overflow-hidden rounded-lg border border-skybrand-100/70 bg-skybrand-50/50 px-1">
        <SparklineChart up={sellUp || (!sellChanged && true)} value={rate.selling_rate || 1} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="whitespace-nowrap">Spread {spread.toFixed(2)}%</span>
        <span className="text-slate-400">TZS</span>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="h-1.5 w-1.5 rounded-full bg-skybrand-400 animate-pulseRate" />
        <p className="truncate text-[11px] text-slate-400">
          {formatDateTime(rate.effective_date_and_time)}
        </p>
      </div>
    </motion.article>
  )
}
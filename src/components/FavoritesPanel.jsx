import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiX } from 'react-icons/fi'
import { useForexStore } from '../store/useForexStore'
import { getFlagUrl } from '../data/flags'
import { formatRate } from '../utils/formatters'

export default function FavoritesPanel() {
  const { ratesMap, favorites, toggleFavorite } = useForexStore()

  const favRates = useMemo(
    () => favorites.map((code) => ratesMap[code]).filter(Boolean),
    [favorites, ratesMap],
  )

  return (
    <aside className="glass-surface rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiStar className="text-amber-400" fill="currentColor" size={15} />
        <p className="text-sm font-bold text-slate-900">Favorites</p>
        <span className="ml-auto text-xs text-slate-400">{favRates.length} currencies</span>
      </div>

      {favRates.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">
          Star currencies in the rates table to add them here.
        </p>
      ) : (
        <div className="grid gap-2">
          {favRates.map((rate) => (
            <motion.div
              key={rate.currency_code}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5"
            >
              <img
                src={getFlagUrl(rate.currency_code)}
                alt={rate.currency_code}
                className="h-4 w-6 rounded-sm object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/flags/fallback.svg' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{rate.currency_code}</p>
                <p className="text-xs text-slate-500 truncate">{rate.currency_actual_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Buy / Sell</p>
                <p className="text-xs font-semibold text-slate-800">
                  {formatRate(rate.buying_rate)} / {formatRate(rate.selling_rate)}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(rate.currency_code)}
                aria-label={`Remove ${rate.currency_code} from favorites`}
                className="text-slate-300 hover:text-red-400 transition shrink-0"
              >
                <FiX size={13} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </aside>
  )
}

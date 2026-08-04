import { useEffect, useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiClock, FiWifi, FiWifiOff } from 'react-icons/fi'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { formatTime } from '../utils/formatters'
import BranchSelector from './BranchSelector'
import SearchBar from './SearchBar'
import { CurrencyCardSkeleton } from './LoadingSkeleton'
import CurrencyCard from './CurrencyCard'

const POPULAR = ['USD', 'EUR', 'GBP', 'AED', 'KES']
const AFRICAN = ['KES', 'UGX', 'RWF', 'ZAR', 'BWP', 'NAD']
const CRYPTO = ['BTC', 'ETH', 'USDT']

function inGroup(code, group) {
  if (group === 'all') return true
  if (group === 'favorites') return false
  if (group === 'popular') return POPULAR.includes(code)
  if (group === 'african') return AFRICAN.includes(code)
  if (group === 'crypto') return CRYPTO.includes(code)
  return true
}

export default function ForexBoard() {
  const { isLoading, isFetching, isError, refetch } = useRates()
  const {
    ratesData,
    previousRatesMap,
    lastUpdated,
    searchQuery,
    selectedBranch,
    favorites,
    setSearchQuery,
  } = useForexStore()
  const [group, setGroup] = useState('all')
  const deferredSearch = useDeferredValue(searchQuery)

  useEffect(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  const visibleRates = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()

    return ratesData.filter((r) => {
      const code = r.currency_code
      const byGroup =
        group === 'favorites'
          ? favorites.includes(code)
          : inGroup(code, group)

      if (!byGroup) return false
      if (!q) return true

      return (
        code.toLowerCase().includes(q) ||
        r.currency_actual_name?.toLowerCase().includes(q)
      )
    })
  }, [ratesData, deferredSearch, group, favorites])

  const groupedRates = useMemo(() => {
    const groupDef = [
      { id: 'popular', label: 'Popular Currencies', items: visibleRates.filter((r) => POPULAR.includes(r.currency_code)) },
      { id: 'african', label: 'African Currencies', items: visibleRates.filter((r) => AFRICAN.includes(r.currency_code)) },
      { id: 'other', label: 'International Markets', items: visibleRates.filter((r) => !POPULAR.includes(r.currency_code) && !AFRICAN.includes(r.currency_code) && !CRYPTO.includes(r.currency_code)) },
      { id: 'crypto', label: 'Crypto', items: visibleRates.filter((r) => CRYPTO.includes(r.currency_code)) },
    ]

    return groupDef.filter((entry) => entry.items.length > 0)
  }, [visibleRates])

  const hasData = ratesData.length > 0

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BranchSelector />
          {selectedBranch && (
            <span className="hidden text-xs text-slate-500 sm:block">
              {selectedBranch.branch_name}
            </span>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <SearchBar className="w-full sm:w-56" />
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh rates"
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-skybrand-200 bg-white text-slate-600 shadow-sm transition hover:bg-skybrand-50 ${
              isFetching ? 'cursor-wait opacity-60' : ''
            }`}
          >
            <FiRefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isError && !hasData && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Live rates are currently unavailable</p>
          <p className="mt-1">Unable to connect to the Winga live rate feed. Please check your connection and try again later.</p>
        </div>
      )}
      {isError && hasData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Connection interrupted — showing last successful rates</p>
          <p className="mt-1">Retrying automatically to restore live Winga pricing.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          ['all', 'All'],
          ['popular', 'Popular'],
          ['african', 'African'],
          ['favorites', 'Favorites'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setGroup(id)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              group === id
                ? 'bg-skybrand-600 text-white shadow-glass'
                : 'border border-skybrand-200 bg-white text-slate-700 hover:bg-skybrand-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-cyanice bg-white/80 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <FiClock size={12} />
          {lastUpdated ? (
            <span>Updated {formatTime(lastUpdated)} · Auto-refresh every 15s</span>
          ) : (
            <span>Loading rates…</span>
          )}
        </div>
        <div className={`flex items-center gap-1 font-medium ${isError ? 'text-red-500' : 'text-green-600'}`}>
          {isError ? <FiWifiOff size={12} /> : <FiWifi size={12} />}
          {isError ? 'Reconnecting…' : isFetching ? 'Refreshing…' : 'Live'}
        </div>
      </div>

      {isError && hasData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Connection interrupted. Showing last successful rates. Retrying automatically…
        </motion.div>
      )}

      {isError && !hasData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-semibold text-amber-800">Unable to load exchange rates</p>
          <p className="mt-1 text-sm text-amber-700">Check your internet connection and try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            Retry Now
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading
          ? (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <CurrencyCardSkeleton key={i} />)}
            </div>
          )
          : groupedRates.map((bucket) => (
            <div key={bucket.id} className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{bucket.label}</h3>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {bucket.items.map((rate) => (
                  <CurrencyCard
                    key={rate.currency_code}
                    rate={rate}
                    prev={previousRatesMap[rate.currency_code]}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {!isLoading && !hasData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-semibold text-amber-800">No exchange rates available</p>
          <p className="mt-1 text-sm text-amber-700">No exchange rates available for the selected branch.</p>
        </div>
      )}

      {!isLoading && visibleRates.length === 0 && hasData && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-600">No currencies match <strong>"{searchQuery}"</strong></p>
        </div>
      )}
    </section>
  )
}
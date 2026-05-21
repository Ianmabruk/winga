import { lazy, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiClock, FiWifi, FiWifiOff } from 'react-icons/fi'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { formatTime } from '../utils/formatters'
import BranchSelector from './BranchSelector'
import SearchBar from './SearchBar'
import RatesTable from './RatesTable'
import { CurrencyCardSkeleton } from './LoadingSkeleton'

const CurrencyCard = lazy(() => import('./CurrencyCard'))

export default function ForexBoard({ mode = 'table' }) {
  const { isLoading, isFetching, isError, refetch } = useRates()
  const {
    ratesData,
    previousRatesMap,
    lastUpdated,
    searchQuery,
    selectedBranch,
  } = useForexStore()

  const visibleRates = useMemo(() => {
    if (!searchQuery.trim()) return ratesData
    const q = searchQuery.toLowerCase()
    return ratesData.filter(
      (r) =>
        r.currency_code.toLowerCase().includes(q) ||
        r.currency_actual_name?.toLowerCase().includes(q),
    )
  }, [ratesData, searchQuery])

  const hasData = ratesData.length > 0

  return (
    <section className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BranchSelector compact />
          {selectedBranch && (
            <span className="hidden text-xs text-slate-500 sm:block">
              {selectedBranch.branch_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SearchBar className="w-52" />
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

      {/* Status bar */}
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

      {/* Error banner — but keep previous data visible */}
      {isError && hasData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Connection interrupted. Showing last successful rates. Retrying automatically…
        </motion.div>
      )}

      {/* Error with no data */}
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

      {/* Card grid mode */}
      {mode === 'cards' && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <CurrencyCardSkeleton key={i} />)
            : visibleRates.map((rate) => (
                <Suspense key={rate.currency_code} fallback={<CurrencyCardSkeleton />}>
                  <CurrencyCard
                    rate={rate}
                    prev={previousRatesMap[rate.currency_code]}
                  />
                </Suspense>
              ))}
        </div>
      )}

      {/* Table mode (default) */}
      {mode === 'table' && (
        <RatesTable
          data={visibleRates}
          isLoading={isLoading && !hasData}
        />
      )}

      {/* No results from search */}
      {!isLoading && visibleRates.length === 0 && hasData && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-600">No currencies match <strong>"{searchQuery}"</strong></p>
        </div>
      )}
    </section>
  )
}

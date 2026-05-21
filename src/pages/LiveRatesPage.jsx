import { lazy, Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { FiGrid, FiList, FiRefreshCw } from 'react-icons/fi'
import { useBranches } from '../hooks/useBranches'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import BranchSelector from '../components/BranchSelector'
import BranchInfoCard from '../components/BranchInfoCard'
import ForexBoard from '../components/ForexBoard'
import AnalyticsPanel from '../components/AnalyticsPanel'
import FavoritesPanel from '../components/FavoritesPanel'

const SparklineChart = lazy(() => import('../components/SparklineChart'))

export default function LiveRatesPage() {
  useBranches()
  const { isFetching } = useRates()
  const { selectedBranch, lastUpdated } = useForexStore()
  const [mode, setMode] = useState('table') // 'table' | 'cards'
  const [showBranchInfo, setShowBranchInfo] = useState(false)

  return (
    <section className="grid gap-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-skybrand-600 font-semibold">
            Live Exchange Rates
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900 mt-1">
            Winga Forex Market Board
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time Tanzania Shilling (TZS) exchange rates updated every 15 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl border border-skybrand-200 bg-white p-1">
            <button
              onClick={() => setMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'table'
                  ? 'bg-skybrand-500 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiList size={13} /> Table
            </button>
            <button
              onClick={() => setMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'cards'
                  ? 'bg-skybrand-500 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiGrid size={13} /> Cards
            </button>
          </div>

          {isFetching && (
            <div className="flex items-center gap-1 text-xs text-skybrand-600">
              <FiRefreshCw size={12} className="animate-spin" />
              Refreshing…
            </div>
          )}
        </div>
      </motion.div>

      {/* Branch selector row */}
      <div className="flex flex-wrap items-center gap-3">
        <BranchSelector />
        {selectedBranch && (
          <button
            onClick={() => setShowBranchInfo((v) => !v)}
            className="text-xs text-skybrand-600 underline underline-offset-2 hover:text-skybrand-800 transition"
          >
            {showBranchInfo ? 'Hide' : 'Show'} branch details
          </button>
        )}
      </div>

      {/* Branch info expandable */}
      {showBranchInfo && selectedBranch && (
        <BranchInfoCard branch={selectedBranch} />
      )}

      {/* Analytics row */}
      <AnalyticsPanel />

      {/* Main board + sidebar */}
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <ForexBoard mode={mode} />
        <FavoritesPanel />
      </div>
    </section>
  )
}

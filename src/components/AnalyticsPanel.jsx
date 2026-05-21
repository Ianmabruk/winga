import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiActivity, FiBarChart2, FiDollarSign } from 'react-icons/fi'
import { useForexStore } from '../store/useForexStore'
import { formatRate, formatTZS, spreadPercent } from '../utils/formatters'
import { getFlagUrl } from '../data/flags'

function StatCard({ icon: Icon, label, value, sub, color = 'sky' }) {
  const colors = {
    sky: 'bg-skybrand-50 border-skybrand-200 text-skybrand-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${colors[color]}`}
    >
      <div className={`mb-2 inline-flex rounded-xl p-2 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </motion.div>
  )
}

export default function AnalyticsPanel() {
  const { ratesData, selectedBranch } = useForexStore()

  const stats = useMemo(() => {
    if (!ratesData.length) return null
    const spreads = ratesData.map((r) => spreadPercent(r.buying_rate, r.selling_rate))
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length
    const maxSpreadIdx = spreads.indexOf(Math.max(...spreads))
    const minSpreadIdx = spreads.indexOf(Math.min(...spreads))
    const highestBuy = [...ratesData].sort((a, b) => b.buying_rate - a.buying_rate)[0]
    const lowestBuy = [...ratesData].sort((a, b) => a.buying_rate - b.buying_rate)[0]

    return {
      total: ratesData.length,
      avgSpread: avgSpread.toFixed(2),
      widestSpread: ratesData[maxSpreadIdx],
      tightestSpread: ratesData[minSpreadIdx],
      highestBuy,
      lowestBuy,
    }
  }, [ratesData])

  if (!stats) {
    return (
      <div className="glass-surface rounded-2xl p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-skybrand-100" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-skybrand-50" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="glass-surface rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FiActivity className="text-skybrand-500" />
        <h3 className="font-display text-base font-bold text-slate-900">
          Market Analytics
        </h3>
        {selectedBranch && (
          <span className="ml-auto text-xs text-slate-500">{selectedBranch.branch_abbr}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={FiBarChart2}
          label="Currencies"
          value={stats.total}
          sub="active pairs"
          color="sky"
        />
        <StatCard
          icon={FiActivity}
          label="Avg Spread"
          value={`${stats.avgSpread}%`}
          sub="across all pairs"
          color="slate"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Highest Buy"
          value={formatTZS(stats.highestBuy.buying_rate)}
          sub={stats.highestBuy.currency_code}
          color="green"
        />
        <StatCard
          icon={FiDollarSign}
          label="Lowest Buy"
          value={formatRate(stats.lowestBuy.buying_rate)}
          sub={stats.lowestBuy.currency_code}
          color="amber"
        />
      </div>

      {/* Spread comparison */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white/80 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Widest Spread
          </p>
          <div className="flex items-center gap-2">
            <img
              src={getFlagUrl(stats.widestSpread.currency_code)}
              alt={stats.widestSpread.currency_code}
              className="h-4 w-6 rounded-sm object-cover"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{stats.widestSpread.currency_code}</p>
              <p className="text-xs text-slate-500">
                {spreadPercent(stats.widestSpread.buying_rate, stats.widestSpread.selling_rate).toFixed(2)}% spread
              </p>
            </div>
            <div className="ml-auto text-right text-xs text-slate-600">
              <p>{formatRate(stats.widestSpread.buying_rate)}</p>
              <p>{formatRate(stats.widestSpread.selling_rate)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white/80 p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Tightest Spread
          </p>
          <div className="flex items-center gap-2">
            <img
              src={getFlagUrl(stats.tightestSpread.currency_code)}
              alt={stats.tightestSpread.currency_code}
              className="h-4 w-6 rounded-sm object-cover"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{stats.tightestSpread.currency_code}</p>
              <p className="text-xs text-slate-500">
                {spreadPercent(stats.tightestSpread.buying_rate, stats.tightestSpread.selling_rate).toFixed(2)}% spread
              </p>
            </div>
            <div className="ml-auto text-right text-xs text-slate-600">
              <p>{formatRate(stats.tightestSpread.buying_rate)}</p>
              <p>{formatRate(stats.tightestSpread.selling_rate)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

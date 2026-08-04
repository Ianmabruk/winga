import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiClock,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi'
import BranchSelector from '../components/BranchSelector'
import SparklineChart from '../components/SparklineChart'
import { getFlagUrl, getCurrencyBadge } from '../data/flags'
import { useBranches } from '../hooks/useBranches'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { movementFromRates } from '../utils/forexMath'
import { formatRate, formatTime, spreadPercent } from '../utils/formatters'
import Seo from '../components/Seo'

const marketThemes = [
  'from-emerald-400/18 via-white to-sky-400/10',
  'from-skybrand-400/18 via-white to-cyan-400/10',
  'from-amber-300/18 via-white to-rose-300/10',
  'from-cyan-300/18 via-white to-emerald-300/10',
]

const revealGroup = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const revealCard = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' } },
}

function formatDelta(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function MetricCard({ label, value, tone, detail, Icon }) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className={`absolute inset-x-0 top-0 h-1.5 ${tone}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 font-display text-[clamp(1.45rem,3vw,2rem)] text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{detail}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
          <Icon size={18} />
        </span>
      </div>
    </article>
  )
}

export default function MarketPage() {
  useBranches()
  const { isFetching, isError, isFetched } = useRates()
  const { ratesData, previousRatesMap, selectedBranch, lastUpdated } = useForexStore()
  const hasData = ratesData.length > 0
  const isEmptyResult = isFetched && !isFetching && !hasData && !isError

  const marketData = useMemo(() => {
    return ratesData
      .map((rate) => {
        const prev = previousRatesMap[rate.currency_code]
        const prevSell = Number(prev?.selling_rate || rate.selling_rate || 0)
        const currentSell = Number(rate.selling_rate || 0)
        const delta = prevSell > 0 ? ((currentSell - prevSell) / prevSell) * 100 : 0
        const spread = spreadPercent(rate.buying_rate, rate.selling_rate)
        const pressure = movementFromRates(rate.buying_rate, rate.selling_rate)

        return {
          ...rate,
          delta,
          spread,
          pressure,
          intensity: Math.abs(delta) + spread * 0.35,
          direction: delta >= 0 ? 'up' : 'down',
        }
      })
      .sort((a, b) => b.intensity - a.intensity)
  }, [previousRatesMap, ratesData])

  const topMovers = marketData.slice(0, 6)
  const strongestRise = marketData.find((item) => item.delta >= 0) || marketData[0]
  const strongestDrop = [...marketData].reverse().find((item) => item.delta < 0) || marketData.at(-1)
  const tightestSpread = [...marketData].sort((a, b) => a.spread - b.spread)[0]
  const widestSpread = [...marketData].sort((a, b) => b.spread - a.spread)[0]
  const marketPulse = [
    {
      label: 'Fastest rise',
      item: strongestRise,
      Icon: FiTrendingUp,
      tone: 'text-emerald-600',
      accent: 'bg-emerald-500/12 text-emerald-700',
    },
    {
      label: 'Cooling pair',
      item: strongestDrop,
      Icon: FiTrendingDown,
      tone: 'text-rose-600',
      accent: 'bg-rose-500/12 text-rose-700',
    },
    {
      label: 'Tight spread',
      item: tightestSpread,
      Icon: FiZap,
      tone: 'text-skybrand-700',
      accent: 'bg-skybrand-500/12 text-skybrand-700',
    },
    {
      label: 'High activity',
      item: widestSpread,
      Icon: FiBarChart2,
      tone: 'text-amber-700',
      accent: 'bg-amber-500/12 text-amber-700',
    },
  ].filter((entry) => entry.item)

  return (
    <section className="mx-auto grid w-[min(1380px,96vw)] gap-6 px-4 py-6 md:px-6 lg:gap-8 lg:px-8 lg:py-8">
      <Seo
        title="Rates Dashboard | Winga Forex Bureau"
        description="Monitor live forex market intelligence, currency momentum, buy and sell movement, and spread pressure for all currencies including USD, EUR, GBP, KES, UGX, RWF and 166+ more."
        path="/rates-dashboard"
      />
      {isError && !hasData && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Live rates are currently unavailable</p>
          <p className="mt-1">Unable to connect to the Winga live rate feed. Please check your connection and try again later.</p>
        </div>
      )}
      {isError && hasData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Connection interrupted — showing last successful rates</p>
          <p className="mt-1">Retrying automatically to restore live Winga pricing.</p>
        </div>
      )}
      {isEmptyResult && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center">
          <p className="font-semibold text-amber-800">No exchange rates available</p>
          <p className="mt-1 text-sm text-amber-700">No exchange rates available for the selected branch.</p>
        </div>
      )}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[34px] border border-white/75 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,249,255,0.88),rgba(248,250,252,0.96))] p-6 shadow-[0_25px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl md:p-8"
      >
        <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-skybrand-300/25 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-skybrand-700">Rates Dashboard</p>
            <h1 className="mt-3 max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-slate-950">
              Live forex intelligence with cleaner signals and faster market reads.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Monitor currency momentum, buy and sell movement, spread pressure, and branch-driven activity from one premium market surface.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {['Bloomberg-lite surface', 'Live spread watch', 'Responsive market cards'].map((pill) => (
                <span key={pill} className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 backdrop-blur">
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="min-w-[220px] rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">Market focus</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedBranch?.branch_name || 'Select a branch for live pricing'}</p>
              </div>
              <div className="min-w-[220px] rounded-2xl border border-white/80 bg-slate-950 px-4 py-3 text-white shadow-xl shadow-slate-950/10">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-300">Status</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isFetching ? 'Refreshing live market' : 'Streaming live indicators'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/80 bg-white/72 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BranchSelector />
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                <FiClock size={12} />
                {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Awaiting first update'}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {topMovers.slice(0, 3).map((item) => {
                const positive = item.direction === 'up'
                return (
                  <article key={item.currency_code} className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
                    <div className="flex items-center gap-3">
<img
                         src={getFlagUrl(item.currency_code) || getCurrencyBadge(item.currency_code)}
                         alt={`${item.currency_code} flag`}
                         className="h-5 w-8 rounded object-cover shadow-sm"
                         loading="lazy"
                         onError={(e) => { e.currentTarget.src = getCurrencyBadge(item.currency_code) }}
                       />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.currency_code}</p>
                        <p className="text-xs text-slate-500">{item.currency_actual_name}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-16 overflow-hidden rounded-2xl bg-slate-50 px-2">
                      <SparklineChart up={positive} value={item.selling_rate || 1} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${positive ? 'bg-emerald-500/12 text-emerald-700' : 'bg-rose-500/12 text-rose-700'}`}>
                        {positive ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
                        {formatDelta(item.delta)}
                      </span>
                      <span className="text-slate-500">Spread {item.spread.toFixed(2)}%</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        variants={revealGroup}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={revealCard}>
          <MetricCard
          label="Live pairs"
          value={`${marketData.length}`}
          detail="Active currencies with current buy and sell movement."
          Icon={FiActivity}
          tone="bg-gradient-to-r from-skybrand-500 to-cyan-400"
          />
        </motion.div>
        <motion.div variants={revealCard}>
          <MetricCard
          label="Top momentum"
          value={strongestRise ? strongestRise.currency_code : 'N/A'}
          detail={strongestRise ? `${formatDelta(strongestRise.delta)} vs previous tick` : 'Waiting for enough price history.'}
          Icon={FiTrendingUp}
          tone="bg-gradient-to-r from-emerald-500 to-cyan-400"
          />
        </motion.div>
        <motion.div variants={revealCard}>
          <MetricCard
          label="Market pulse"
          value={widestSpread ? `${widestSpread.spread.toFixed(2)}%` : '0.00%'}
          detail={widestSpread ? `${widestSpread.currency_code} is carrying the widest live spread.` : 'Pulse will appear after branch pricing loads.'}
          Icon={FiBarChart2}
          tone="bg-gradient-to-r from-amber-400 to-orange-400"
          />
        </motion.div>
        <motion.div variants={revealCard}>
          <MetricCard
          label="Branch watch"
          value={selectedBranch?.branch_name || 'Branch pending'}
          detail="All market analytics are scoped to the selected bureau branch."
          Icon={FiRefreshCw}
          tone="bg-gradient-to-r from-slate-800 to-slate-500"
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[30px] border border-white/75 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Market pulse</p>
              <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,2rem)] text-slate-950">Live movement snapshot</h2>
            </div>
            <span className="rounded-full bg-skybrand-500/10 px-3 py-1 text-xs font-semibold text-skybrand-700">Updated continuously</span>
          </div>

          <motion.div
            variants={revealGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-5 grid gap-3"
          >
            {marketPulse.map(({ label, item, Icon, tone, accent }) => (
              <motion.article key={label} variants={revealCard} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{label}</p>
                    <div className="mt-2 flex items-center gap-2">
<img
                         src={getFlagUrl(item.currency_code) || getCurrencyBadge(item.currency_code)}
                         alt={`${item.currency_code} flag`}
                         className="h-5 w-8 rounded object-cover shadow-sm"
                         loading="lazy"
                         onError={(e) => { e.currentTarget.src = getCurrencyBadge(item.currency_code) }}
                       />
                      <p className="text-base font-semibold text-slate-950">{item.currency_code}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 whitespace-nowrap">
                      Buy {formatRate(item.buying_rate)} · Sell {formatRate(item.selling_rate)}
                    </p>
                  </div>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon size={18} className={tone} />
                  </span>
                </div>
                <div className="mt-4 h-16 overflow-hidden rounded-2xl bg-slate-50 px-2">
                  <SparklineChart up={item.direction === 'up'} value={item.selling_rate || 1} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatDelta(item.delta)}</span>
                  <span>Pressure {item.pressure.toFixed(2)}%</span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className="rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.96))] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Trending forex</p>
              <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,2rem)] text-slate-950">Top moving currencies</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              Mini analytics + live indicators
            </div>
          </div>

          <motion.div
            variants={revealGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {topMovers.map((item, index) => {
              const positive = item.direction === 'up'
              return (
                <motion.article
                  key={item.currency_code}
                  variants={revealCard}
                  className={`rounded-[26px] border border-white/80 bg-gradient-to-br ${marketThemes[index % marketThemes.length]} p-4 shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={getFlagUrl(item.currency_code) || getCurrencyBadge(item.currency_code)}
                        alt={`${item.currency_code} flag`}
                        className="h-5 w-8 rounded object-cover shadow-sm"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = getCurrencyBadge(item.currency_code) }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{item.currency_code}</p>
                        <p className="truncate text-xs text-slate-500">{item.currency_actual_name}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${positive ? 'bg-emerald-500/12 text-emerald-700' : 'bg-rose-500/12 text-rose-700'}`}>
                      {positive ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
                      {formatDelta(item.delta)}
                    </span>
                  </div>

                  <div className="mt-4 h-16 overflow-hidden rounded-2xl border border-white/80 bg-white/70 px-2 backdrop-blur">
                    <SparklineChart up={positive} value={item.selling_rate || 1} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">Buy</p>
                      <p className="mt-1 font-semibold text-slate-950 whitespace-nowrap text-[clamp(0.92rem,2.4vw,1.1rem)]">{formatRate(item.buying_rate)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">Sell</p>
                      <p className="mt-1 font-semibold text-slate-950 whitespace-nowrap text-[clamp(0.92rem,2.4vw,1.1rem)]">{formatRate(item.selling_rate)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                    <span>Spread {item.spread.toFixed(2)}%</span>
                    <span>Pressure {item.pressure.toFixed(2)}%</span>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </section>
      </div>
    </section>
  )
}
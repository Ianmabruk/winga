import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowDownRight, FiArrowUpRight, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { useBranches } from '../hooks/useBranches'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import BranchSelector from '../components/BranchSelector'
import ForexCalculatorPanel from '../components/ForexCalculatorPanel'
import SparklineChart from '../components/SparklineChart'
import Flag from '../components/Flag'
import { formatDateTime, formatRate, formatTime, spreadPercent } from '../utils/formatters'
import Seo from '../components/Seo'

const revealGroup = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 * (i / 20) },
  }),
}

const revealCard = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
}

function RatesSummaryCard({ label, value, detail }) {
  return (
    <article className="rounded-[26px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 font-display text-[clamp(1.3rem,3vw,1.9rem)] text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  )
}

export default function LiveRatesPage() {
  useBranches()
  const { isFetching, isError, isFetched } = useRates()
  const { selectedBranch, ratesData, previousRatesMap, lastUpdated } = useForexStore()
  const [query, setQuery] = useState('')
  const hasData = ratesData.length > 0
  const staleData = useForexStore((s) => s.staleData)
  const isEmptyResult = isFetched && !isFetching && !hasData && !isError

  const visibleRates = useMemo(() => {
    const term = query.trim().toLowerCase()
    return ratesData.filter((rate) => {
      if (!term) return true
      return (
        rate.currency_code.toLowerCase().includes(term) ||
        rate.currency_actual_name?.toLowerCase().includes(term)
      )
    })
  }, [query, ratesData])

  const rateCards = useMemo(
    () =>
      visibleRates.map((rate) => {
        const prev = previousRatesMap[rate.currency_code]
        const prevSell = Number(prev?.selling_rate || rate.selling_rate || 0)
        const currentSell = Number(rate.selling_rate || 0)
        const delta = prevSell > 0 ? ((currentSell - prevSell) / prevSell) * 100 : 0

        return {
          ...rate,
          delta,
          spread: spreadPercent(rate.buying_rate, rate.selling_rate),
          up: delta >= 0,
        }
      }),
    [previousRatesMap, visibleRates],
  )

  const featuredRate = rateCards[0]

  return (
    <section className="mx-auto grid w-[min(1380px,96vw)] gap-6 px-4 py-6 md:px-6 lg:gap-8 lg:px-8 lg:py-8">
      <Seo
        title="Live Forex Exchange Rates | Winga Forex Bureau"
        description="View live buy and sell exchange rates for USD, EUR, GBP, KES, UGX, RWF and more. Real-time forex rates updated every 15 seconds."
        path="/rates"
      />
      {staleData && hasData && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Stale rate warning</p>
          <p className="mt-1">The Winga API is returning rates with an old effective date. Displaying the most recent data available. This auto-refreshes every 15 seconds.</p>
        </div>
      )}
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.96),rgba(240,249,255,0.88))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8"
      >
        <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-skybrand-300/20 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-skybrand-700">
              Live rates
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.9rem)] leading-[0.95] text-slate-950">
              Premium exchange cards with faster rate scanning and cleaner conversion flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Focused on exchange rates only: buy, sell, last update, quick calculations, and responsive currency cards built for desktop and mobile.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {['Card-first layout', 'Live buy/sell quotes', 'Quick conversion access'].map((pill) => (
                <span key={pill} className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 backdrop-blur">
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <RatesSummaryCard
                label="Available currencies"
                value={`${ratesData.length}`}
                detail="All live branch rates rendered as adaptive floating cards."
              />
              <RatesSummaryCard
                label="Last refresh"
                value={lastUpdated ? formatTime(lastUpdated) : 'Pending'}
                detail={isFetching ? 'Rates are refreshing right now.' : 'Live updates continue in the background.'}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BranchSelector />
              {isFetching && (
                <div className="flex items-center gap-2 rounded-full bg-skybrand-50 px-3 py-1.5 text-xs font-semibold text-skybrand-700">
                  <FiRefreshCw size={12} className="animate-spin" />
                  Refreshing
                </div>
              )}
            </div>
            <div className="mt-4 rounded-[24px] bg-slate-950 p-4 text-white shadow-lg shadow-slate-950/10">
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-300">Primary focus</p>
              <p className="mt-2 text-lg font-semibold">
                {selectedBranch?.branch_name || 'Select a branch to view live public rates'}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {featuredRate
                  ? `${featuredRate.currency_code} is at the top of the board with live spread ${featuredRate.spread.toFixed(2)}%.`
                  : 'Waiting for active rates to populate the board.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="grid gap-4 rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Rate modules</p>
              <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,2rem)] text-slate-950">Buy and sell cards</h2>
            </div>
            <label className="relative w-full sm:w-72">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search currency code or name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-skybrand-300 focus:bg-white"
              />
            </label>
          </div>

          <motion.div
            variants={revealGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 max-h-[70vh] overflow-y-auto pr-2 -mr-2"
          >
            {rateCards.map((rate) => (
              <motion.article
                key={rate.currency_code}
                variants={revealCard}
                className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3 flex-1">
                    <Flag code={rate.currency_code} size="lg" className="flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-950">{rate.currency_code}</p>
                      <p className="text-xs text-slate-500 truncate">{rate.currency_actual_name}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${rate.up ? 'bg-emerald-500/12 text-emerald-700' : 'bg-rose-500/12 text-rose-700'}`}>
                    {rate.up ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
                    {rate.delta > 0 ? '+' : ''}
                    {rate.delta.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">Buy</p>
                    <p className="mt-2 text-[clamp(1.05rem,2.8vw,1.45rem)] font-semibold text-slate-950 whitespace-nowrap">{formatRate(rate.buying_rate)}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 px-4 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-skybrand-700">Sell</p>
                    <p className="mt-2 text-[clamp(1.05rem,2.8vw,1.45rem)] font-semibold text-slate-950 whitespace-nowrap">{formatRate(rate.selling_rate)}</p>
                  </div>
                </div>

                <div className="mt-4 h-16 overflow-hidden rounded-2xl border border-skybrand-100/70 bg-slate-50 px-2">
                  <SparklineChart up={rate.up} value={rate.selling_rate || 1} />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Spread {rate.spread.toFixed(2)}%</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-skybrand-400 animate-pulse" />
                    Live pulse
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-slate-400">
                  Updated {formatDateTime(rate.effective_date_and_time)}
                </p>
              </motion.article>
            ))}
          </motion.div>

          {!rateCards.length && (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              {isEmptyResult
                ? 'No exchange rates available for the selected branch.'
                : 'No exchange rates match your search.'}
            </div>
          )}
        </section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="grid gap-4"
        >
          <div className="rounded-[30px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Quick calculation</p>
            <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,2rem)] text-slate-950">Convert from live rates</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use the calculator with the same live pricing shown on the rate cards.
            </p>
          </div>
          <ForexCalculatorPanel full />
        </motion.div>
      </div>
    </section>
  )
}
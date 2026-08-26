import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiRefreshCw, FiSearch, FiX, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi'
import BranchSelector from '../components/BranchSelector'
import MarketSummaryCard, { MarketStatusIndicator } from '../components/MarketSummaryCard'
import MarketRateCard from '../components/MarketRateCard'
import BuySellTabs from '../components/BuySellTabs'
import { CurrencyCardSkeleton } from '../components/LoadingSkeleton'
import Flag from '../components/Flag'
import WingaForexLogo from '../components/WingaForexLogo'
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { formatRate, formatTime, spreadPercent } from '../utils/formatters'
import Seo from '../components/Seo'

const revealGroup = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

const revealItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' } },
}

export default function MarketPage() {
  console.log('[MarketPage][component-render]')
  const [search, setSearch] = useState('')

  const { isFetching, isError } = useRates({ cacheFirst: true })
  const {
    ratesData,
    previousRatesMap,
    lastUpdated,
    staleData,
    rateView,
    setRateView,
    selectedBranch,
  } = useForexStore()

  const hasData = ratesData.length > 0

  const filteredRates = useMemo(() => {
    if (!search.trim()) return ratesData

    const q = search.trim().toLowerCase()
    return ratesData.filter((rate) => {
      const code = (rate.currency_code || '').toLowerCase()
      const name = (rate.currency_actual_name || '').toLowerCase()
      return code.includes(q) || name.includes(q)
    })
  }, [ratesData, search])

  const marketData = useMemo(() => {
    return filteredRates.map((rate) => {
      const prev = previousRatesMap[rate.currency_code]
      const prevBuy = prev ? Number(prev.buying_rate) : 0
      const prevSell = prev ? Number(prev.selling_rate) : 0
      const currBuy = Number(rate.buying_rate)
      const currSell = Number(rate.selling_rate)

      return {
        ...rate,
        buyUp: prevBuy > 0 && currBuy > prevBuy,
        sellUp: prevSell > 0 && currSell > prevSell,
        buyChanged: prevBuy > 0 && currBuy !== prevBuy,
        sellChanged: prevSell > 0 && currSell !== prevSell,
        buyDelta: prevBuy > 0 ? ((currBuy - prevBuy) / prevBuy) * 100 : 0,
        sellDelta: prevSell > 0 ? ((currSell - prevSell) / prevSell) * 100 : 0,
      }
    })
  }, [filteredRates, previousRatesMap])

  return (
    <>
      <Seo
        title="Market Dashboard | Winga Forex Bureau"
        description="Real-time forex market intelligence. Track live buy and sell rates for USD, EUR, GBP, KES, ZAR and 13+ African currencies. Updated every 15 seconds."
        canonical="https://wingaforex.co.tz/rates-dashboard"
      />

      <section className="min-h-[calc(100vh-200px)] pb-safe">
        <div className="mx-auto w-[min(1440px,96vw)] px-4 py-6 md:py-8">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 lg:flex-row">
            <WingaForexLogo variant="header" />

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-slate-500">
                  {new Date(lastUpdated).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
              <MarketStatusIndicator
                live={!staleData}
                hasData={hasData}
                isFetching={isFetching}
              />
            </div>
          </div>

          <motion.div
            variants={revealGroup}
            initial="hidden"
            animate="visible"
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={revealItem}>
              <MarketSummaryCard
                label="Currencies"
                value={hasData ? marketData.length : '—'}
                detail={hasData ? `${filteredRates.length} available` : 'No rates loaded'}
                Icon={FiActivity}
                tone="sky"
              />
            </motion.div>

            <motion.div variants={revealItem}>
              <MarketSummaryCard
                label="Last Updated"
                value={lastUpdated ? formatTime(lastUpdated) : '—'}
                detail={staleData ? 'Stale' : 'Live'}
                Icon={FiRefreshCw}
                tone={staleData ? 'amber' : 'emerald'}
              />
            </motion.div>

            <motion.div variants={revealItem}>
              <MarketSummaryCard
                label="Best Buy"
                value={hasData ? marketData.reduce((best, r) => Number(r.buying_rate) > best ? Number(r.buying_rate) : best, 0).toFixed(2) : '—'}
                detail="Highest buy rate available"
                Icon={FiActivity}
                tone="navy"
              />
            </motion.div>

            <motion.div variants={revealItem}>
              <MarketSummaryCard
                label="Status"
                value={<MarketStatusIndicator live={!staleData} hasData={hasData} isFetching={isFetching} />}
                detail={staleData ? 'Stale' : 'Live'}
                Icon={FiActivity}
                tone="sky"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col items-center justify-between gap-4 rounded-[28px] border border-white/50 bg-white/60 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex-row"
          >
            <div className="flex items-center gap-2">
              <BranchSelector compact />
              {hasData && (
                <span className="hidden text-xs text-slate-500 sm:block">
                  {marketData.length} pairs for {selectedBranch?.branch_abbr || 'HEAD OFFICE'}
                </span>
              )}
            </div>

            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency code or name..."
                className="w-full rounded-[18px] border border-white/60 bg-white/80 px-4 py-3 pl-10 text-sm text-navysoft placeholder-slate-400 shadow-inner focus:border-skybrand-300 focus:outline-none focus:ring-2 focus:ring-skybrand-200"
                aria-label="Search currencies"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6 flex justify-center"
          >
            <BuySellTabs value={rateView} onChange={setRateView} />
          </motion.div>

          {isError && !hasData && (
            <div className="mb-6 rounded-[18px] border border-red-200 bg-red-50/50 p-4 text-center text-sm text-red-800">
              Unable to connect to the Winga live rate feed.
            </div>
          )}

          {isError && hasData && (
            <div className="mb-4 rounded-[18px] border border-amber-200 bg-amber-50/50 p-2 text-xs text-amber-800">
              Stale data
            </div>
          )}

          {staleData && hasData && (
            <div className="mb-4 rounded-[18px] border border-amber-200 bg-amber-50/50 p-2 text-xs text-amber-800">
              Stale data
            </div>
          )}

          {hasData && marketData.length === 0 && !isFetching && (
            <div className="rounded-[22px] border border-slate-200/80 bg-white/70 p-8 text-center backdrop-blur-xl">
              <p className="text-slate-600">
                No currencies match <strong className="text-navysoft">"{search}"</strong>
              </p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 rounded-xl border border-skybrand-200 bg-white px-4 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-50"
              >
                Clear search
              </button>
            </div>
          )}

          <motion.div
            variants={revealGroup}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            {!hasData && isFetching ? (
              <div className="overflow-x-auto rounded-[22px] border border-white/50 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/50 bg-white/50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Buy (TZS)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Sell (TZS)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Change</th>
                      <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Spread</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="border-b border-slate-50/50 last:border-none">
                        <td className="px-3 py-4"><div className="h-4 w-12 rounded bg-slate-200 animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-4 w-40 rounded bg-slate-200 animate-pulse" /></td>
                        <td className="px-3 py-4 text-right"><div className="h-4 w-16 rounded bg-slate-200 animate-pulse ml-auto" /></td>
                        <td className="px-3 py-4 text-right"><div className="h-4 w-16 rounded bg-slate-200 animate-pulse ml-auto" /></td>
                        <td className="px-3 py-4 text-center"><div className="h-4 w-10 rounded bg-slate-200 animate-pulse mx-auto" /></td>
                        <td className="hidden xl:table-cell px-3 py-4 text-right"><div className="h-4 w-10 rounded bg-slate-200 animate-pulse ml-auto" /></td>
                        <td className="px-3 py-4"><div className="h-4 w-16 rounded bg-slate-200 animate-pulse" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : hasData ? (
            <div className="overflow-x-auto rounded-[22px] border border-white/50 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-white/50 bg-white/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${rateView === 'buy' ? 'text-skybrand-700' : 'text-slate-400'}`}>Buy (TZS)</th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${rateView === 'sell' ? 'text-skybrand-700' : 'text-slate-400'}`}>Sell (TZS)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Change</th>
                    <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Spread</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((rate) => {
                    const spread = spreadPercent(rate.buying_rate, rate.selling_rate)
                    const activeUp = rateView === 'buy' ? rate.buyUp : rate.sellUp
                    const activeDelta = rateView === 'buy' ? rate.buyDelta : rate.sellDelta
                    const activeChanged = rateView === 'buy' ? rate.buyChanged : rate.sellChanged

                    return (
                      <tr
                        key={rate.currency_code}
                        className="border-b border-slate-50/50 last:border-none transition-colors hover:bg-skybrand-50/30"
                      >
                        <td className="px-3 py-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Flag code={rate.currency_code} size="md" className="flex-shrink-0" />
                            <span className="font-bold text-navysoft">{rate.currency_code}</span>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          <span className="block max-w-[200px] break-words leading-5">
                            {rate.currency_actual_name}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right">
                          <span
                            className={`inline-block font-semibold whitespace-nowrap transition-all ${
                              rateView === 'buy'
                                ? 'text-[clamp(0.85rem,2vw,1rem)] text-skybrand-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {formatRate(rate.buying_rate)}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right">
                          <span
                            className={`inline-block font-semibold whitespace-nowrap transition-all ${
                              rateView === 'sell'
                                ? 'text-[clamp(0.85rem,2vw,1rem)] text-skybrand-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {formatRate(rate.selling_rate)}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-center">
                          {activeChanged && (
                            <span
                              className={`inline-flex items-center justify-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${
                                activeUp
                                  ? 'bg-market-up/10 text-market-up'
                                  : 'bg-market-down/10 text-market-down'
                              }`}
                            >
                              {activeUp ? (
                                <FiArrowUpRight size={10} />
                              ) : (
                                <FiArrowDownRight size={10} />
                              )}
                              {Math.abs(activeDelta).toFixed(2)}%
                            </span>
                          )}
                          {!activeChanged && <span className="text-xs text-slate-400">—</span>}
                        </td>

                        <td className="hidden xl:table-cell px-3 py-4 text-right text-sm text-slate-500">
                          {spread.toFixed(2)}%
                        </td>

                        <td className="px-3 py-4">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {rate.source || 'winga-live'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            ) : (
            <div className="overflow-x-auto rounded-[22px] border border-white/50 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-white/50 bg-white/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Buy (TZS)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Sell (TZS)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Change</th>
                    <th className="hidden xl:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Spread</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">
                      {isFetching ? 'Loading live rates...' : isError ? 'Live rates temporarily unavailable. Please try again later.' : 'No rates available.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            )}
          </motion.div>

          <motion.div
            variants={revealGroup}
            initial="hidden"
            animate="visible"
            className="lg:hidden"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {marketData.map((rate) => (
                <motion.div key={rate.currency_code} variants={revealItem}>
                  <MarketRateCard rate={rate} prev={previousRatesMap[rate.currency_code]} />
                </motion.div>
              ))}
              {isFetching && hasData === false && Array.from({ length: 4 }).map((_, i) => (
                <CurrencyCardSkeleton key={`skeleton-${i}`} />
              ))}
              {!hasData && !isFetching && (
                <div className="col-span-full rounded-[22px] border border-white/50 bg-white/60 p-8 text-center backdrop-blur-xl">
                  <p className="text-sm text-slate-500">
                    {isError ? 'Live rates temporarily unavailable. Please try again later.' : 'No rates available.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

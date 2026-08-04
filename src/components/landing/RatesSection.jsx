import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { useForexStore } from '../../store/useForexStore'
import { useRates } from '../../hooks/useRates'
import { getFlagUrl, getCurrencyBadge } from '../../data/flags'
import { formatRate } from '../../utils/formatters'

const SHOW = ['USD', 'EUR', 'GBP', 'AED', 'KES', 'ZAR']

export default function RatesSection() {
  useRates()
  const ratesData = useForexStore((s) => s.ratesData)
  const lastUpdated = useForexStore((s) => s.lastUpdated)
  const staleData = useForexStore((s) => s.staleData)

  const data = ratesData.filter((r) => SHOW.includes(r.currency_code)).slice(0, 6)

  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        {staleData && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Rates may be delayed</p>
            <p className="mt-1">The Winga API last returned rates that are over 1 hour old. We are showing the most recent data available. Rates update automatically every 15 seconds.</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent-500">Real-Time Data</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Main Exchange Rates</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">A calm snapshot of the most watched currencies in Tanzanian Shillings (TZS).</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 rounded-xl bg-market-up/10 border border-market-up/20 px-3.5 py-2 text-xs font-semibold text-market-up">
              <FiRefreshCw size={12} className={staleData ? 'animate-bounce' : 'animate-spin'} />
              Updated {new Date(lastUpdated).toLocaleTimeString()}
              {staleData && <span className="text-amber-700">(Winga data stale — check back soon)</span>}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r, i) => {
            const code = r.currency_code
            const up = Number(r.selling_rate) >= Number(r.buying_rate)
            return (
              <motion.div key={code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(2,132,199,0.18)' }}
className="group relative flex min-h-[240px] flex-col justify-between bg-white border rounded-2xl p-5 shadow-card transition-all duration-300 overflow-hidden border-slate-200 hover:border-skybrand-300"
              >
                {/* Glow bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-skybrand-50/0 to-skybrand-100/0 group-hover:from-skybrand-50/60 group-hover:to-skybrand-100/30 transition-all duration-300 rounded-2xl pointer-events-none" />

                {/* Flag + code */}
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
<img
                        src={getFlagUrl(code) || getCurrencyBadge(code)}
                        alt={code}
                        className="h-6 w-8 rounded object-cover shadow-sm"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = getCurrencyBadge(code) }}
                      />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{code}</p>
                      <p className="text-[10px] text-slate-400">{r.currency_name || code}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${up ? 'text-market-up' : 'text-market-down'}`}>
                    {up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                  </span>
                </div>

                {/* Rates */}
                <div className="relative grid grid-cols-2 gap-2 grow">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium">BUY</p>
                    <p className="mt-2 text-[clamp(0.95rem,2.4vw,1.15rem)] font-bold text-emerald-700 whitespace-nowrap">{formatRate(r.buying_rate)}</p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-medium">SELL</p>
                    <p className="mt-2 text-[clamp(0.95rem,2.4vw,1.15rem)] font-bold text-sky-700 whitespace-nowrap">{formatRate(r.selling_rate)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-2xl border border-skybrand-100 bg-skybrand-50/70 px-4 py-2 text-xs font-semibold text-slate-600">
            Live pulse, favorites, and search are available in the full market board.
          </div>
          <Link to="/rates"
            className="inline-flex items-center gap-2 rounded-2xl bg-skybrand-600 px-6 py-3 text-sm font-bold text-white hover:bg-skybrand-700 hover:shadow-glow-sky transition-all duration-200">
            View All Currencies <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { useForexStore } from '../../store/useForexStore'
import { useRates } from '../../hooks/useRates'
import { getFlagUrl } from '../../data/flags'
import { formatRate } from '../../utils/formatters'
import { buildFallbackRatesData } from '../../data/currencies'

const SHOW = ['USD','EUR','GBP','AED','KES','ZAR','INR','CNY']

export default function RatesSection() {
  useRates()
  const ratesData = useForexStore((s) => s.ratesData)
  const lastUpdated = useForexStore((s) => s.lastUpdated)
  const changedCurrencies = useForexStore((s) => s.changedCurrencies)

  const data = (ratesData && ratesData.length ? ratesData : buildFallbackRatesData())
    .filter((r) => SHOW.includes(r.currency_code))
    .slice(0, 8)

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Real-Time Data</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Live Exchange Rates</h2>
            <p className="text-slate-500 mt-2 text-sm">All rates shown in Tanzanian Shillings (TZS)</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 rounded-xl bg-market-up/10 border border-market-up/20 px-3.5 py-2 text-xs font-semibold text-market-up">
              <FiRefreshCw size={12} className="animate-spin" />
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {data.map((r, i) => {
            const code = r.currency_code
            const changed = changedCurrencies.includes(code)
            const up = Number(r.selling_rate) >= Number(r.buying_rate)
            return (
              <motion.div key={code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(2,132,199,0.18)' }}
                className={`group relative bg-white border rounded-2xl p-4 shadow-card transition-all duration-300 cursor-default overflow-hidden
                  ${changed ? 'border-accent-400 ring-2 ring-accent-400/30' : 'border-slate-200 hover:border-skybrand-300'}`}
              >
                {/* Glow bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-skybrand-50/0 to-skybrand-100/0 group-hover:from-skybrand-50/60 group-hover:to-skybrand-100/30 transition-all duration-300 rounded-2xl pointer-events-none" />

                {/* Flag + code */}
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src={getFlagUrl(code)} alt={code} className="h-6 w-8 rounded object-cover shadow-sm" />
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
                <div className="relative grid grid-cols-2 gap-2">
                  <div className="bg-market-up/8 rounded-xl p-2 text-center border border-market-up/10">
                    <p className="text-[10px] text-slate-500 font-medium">BUY</p>
                    <p className="text-sm font-bold text-market-up">{formatRate(r.buying_rate)}</p>
                  </div>
                  <div className="bg-skybrand-50 rounded-xl p-2 text-center border border-skybrand-100">
                    <p className="text-[10px] text-slate-500 font-medium">SELL</p>
                    <p className="text-sm font-bold text-skybrand-700">{formatRate(r.selling_rate)}</p>
                  </div>
                </div>

                {changed && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-500 animate-pulseRate" />
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="text-center">
          <Link to="/live-rates"
            className="inline-flex items-center gap-2 rounded-2xl bg-skybrand-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-skybrand-700 hover:shadow-glow-sky transition-all duration-200">
            View All Currencies <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

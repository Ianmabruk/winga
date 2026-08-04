import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiTrendingUp, FiTrendingDown, FiShield, FiZap, FiGlobe } from 'react-icons/fi'
import { useForexStore } from '../../store/useForexStore'
import { getFlagUrl } from '../../data/flags'
import { formatRate } from '../../utils/formatters'
import forexHero from '../../assets/forex-hero-currencies.jpg'

const heroRates = ['USD','EUR','GBP','AED']

function HeroRateCard({ code, index }) {
  const ratesMap = useForexStore((s) => s.ratesMap)
  const r = ratesMap[code]
  if (!r) return null
  const up = Number(r.selling_rate) >= Number(r.buying_rate)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className={`bg-white/70 backdrop-blur-xl border border-skybrand-200/60 rounded-2xl p-4 shadow-glass
                  transition-shadow duration-200 hover:shadow-glass ${index % 2 === 1 ? 'motion-safe:animate-floaty2' : 'motion-safe:animate-floaty'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img
            src={getFlagUrl(code)}
            alt={code}
            className="h-5 w-7 rounded object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/flags/fallback.svg' }}
          />
          <span className="text-sm font-bold text-skybrand-900">{code}</span>
        </div>
        {up
          ? <span className="text-xs font-semibold text-market-up flex items-center gap-1"><FiTrendingUp size={11} /> UP</span>
          : <span className="text-xs font-semibold text-market-down flex items-center gap-1"><FiTrendingDown size={11} /> DOWN</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-market-up/10 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-medium">BUY</p>
          <p className="text-sm font-bold text-market-up">{formatRate(r.buying_rate)}</p>
        </div>
        <div className="bg-skybrand-600/10 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-500 font-medium">SELL</p>
          <p className="text-sm font-bold text-skybrand-700">{formatRate(r.selling_rate)}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-center">TZS per 1 {code}</p>
    </motion.div>
  )
}

const features = [
  { icon: FiShield, label: 'Bank of Tanzania Licensed' },
  { icon: FiZap, label: 'Instant Transactions' },
  { icon: FiGlobe, label: '25+ Currencies' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-skybrand-50 via-white to-orange-50/30 py-16 md:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-skybrand-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-300/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-skybrand-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-[min(1440px,96vw)] px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_1fr] lg:gap-12">

          {/* Left: text */}
          <div>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-skybrand-200 bg-skybrand-50 px-4 py-1.5 text-xs font-semibold text-skybrand-700 mb-6">
              <span className="h-2 w-2 rounded-full bg-market-up/80" />
              Live Rates Updated Every 15 Seconds
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mb-5 text-[clamp(2rem,6vw,4.25rem)] font-extrabold leading-[1.05] text-skybrand-950">
              Your Trusted Forex Exchange Partner
            </motion.h1>

            {/* Sub */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Competitive exchange rates, secure transactions, and exceptional customer service.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link to="/rates"
                className="flex items-center gap-2 rounded-2xl bg-skybrand-600 px-7 py-3.5 text-sm font-bold text-white shadow-glow-sky transition-all duration-200 hover:bg-skybrand-700">
                View Live Rates <FiArrowRight size={16} />
              </Link>
              <Link to="/contact"
                className="flex items-center gap-2 rounded-2xl border border-skybrand-300 bg-white px-7 py-3.5 text-sm font-bold text-skybrand-700 hover:border-skybrand-400 hover:bg-skybrand-50 transition-all duration-200">
                Contact Us
              </Link>
            </motion.div>

            {/* Feature badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl bg-white border border-skybrand-100 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  <Icon size={13} className="text-skybrand-600" /> {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: cinematic finance visual + floating rate cards */}
          <div className="grid gap-4">
            {/* Hero Image */}
            <div className="aspect-[3/2] rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
              <img
                src={forexHero}
                alt="International Currency Exchange"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Rate Cards */}
            <div className="grid grid-cols-2 gap-4">
              {heroRates.map((code, i) => (
                <HeroRateCard key={code} code={code} index={i} />
              ))}

              {/* Stats card */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                className="col-span-2 bg-gradient-to-r from-skybrand-600 to-skybrand-800 rounded-2xl p-5 text-white shadow-glass-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[['25+', 'Currencies'], ['15s', 'Rate Refresh'], ['100%', 'Reliable']].map(([val, label]) => (
                    <div key={label}>
                      <p className="text-2xl font-extrabold">{val}</p>
                      <p className="text-xs text-skybrand-200 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
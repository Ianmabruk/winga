import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiBriefcase,
  FiCreditCard,
  FiHeadphones,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi'

const services = [
  {
    title: 'Spot Currency Exchange',
    detail: 'Walk-in and digital exchange with transparent pricing, fast confirmation, and clean settlement flow.',
    icon: FiTrendingUp,
  },
  {
    title: 'Business Forex',
    detail: 'Treasury guidance for import-export businesses exposed to volatile corridors and recurring FX needs.',
    icon: FiBriefcase,
  },
  {
    title: 'Travel Forex',
    detail: 'Well-prepared travel cash and foreign exchange planning for business trips, education, and tourism.',
    icon: FiCreditCard,
  },
  {
    title: 'Corporate Solutions',
    detail: 'Structured FX support for finance teams that need policy discipline, better visibility, and reliable execution.',
    icon: FiShield,
  },
  {
    title: 'Forex Consultation',
    detail: 'Direct guidance from the bureau team on timing, settlement options, documentation, and rate monitoring.',
    icon: FiHeadphones,
  },
]

const processSteps = ['Request Quote', 'Rate Confirmation', 'Compliance Check', 'Settlement']

const supportPillars = [
  {
    title: 'Secure transactions',
    detail: 'Operational controls, licensed bureau procedures, and disciplined handling of funds.',
    icon: FiShield,
  },
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
}

export default function ServicesPage() {
  return (
    <section className="mx-auto grid w-[min(1380px,96vw)] gap-6 px-4 py-6 md:px-6 lg:gap-8 lg:px-8 lg:py-8">
      <header className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.96),rgba(240,249,255,0.88))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-skybrand-300/20 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-skybrand-700">Services dashboard</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.9rem)] leading-[0.95] text-slate-950">
              Elegant forex services built for retail, travel, and business clients.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              A dedicated services surface for exchange, transfers, corporate support, travel forex, and secure transaction guidance without clutter.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {['Retail exchange', 'Corporate support'].map((pill) => (
                <span key={pill} className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 backdrop-blur">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-300">Service promise</p>
            <p className="mt-3 text-lg font-semibold">Fast, secure, and guided from first quote to final settlement.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Contact Desk
                <FiArrowRight size={14} />
              </Link>
              <Link to="/rates" className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View Rates
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-3 rounded-[28px] border border-white/80 bg-white/80 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl md:grid-cols-4">
        {processSteps.map((step, index) => (
          <article key={step} className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-skybrand-600">Step {index + 1}</p>
            <p className="mt-1">{step}</p>
          </article>
        ))}
      </div>

      <motion.div
        variants={revealGroup}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <motion.article key={service.title} variants={revealCard} className="rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-skybrand-100 text-skybrand-700">
              <service.icon />
            </div>
            <h2 className="mt-4 font-display text-2xl text-slate-900">{service.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{service.detail}</p>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        variants={revealGroup}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {supportPillars.map((pillar) => (
          <motion.article key={pillar.title} variants={revealCard} className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <pillar.icon size={18} />
            </div>
            <h2 className="mt-4 font-display text-2xl text-slate-900">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.detail}</p>
          </motion.article>
        ))}
      </motion.div>

      <article className="rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(255,255,255,0.96),rgba(15,23,42,0.02))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-skybrand-700">Need tailored pricing?</p>
        <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] text-slate-900">Talk to our FX desk for a custom execution plan</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/contact" className="rounded-2xl bg-skybrand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-skybrand-700">
            Contact Desk
          </Link>
          <Link to="/calculator" className="rounded-2xl border border-skybrand-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-skybrand-50">
            Simulate Conversion
          </Link>
        </div>
      </article>
    </section>
  )
}

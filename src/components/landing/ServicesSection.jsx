import { motion } from 'framer-motion'
import { FiDollarSign, FiGlobe, FiBriefcase, FiMonitor, FiSend, FiCreditCard } from 'react-icons/fi'

const services = [
  {
    icon: FiDollarSign,
    title: 'Currency Exchange',
    desc: 'Buy and sell foreign currencies at the most competitive rates in Arusha. Instant over-the-counter service.',
    color: 'from-skybrand-500 to-skybrand-700',
    bg: 'bg-skybrand-50',
  },
  {
    icon: FiSend,
    title: 'International Transfers',
    desc: 'Send money internationally with ease. Fast, secure, and reliable cross-border transfers.',
    color: 'from-accent-400 to-accent-600',
    bg: 'bg-orange-50',
  },
  {
    icon: FiGlobe,
    title: 'Travel Money',
    desc: 'Get the best travel currency before your trip. Wide selection of foreign notes available.',
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    icon: FiBriefcase,
    title: 'Business Forex Solutions',
    desc: 'Tailored forex solutions for businesses. Bulk currency purchases and corporate accounts.',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: FiMonitor,
    title: 'Online Rate Monitoring',
    desc: 'Track live exchange rates 24/7 on our platform. Set alerts for your preferred rates.',
    color: 'from-cyan-500 to-cyan-700',
    bg: 'bg-cyan-50',
  },
  {
    icon: FiCreditCard,
    title: 'Corporate Transactions',
    desc: 'Enterprise-grade forex services for corporations. Dedicated account managers and priority service.',
    color: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50',
  },
]

export default function ServicesSection() {
  return (
    <section className="py-16 md:py-20 bg-skybrand-50/50">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">What We Offer</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Our Services</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Comprehensive forex solutions for individuals, travelers, and businesses across Tanzania.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group ${bg} border border-slate-200/80 rounded-2xl p-6 shadow-card hover:shadow-glass-lg transition-all duration-300`}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-skybrand-950 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

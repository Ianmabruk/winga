import { motion } from 'framer-motion'
import { FiDollarSign, FiGlobe, FiBriefcase, FiMonitor, FiSend, FiCreditCard } from 'react-icons/fi'

const services = [
  {
    icon: FiDollarSign,
    title: 'Currency Exchange',
    desc: 'Buy and sell foreign currencies at the most competitive rates in Arusha. Instant over-the-counter service.',
  },
  {
    icon: FiSend,
    title: 'International Transfers',
    desc: 'Send money internationally with ease. Fast, secure, and reliable cross-border transfers.',
  },
  {
    icon: FiGlobe,
    title: 'Travel Money',
    desc: 'Get the best travel currency before your trip. Wide selection of foreign notes available.',
  },
  {
    icon: FiBriefcase,
    title: 'Business Forex Solutions',
    desc: 'Tailored forex solutions for businesses. Bulk currency purchases and corporate accounts.',
  },
  {
    icon: FiMonitor,
    title: 'Online Rate Monitoring',
    desc: 'Track live exchange rates 24/7 on our platform. Set alerts for your preferred rates.',
  },
  {
    icon: FiCreditCard,
    title: 'Corporate Transactions',
    desc: 'Enterprise-grade forex services for corporations. Dedicated account managers and priority service.',
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-skybrand-100 bg-white/80 p-6 shadow-[0_12px_32px_rgba(8,47,73,0.09)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(2,132,199,0.18)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-skybrand-100 bg-skybrand-50 text-skybrand-700 transition-transform duration-300 group-hover:scale-105">
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

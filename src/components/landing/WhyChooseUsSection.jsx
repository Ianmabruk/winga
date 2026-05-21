import { motion } from 'framer-motion'
import { FiShield, FiZap, FiStar, FiUsers, FiCheck } from 'react-icons/fi'

const stats = [
  { value: '25+', label: 'Currencies', color: 'text-skybrand-600' },
  { value: '15s', label: 'Rate Refresh', color: 'text-accent-500' },
  { value: '100%', label: 'BOT Licensed', color: 'text-market-up' },
  { value: '24/7', label: 'Rate Monitoring', color: 'text-purple-600' },
]

const reasons = [
  { icon: FiShield, title: 'Bank of Tanzania Licensed', desc: 'Fully regulated and licensed by the Bank of Tanzania for your peace of mind.' },
  { icon: FiZap, title: 'Fastest Transactions', desc: 'Walk in and walk out — our streamlined process gets you your currency in minutes.' },
  { icon: FiStar, title: 'Best Rates in Arusha', desc: 'We consistently offer the most competitive exchange rates in the region.' },
  { icon: FiUsers, title: 'Expert Support', desc: 'Our professional forex team is ready to assist you with any currency needs.' },
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: stats */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Why Winga</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950 mb-6">Why Choose Us?</h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map(({ value, label, color }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center hover:shadow-card transition-all duration-200">
                  <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl bg-skybrand-600 p-5 text-white">
              <p className="font-bold text-sm mb-2">Trusted by hundreds of customers</p>
              <p className="text-skybrand-200 text-sm leading-relaxed">
                From individual travelers to large corporations, Winga Forex Bureau serves all forex needs
                with professionalism and the best rates in Arusha, Tanzania.
              </p>
            </motion.div>
          </div>

          {/* Right: reasons */}
          <div className="grid gap-4">
            {reasons.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-skybrand-50 flex items-center justify-center">
                  <Icon size={20} className="text-skybrand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-skybrand-950 text-sm mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'

const faqs = [
  {
    q: 'What currencies do you exchange?',
    a: 'We exchange over 25 currencies including USD, EUR, GBP, AED, KES, ZAR, INR, CNY, CAD, AUD, CHF, JPY and many more.',
  },
  {
    q: 'Where is Winga Forex Bureau located?',
    a: 'We are located on Sokoine Road, Arusha, Tanzania – Near NBC Bank. Easy to find in the city center.',
  },
  {
    q: 'What are your operating hours?',
    a: 'Monday – Sunday: 8:00 AM – 8:00 PM. We are open every day for your convenience.',
  },
  {
    q: 'Do you offer better rates for large transactions?',
    a: 'Yes! For large volume transactions and corporate clients, we offer preferential rates. Please contact us to discuss your requirements.',
  },
  {
    q: 'Is Winga Forex Bureau licensed?',
    a: 'Absolutely. We are fully licensed and regulated by the Bank of Tanzania, ensuring your transactions are safe and compliant.',
  },
  {
    q: 'How often are your rates updated?',
    a: 'Our online rates are updated every 15 seconds based on live market data. Counter rates may vary slightly and are confirmed at the time of transaction.',
  },
  {
    q: 'Can I pre-order currency?',
    a: 'Yes, you can contact us in advance to pre-order specific currencies, especially for large amounts or uncommon currencies.',
  },
]

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${open ? 'border-skybrand-300 bg-skybrand-50/60 shadow-sm' : 'border-slate-200 bg-white'}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={onToggle}
      >
        <span className={`text-sm font-semibold ${open ? 'text-skybrand-700' : 'text-slate-800'}`}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 ml-4">
          <FiChevronDown size={18} className={open ? 'text-skybrand-600' : 'text-slate-400'} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-skybrand-100 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Got Questions?</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Find answers to the most common questions about our services, rates, and operations.
            </p>
            <div className="rounded-2xl bg-gradient-to-br from-skybrand-600 to-skybrand-800 p-6 text-white">
              <p className="font-bold mb-1">Still have questions?</p>
              <p className="text-skybrand-200 text-sm mb-4">Our team is happy to help you with anything.</p>
<a href="tel:+255740800820"
                 className="inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition">
                Call or WhatsApp Us
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid gap-3">
            {faqs.map((item, i) => (
              <FaqItem key={i} {...item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

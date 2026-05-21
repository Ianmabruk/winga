import { motion } from 'framer-motion'
import { FiBarChart2, FiTrendingUp, FiTarget } from 'react-icons/fi'

export default function AnalyticsPreview() {
  const metrics = [
    { label: 'USD Spread Avg', value: '1.48%', delta: '+0.08%' },
    { label: 'EUR Spread Avg', value: '1.62%', delta: '-0.03%' },
    { label: 'Daily Transactions', value: '1,284', delta: '+12.4%' },
    { label: 'Customer Satisfaction', value: '97.9%', delta: '+1.1%' },
  ]

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-skybrand-50/40 to-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Insights</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Analytics Dashboard Preview</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">Data-driven rate and transaction intelligence</span>
        </div>

        <div className="rounded-3xl border border-skybrand-100 bg-white p-4 md:p-6 shadow-card">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{m.value}</p>
                <p className="text-xs text-market-up mt-1">{m.delta}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiBarChart2 size={16} className="text-skybrand-600" />
                <h3 className="font-bold text-slate-900">7-Day Currency Movement</h3>
              </div>
              <div className="h-44 rounded-xl bg-gradient-to-br from-skybrand-100/70 to-skybrand-50 border border-skybrand-100 flex items-end gap-2 p-3">
                {[54, 62, 59, 70, 66, 74, 79].map((h, idx) => (
                  <div key={idx} className="flex-1 rounded-t-md bg-skybrand-500/80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiTarget size={16} className="text-accent-500" />
                <h3 className="font-bold text-slate-900">Top Signals</h3>
              </div>
              <div className="grid gap-2 text-sm">
                {[
                  'USD demand spike detected',
                  'EUR spread narrowing trend',
                  'AED volume above baseline',
                  'KES volatility easing',
                ].map((s) => (
                  <div key={s} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

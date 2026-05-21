import { motion } from 'framer-motion'
import { FiUsers, FiBarChart2, FiShield, FiRefreshCw, FiAlertCircle, FiTrendingUp } from 'react-icons/fi'

const widgets = [
  {
    title: 'Total Branches',
    value: '12',
    change: '+2 this quarter',
    icon: FiUsers,
    tone: 'from-skybrand-500 to-skybrand-700',
  },
  {
    title: 'Rate Sync Uptime',
    value: '99.98%',
    change: 'Stable API health',
    icon: FiRefreshCw,
    tone: 'from-market-up to-emerald-700',
  },
  {
    title: 'Compliance Alerts',
    value: '3',
    change: 'Needs review',
    icon: FiAlertCircle,
    tone: 'from-accent-400 to-accent-600',
  },
  {
    title: 'Daily Volume',
    value: 'TZS 1.2B',
    change: '+14.2%',
    icon: FiTrendingUp,
    tone: 'from-purple-500 to-purple-700',
  },
]

export default function DashboardPreview() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Institution Grade</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Admin Dashboard Preview</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">For internal operations and compliance monitoring</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-6 shadow-card">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {widgets.map(({ title, value, change, icon: Icon, tone }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-white border border-slate-200 p-4"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white mb-3`}>
                  <Icon size={18} />
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{change}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Recent Audit Logs</h3>
              <div className="grid gap-2 text-sm">
                {[
                  'Rate updated for USD at Arusha Main Branch',
                  'New user role assigned: Branch Manager',
                  'Compliance report generated for April 2026',
                  'High-volume transaction flagged for review',
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Branch Status</h3>
              <div className="grid gap-2 text-sm">
                {[
                  ['Arusha Main', 'Online'],
                  ['Dar HQ', 'Online'],
                  ['Moshi', 'Online'],
                  ['Mwanza', 'Maintenance'],
                ].map(([branch, state]) => (
                  <div key={branch} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                    <span className="text-slate-700">{branch}</span>
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${state === 'Online' ? 'bg-market-up/10 text-market-up' : 'bg-accent-100 text-accent-700'}`}>
                      {state}
                    </span>
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

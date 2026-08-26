import { motion } from 'framer-motion'
import { FiActivity, FiClock, FiRefreshCw, FiWifiOff } from 'react-icons/fi'

const glassCardBase = "relative overflow-hidden rounded-[28px] border border-white/50 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"

export default function MarketSummaryCard({ label, value, detail, Icon, tone = 'sky' }) {
  const toneColors = {
    sky: 'text-skybrand-700',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    navy: 'text-navysoft',
  }
  const iconBg = {
    sky: 'bg-skybrand-500/12',
    emerald: 'bg-emerald-500/12',
    amber: 'bg-amber-500/12',
    red: 'bg-red-500/12',
    navy: 'bg-navysoft/12',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={glassCardBase}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 font-display text-[clamp(1.45rem,3vw,2rem)] text-navysoft">
            {value}
          </p>
          {detail && (
            <p className="mt-2 text-sm text-slate-600">
              {detail}
            </p>
          )}
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg[tone]} ${toneColors[tone]} shadow-sm`}>
          <Icon size={18} />
        </span>
      </div>
    </motion.article>
  )
}

export const MarketStatusIndicator = ({ live, hasData, isFetching }) => {
  let status = 'Offline'
  let Icon = FiWifiOff
  let color = 'text-slate-500'
  let bg = 'bg-slate-100'

  if (hasData && !live) {
    status = 'Stale'
    Icon = FiClock
    color = 'text-amber-600'
    bg = 'bg-amber-500/10'
  }
  if (hasData && live && isFetching) {
    status = 'Updating'
    Icon = FiRefreshCw
    color = 'text-skybrand-700'
    bg = 'bg-skybrand-500/10'
  }
  if (hasData && live && !isFetching) {
    status = 'Live'
    Icon = FiActivity
    color = 'text-emerald-600'
    bg = 'bg-emerald-500/10'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${bg} ${color}`}>
      <Icon size={10} className={status === 'Updating' ? 'animate-spin' : ''} />
      {status}
    </span>
  )
}

import { motion } from 'framer-motion'
import { FiMapPin, FiClock, FiHash, FiBriefcase } from 'react-icons/fi'

export default function BranchInfoCard({ branch }) {
  if (!branch) return null

  const address = [branch.address_1, branch.address_2, branch.address_3]
    .filter(Boolean)
    .join(', ')

  const workingHourLines = branch.working_hours
    ? branch.working_hours.split('\n').filter(Boolean)
    : []

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-surface rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-skybrand-600">
            Selected Branch
          </p>
          <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
            {branch.branch_name}
          </h3>
          <p className="text-sm text-slate-500">{branch.company_name}</p>
        </div>
        <span className="rounded-xl bg-skybrand-50 px-3 py-1.5 text-xs font-bold text-skybrand-700 border border-skybrand-200">
          {branch.branch_abbr}
        </span>
      </div>

      <div className="mt-4 h-px bg-gradient-to-r from-skybrand-200 to-transparent" />

      {/* Details grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* BCL number */}
        {branch.bcl_no && (
          <div className="flex items-start gap-2 text-sm text-slate-700">
            <FiHash className="mt-0.5 shrink-0 text-skybrand-400" size={14} />
            <div>
              <p className="text-xs text-slate-500 font-medium">BCL No.</p>
              <p className="font-semibold">{branch.bcl_no}</p>
            </div>
          </div>
        )}

        {/* Company */}
        <div className="flex items-start gap-2 text-sm text-slate-700">
          <FiBriefcase className="mt-0.5 shrink-0 text-skybrand-400" size={14} />
          <div>
            <p className="text-xs text-slate-500 font-medium">Company</p>
            <p className="font-semibold">{branch.company_name}</p>
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
            <FiMapPin className="mt-0.5 shrink-0 text-skybrand-400" size={14} />
            <div>
              <p className="text-xs text-slate-500 font-medium">Address</p>
              <p className="font-semibold">{address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Working hours */}
      {workingHourLines.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-skybrand-600 mb-2">
            <FiClock size={12} />
            Working Hours
          </div>
          <div className="grid gap-1">
            {workingHourLines.map((line, i) => (
              <p key={i} className="text-sm text-slate-700">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Advertisement banner */}
      {branch.currency_board_advertisement && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-skybrand-500 to-market-cyan p-3 text-white">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Notice</p>
          <p className="text-sm mt-0.5">{branch.currency_board_advertisement}</p>
        </div>
      )}
    </motion.article>
  )
}

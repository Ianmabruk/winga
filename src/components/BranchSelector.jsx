import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiChevronDown } from 'react-icons/fi'
import { useState } from 'react'
import { useBranches } from '../hooks/useBranches'
import { useForexStore } from '../store/useForexStore'
import { BranchSelectorSkeleton } from './LoadingSkeleton'

export default function BranchSelector({ compact = false }) {
  const { isLoading } = useBranches()
  const { branches, selectedBranch, setSelectedBranch } = useForexStore()
  const [open, setOpen] = useState(false)

  if (isLoading) return <BranchSelectorSkeleton />

  if (!branches.length) return null

  // Compact mode: dropdown
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-skybrand-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-skybrand-50"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <FiMapPin className="text-skybrand-500" size={14} />
          <span className="max-w-[140px] truncate">
            {selectedBranch?.branch_abbr || selectedBranch?.branch_name || 'Select Branch'}
          </span>
          <FiChevronDown
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
            size={14}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute right-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-2xl border border-skybrand-100 bg-white shadow-xl"
            >
              {branches.map((branch) => {
                const active = selectedBranch?.branch_name === branch.branch_name
                return (
                  <li key={branch.branch_name}>
                    <button
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSelectedBranch(branch)
                        setOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-skybrand-50 ${
                        active ? 'bg-skybrand-50 font-semibold text-skybrand-700' : 'text-slate-700'
                      }`}
                    >
                      <FiMapPin
                        className={active ? 'text-skybrand-500' : 'text-slate-400'}
                        size={13}
                      />
                      <div>
                        <p className="font-medium leading-tight">{branch.branch_name}</p>
                        <p className="text-xs text-slate-500">{branch.branch_abbr}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Full tab-style selector
  return (
    <div className="flex flex-wrap gap-2">
      {branches.map((branch) => {
        const active = selectedBranch?.branch_name === branch.branch_name
        return (
          <motion.button
            key={branch.branch_name}
            onClick={() => setSelectedBranch(branch)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-skybrand-500 text-white shadow-glass'
                : 'border border-skybrand-200 bg-white/90 text-slate-700 hover:bg-skybrand-50'
            }`}
          >
            <FiMapPin size={13} />
            <span>{branch.branch_abbr || branch.branch_name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

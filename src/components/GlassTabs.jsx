import { FiBarChart2, FiTrendingUp } from 'react-icons/fi'

const TABS = [
  { id: 'market', label: 'Market', Icon: FiBarChart2 },
  { id: 'rates', label: 'Rates', Icon: FiTrendingUp },
]

export default function GlassTabs({ value, onChange }) {
  return (
    <div
      className="relative mx-auto mb-6 grid w-full max-w-[320px] grid-cols-2 rounded-full border border-white/60 bg-white/40 p-1 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl"
      role="tablist"
      aria-label="Market view selector"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold
              transition-all duration-250
              focus:outline-none focus-visible:ring-2 focus-visible:ring-skybrand-400 focus-visible:ring-offset-2
              ${
                isActive
                  ? 'bg-white text-skybrand-700 shadow-[0_4px_16px_rgba(15,23,42,0.12)]'
                  : 'text-slate-600 hover:text-skybrand-700'
              }
            `}
          >
            <tab.Icon size={14} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

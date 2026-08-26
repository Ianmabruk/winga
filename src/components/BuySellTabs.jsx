import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const TABS = [
  { id: 'buy', label: 'BUY RATES' },
  { id: 'sell', label: 'SELL RATES' },
]

export default function BuySellTabs({ value, onChange, buyDelta, sellDelta }) {
  const deltas = { buy: buyDelta, sell: sellDelta }

  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="tablist"
      aria-label="Rate type selector"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.id
        const delta = deltas[tab.id] || 0

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              rounded-[22px] border-2 px-4 py-4 text-center
              font-extrabold tracking-[0.12em] uppercase
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-skybrand-400 focus-visible:ring-offset-2
              ${
                isActive
                  ? 'border-skybrand-600 bg-skybrand-600 text-white shadow-lg shadow-skybrand-500/25'
                  : 'border-skybrand-200 bg-white text-slate-700 hover:border-skybrand-300 hover:bg-skybrand-50'
              }
            `}
          >
            <span className="text-[clamp(1rem,3vw,1.25rem)] leading-tight">
              {tab.label}
            </span>
            {delta !== 0 && (
              <span
                className={`mt-0.5 inline-flex items-center gap-0.5 text-[clamp(0.65rem,2vw,0.8rem)] font-semibold ${
                  isActive
                    ? 'text-white/80'
                    : delta > 0
                      ? 'text-market-up'
                      : 'text-market-down'
                }`}
              >
                {delta > 0 ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
                {Math.abs(delta).toFixed(2)}%
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

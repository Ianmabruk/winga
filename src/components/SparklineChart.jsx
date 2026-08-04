import { useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

// Renders a REAL rate history when provided. We never fabricate trend lines:
// if no historical series is supplied the component states that plainly.
export default function SparklineChart({ up, history }) {
  const series = useMemo(() => {
    if (Array.isArray(history) && history.length >= 2) {
      return history.map((n, i) => ({ x: i, y: Number(n) }))
    }
    return null
  }, [history])

  if (!series) {
    return (
      <div className="flex h-[60px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-center text-[11px] text-slate-400">
        No historical data available
      </div>
    )
  }

  const stroke = up ? '#22c55e' : '#ef4444'
  const fill = up ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.16)'

  return (
    <div className="h-[60px] w-full" role="img" aria-label="Rate history">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 6, right: 0, left: 0, bottom: 2 }}>
          <Area dataKey="y" type="monotone" stroke={stroke} strokeWidth={2.3} fill={fill} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

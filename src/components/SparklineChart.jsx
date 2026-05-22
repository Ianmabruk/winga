import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

export default function SparklineChart({ up, value }) {
  const data = useMemo(() => {
    const base = Number(value || 100)
    const unit = Math.max(base * 0.0012, 0.0001)
    const samples = [
      base - unit * 4,
      base - unit * 2,
      base - unit,
      base,
      base + unit * 0.8,
      base + unit * 0.4,
      base + unit * 1.2,
    ]

    return samples.map((n, i) => ({ x: i, y: Number(n.toFixed(3)) }))
  }, [value])

  const stroke = up ? '#22c55e' : '#ef4444'
  const fill = up ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.16)'

  return (
    <div className="h-[60px] w-full" role="img" aria-label="Rate sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 2 }}>
          <Area
            dataKey="y"
            type="monotone"
            stroke={stroke}
            strokeWidth={2.3}
            fill={fill}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

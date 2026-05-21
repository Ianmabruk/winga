export default function SparklineChart({ up, value }) {
  const root = (value || 100) * 0.001
  const points = [
    value - root * 3,
    value - root * 2,
    value - root,
    value,
    value + root,
    value + root * 0.5,
    value + root * 1.5,
  ].map((point) => Number(point.toFixed(3)))

  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = Math.max(max - min, 0.0001)

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 100 - ((point - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[60px] w-full" role="img" aria-label="Rate sparkline">
      <polyline
        fill="none"
        stroke={up ? '#22c55e' : '#ef4444'}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={path}
      />
    </svg>
  )
}

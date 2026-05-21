export default function GlassCard({ title, value, subtitle }) {
  return (
    <article className="glass-surface rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-skybrand-700/95">{title}</p>
      <p className="mt-2 font-display text-[clamp(1.25rem,2.4vw,1.7rem)] leading-tight text-skybrand-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-skybrand-800/80">{subtitle}</p> : null}
    </article>
  )
}

const stats = [
  { label: 'Active FX Corridors', value: '35+' },
  { label: 'Avg. Settlement Time', value: '< 15 min' },
  { label: 'Client Satisfaction', value: '98%' },
]

const pillars = [
  {
    title: 'Trust',
    description: 'Transparent pricing, compliance-first workflows, and auditable operations across every transaction.',
  },
  {
    title: 'Speed',
    description: 'Fast quote-to-settlement pipelines powered by live rates and disciplined execution controls.',
  },
  {
    title: 'Reach',
    description: 'Cross-border capability designed for African commerce and globally connected businesses.',
  },
]

export default function AboutPage() {
  return (
    <section className="grid gap-6">
      <article className="glass-surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">About Us</p>
        <h1 className="mt-2 font-display text-4xl text-slate-900">About Winga Forex Bureau</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">
          Winga Forex Bureau is a modern foreign exchange institution focused on trusted rates, reliable service delivery, and intelligent digital tools for retail and institutional clients.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-skybrand-100 bg-white/85 p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
              <p className="mt-1 font-display text-2xl text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="glass-surface rounded-2xl p-4">
            <h2 className="font-display text-xl text-slate-900">{pillar.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{pillar.description}</p>
          </article>
        ))}
      </div>

      <article className="rounded-3xl border border-skybrand-100 bg-gradient-to-r from-white to-skybrand-50 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">How we operate</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold text-slate-900">1. Discovery</h3>
            <p className="mt-1 text-sm text-slate-700">We map your corridor needs, volatility exposure, and compliance profile.</p>
          </div>
          <div className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold text-slate-900">2. Execution</h3>
            <p className="mt-1 text-sm text-slate-700">Our desk delivers competitive quotes and coordinated settlement workflows.</p>
          </div>
          <div className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold text-slate-900">3. Monitoring</h3>
            <p className="mt-1 text-sm text-slate-700">Post-trade support, alerts, and analytics keep your treasury decisions informed.</p>
          </div>
        </div>
      </article>
    </section>
  )
}

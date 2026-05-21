import { Link } from 'react-router-dom'
import { FiBriefcase, FiCreditCard, FiGlobe, FiHeadphones, FiShield, FiTrendingUp } from 'react-icons/fi'

const services = [
  {
    title: 'Spot Currency Exchange',
    detail: 'Walk-in and digital exchange with transparent buy/sell bands and instant receipts.',
    icon: FiTrendingUp,
  },
  {
    title: 'Corporate FX Hedging Support',
    detail: 'Treasury guidance for import-export businesses exposed to volatile corridors.',
    icon: FiBriefcase,
  },
  {
    title: 'Forex Card Issuance and Management',
    detail: 'Secure multi-currency cards with spending controls and live transaction visibility.',
    icon: FiCreditCard,
  },
  {
    title: 'Cash and Digital Settlement',
    detail: 'Flexible fulfillment through branch pickup, bank transfer, and approved wallets.',
    icon: FiShield,
  },
  {
    title: 'Cross-Border Business Payments',
    detail: 'Reliable payout rails for suppliers, invoices, and recurring regional obligations.',
    icon: FiGlobe,
  },
  {
    title: 'Dedicated Account Management',
    detail: 'Priority assistance from a relationship manager for high-frequency clients.',
    icon: FiHeadphones,
  },
]

const processSteps = ['Request Quote', 'Rate Confirmation', 'Compliance Check', 'Settlement']

export default function ServicesPage() {
  return (
    <section className="grid gap-6">
      <header className="glass-surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">Our Services</p>
        <h1 className="mt-2 font-display text-4xl text-slate-900">Built for retail, SMEs, and enterprise treasury teams</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">
          Premium FX execution backed by transparent pricing, operational rigor, and dedicated support across major corridors.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-skybrand-100 bg-white/70 p-3 md:grid-cols-4">
        {processSteps.map((step, index) => (
          <article key={step} className="rounded-xl bg-skybrand-50/70 px-3 py-3 text-sm font-semibold text-slate-700">
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-skybrand-600">Step {index + 1}</p>
            <p className="mt-1">{step}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <article key={service.title} className="glass-surface rounded-2xl p-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-skybrand-100 text-skybrand-700">
              <service.icon />
            </div>
            <h2 className="mt-3 font-display text-xl text-slate-900">{service.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{service.detail}</p>
          </article>
        ))}
      </div>

      <article className="rounded-3xl border border-skybrand-100 bg-gradient-to-r from-skybrand-50 to-white p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">Need tailored pricing?</p>
        <h2 className="mt-2 font-display text-2xl text-slate-900">Talk to our FX desk for a custom execution plan</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/contact" className="rounded-xl bg-skybrand-600 px-4 py-2 text-sm font-semibold text-white">
            Contact Desk
          </Link>
          <Link to="/calculator" className="rounded-xl border border-skybrand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Simulate Conversion
          </Link>
        </div>
      </article>
    </section>
  )
}

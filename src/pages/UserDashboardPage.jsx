import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiBell, FiDollarSign, FiRepeat, FiStar } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import { http } from '../lib/http'

export default function UserDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn: async () => (await http.get('/analytics/user')).data,
  })

  const model = data || {
    walletBalance: 0,
    monthlyExchanges: 0,
    favoriteCurrencies: [],
    alerts: 0,
  }

  const hasActivity = model.monthlyExchanges > 0 || model.alerts > 0 || model.favoriteCurrencies.length > 0

  if (isLoading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <article key={idx} className="glass-surface rounded-2xl p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-skybrand-100" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-skybrand-100" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-skybrand-100" />
          </article>
        ))}
      </section>
    )
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard title="Wallet Balance" value={`$ ${Number(model.walletBalance).toLocaleString()}`} subtitle="Available for settlement" />
        <GlassCard title="Monthly Exchanges" value={model.monthlyExchanges} subtitle={model.monthlyExchanges > 0 ? 'Active this month' : 'No exchanges yet'} />
        <GlassCard title="Favorite Currencies" value={model.favoriteCurrencies.join(', ') || '-'} subtitle="Most traded pairs" />
        <GlassCard title="Alerts" value={model.alerts} subtitle={model.alerts > 0 ? 'Action recommended' : 'All clear'} />
      </div>

      {!hasActivity ? (
        <article className="rounded-3xl border border-skybrand-100 bg-gradient-to-r from-white to-skybrand-50 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">No activity yet</p>
          <h2 className="mt-2 font-display text-2xl text-slate-900">Start your first FX workflow</h2>
          <p className="mt-2 text-sm text-slate-700">Use the tools below to simulate rates and create your first conversion request.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/calculator" className="rounded-xl bg-skybrand-600 px-4 py-2 text-sm font-semibold text-white">
              Open Calculator
            </Link>
            <Link to="/rates" className="rounded-xl border border-skybrand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              View Live Rates
            </Link>
          </div>
        </article>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass-surface rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-skybrand-700"><FiRepeat /> Transactions</p>
          <p className="mt-2 text-sm text-slate-700">Track initiated, pending, and completed exchanges in one place.</p>
        </article>
        <article className="glass-surface rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-skybrand-700"><FiDollarSign /> Balances</p>
          <p className="mt-2 text-sm text-slate-700">Monitor wallet movements and settlement outcomes with clarity.</p>
        </article>
        <article className="glass-surface rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-skybrand-700"><FiBell /> Alerts</p>
          <p className="mt-2 text-sm text-slate-700">Receive updates on large moves, execution events, and approvals.</p>
        </article>
        <article className="glass-surface rounded-2xl p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-skybrand-700"><FiStar /> Favorites</p>
          <p className="mt-2 text-sm text-slate-700">Pin your preferred pairs for faster daily conversion workflows.</p>
        </article>
      </div>
    </section>
  )
}

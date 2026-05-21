import { useQuery } from '@tanstack/react-query'
import { FiAlertTriangle, FiClock, FiMapPin, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { http } from '../../lib/http'

function StatCard({ title, value, hint, tone = 'sky' }) {
  const toneClass = {
    sky: 'from-skybrand-500 to-skybrand-700',
    green: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
  }[tone]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${toneClass}`} />
    </article>
  )
}

export default function AdminOverviewPage() {
  const analyticsQuery = useQuery({
    queryKey: ['admin-overview-analytics'],
    queryFn: async () => (await http.get('/analytics/admin')).data,
  })

  const usersQuery = useQuery({
    queryKey: ['admin-overview-users'],
    queryFn: async () => (await http.get('/admin/users')).data.users,
  })

  const kycQuery = useQuery({
    queryKey: ['admin-overview-kyc'],
    queryFn: async () => (await http.get('/admin/kyc')).data.queue,
  })

  const branchesQuery = useQuery({
    queryKey: ['admin-overview-branches'],
    queryFn: async () => (await http.get('/admin/branches')).data.branches,
  })

  const logsQuery = useQuery({
    queryKey: ['admin-overview-audit'],
    queryFn: async () => (await http.get('/admin/audit-logs')).data.logs,
  })

  const loading =
    analyticsQuery.isLoading ||
    usersQuery.isLoading ||
    kycQuery.isLoading ||
    branchesQuery.isLoading ||
    logsQuery.isLoading

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    )
  }

  const analytics = analyticsQuery.data || {}
  const users = usersQuery.data || []
  const kyc = kycQuery.data || []
  const branches = branchesQuery.data || []
  const logs = logsQuery.data || []

  const activeBranches = branches.filter((row) => row.status === 'active').length

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          hint="Registered users"
          tone="sky"
        />
        <StatCard
          title="KYC Pending"
          value={kyc.length}
          hint="Requires review"
          tone="amber"
        />
        <StatCard
          title="Active Branches"
          value={activeBranches}
          hint={`${branches.length} configured branches`}
          tone="green"
        />
        <StatCard
          title="Fraud Alerts"
          value={analytics.fraudAlerts ?? 0}
          hint="From analytics engine"
          tone="rose"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-display text-xl text-slate-900">Operational Insights</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-skybrand-100 bg-skybrand-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Revenue</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{Number(analytics.revenue || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-skybrand-100 bg-skybrand-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{Number(analytics.activeUsers || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-skybrand-100 bg-skybrand-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Transactions / Min</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{analytics.transactionsPerMinute || 0}</p>
            </div>
            <div className="rounded-xl border border-skybrand-100 bg-skybrand-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Recent Logs</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{logs.length}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-display text-xl text-slate-900">Branch Demand Heatmap</h3>
          <div className="mt-4 grid gap-2">
            {(analytics.branchLoadHeatmap || []).map((row) => {
              const pct = Math.max(0, Math.min(100, Math.round((row.demand || 0) * 100)))
              return (
                <div key={row.branch} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{row.branch}</span>
                    <span className="text-slate-500">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-skybrand-500 to-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="font-display text-xl text-slate-900">Recent Audit Activity</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-2">Action</th>
                  <th className="px-2 py-2">Entity</th>
                  <th className="px-2 py-2">IP</th>
                  <th className="px-2 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 8).map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-none">
                    <td className="px-2 py-2 font-medium text-slate-700">{row.action}</td>
                    <td className="px-2 py-2 text-slate-600">{row.entity}</td>
                    <td className="px-2 py-2 text-slate-600">{row.ip_address || '-'}</td>
                    <td className="px-2 py-2 text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-display text-xl text-slate-900">At a Glance</h3>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <FiUsers className="text-skybrand-600" /> {users.length} users managed
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <FiClock className="text-amber-500" /> {kyc.length} pending KYC items
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <FiMapPin className="text-emerald-600" /> {activeBranches} active branches
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <FiTrendingUp className="text-purple-600" /> {analytics.transactionsPerMinute || 0} txn/min
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <FiAlertTriangle className="text-rose-600" /> {analytics.fraudAlerts || 0} fraud alerts
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

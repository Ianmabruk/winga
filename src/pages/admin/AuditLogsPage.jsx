import { useQuery } from '@tanstack/react-query'
import { http } from '../../lib/http'

export default function AuditLogsPage() {
  const query = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => (await http.get('/admin/audit-logs')).data.logs,
  })

  return (
    <div className="grid gap-4">
      <h2 className="font-display text-2xl">Audit Log Explorer</h2>
      {query.isError ? <p className="text-sm text-rose-600">Unable to load audit logs right now.</p> : null}
      <article className="overflow-x-auto rounded-2xl border border-skybrand-100 bg-white/80">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-skybrand-100 bg-skybrand-50">
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(query.data || []).map((row) => (
              <tr key={row.id} className="border-b border-skybrand-100/70 last:border-none">
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3">{row.entity}</td>
                <td className="px-4 py-3">{row.entity_id || '-'}</td>
                <td className="px-4 py-3">{row.ip_address || '-'}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  )
}

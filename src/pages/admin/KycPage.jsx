import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminTable from '../../components/AdminTable'
import { http } from '../../lib/http'

export default function KycPage() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: async () => (await http.get('/admin/kyc')).data.queue,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => http.patch(`/admin/kyc/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }),
  })

  return (
    <div className="grid gap-4">
      <h2 className="font-display text-2xl">KYC Verification Queue</h2>
      {query.isError ? <p className="text-sm text-rose-600">Unable to load KYC queue right now.</p> : null}
      <AdminTable
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'kyc_status', label: 'Current Status' },
        ]}
        rows={query.data || []}
        actions={(row) => (
          <div className="flex gap-2">
            <button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: row.id, status: 'approved' })} className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">Approve</button>
            <button disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: row.id, status: 'rejected' })} className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60">Reject</button>
          </div>
        )}
      />
    </div>
  )
}

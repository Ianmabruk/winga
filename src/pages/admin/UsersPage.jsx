import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import AdminTable from '../../components/AdminTable'
import { http } from '../../lib/http'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'client' })

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await http.get('admin/users')).data.users,
  })

  const createMutation = useMutation({
    mutationFn: async () => http.post('admin/users', form),
    onSuccess: () => {
      setForm({ fullName: '', email: '', phone: '', role: 'client' })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteMutation = useMutation({
      mutationFn: async (id) => http.delete(`admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const rows = usersQuery.data || []

  return (
    <div className="grid gap-4">
      <article className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-glass">
        <h2 className="font-display text-2xl">User Management</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            createMutation.mutate()
          }}
        >
          <input required className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <input required type="email" className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <input className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <div className="flex gap-2">
            <select className="w-full rounded-xl border border-skybrand-200 px-3 py-2" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
            <button disabled={createMutation.isPending} className="rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{createMutation.isPending ? 'Saving' : 'Add'}</button>
          </div>
        </form>
        {(createMutation.isError || usersQuery.isError) && (
          <p className="mt-3 text-sm text-rose-600">Unable to load or save users right now.</p>
        )}
      </article>

      <AdminTable
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role' },
          { key: 'kyc_status', label: 'KYC' },
        ]}
        rows={rows}
        actions={(row) => (
          <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(row.id)} className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
        )}
      />
    </div>
  )
}

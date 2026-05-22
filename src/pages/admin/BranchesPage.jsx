import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import AdminTable from '../../components/AdminTable'
import { http } from '../../lib/http'

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', city: '', country: 'Kenya', status: 'active' })

  const query = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => (await http.get('/admin/branches')).data.branches,
  })

  const addMutation = useMutation({
    mutationFn: async () => http.post('/admin/branches', form),
    onSuccess: () => {
      setForm({ name: '', city: '', country: 'Kenya', status: 'active' })
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => http.delete(`/admin/branches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-branches'] }),
  })

  return (
    <div className="grid gap-4">
      <article className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-glass">
        <h2 className="font-display text-2xl">Branch Management</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault()
            addMutation.mutate()
          }}
        >
          <input required className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Branch name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <input required className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="City" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          <input required className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Country" value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))} />
          <button disabled={addMutation.isPending} className="rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{addMutation.isPending ? 'Creating' : 'Create'}</button>
        </form>
        {(addMutation.isError || query.isError) && (
          <p className="mt-3 text-sm text-rose-600">Unable to load or save branches right now.</p>
        )}
      </article>

      <AdminTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'city', label: 'City' },
          { key: 'country', label: 'Country' },
          { key: 'status', label: 'Status' },
        ]}
        rows={query.data || []}
        actions={(row) => (
          <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(row.id)} className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
        )}
      />
    </div>
  )
}

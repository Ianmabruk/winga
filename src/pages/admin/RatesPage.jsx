import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { http } from '../../lib/http'
import { useForexStore } from '../../store/useForexStore'
import { useBranches } from '../../hooks/useBranches'
import { useRates } from '../../hooks/useRates'
import { formatTime, formatDateTime } from '../../utils/formatters'

export default function RatesPage() {
  const queryClient = useQueryClient()
  const { ratesData, lastUpdated } = useForexStore()
  const { refetch } = useRates()
  useBranches()

  const availableCodes = ratesData?.map((r) => r.currency_code) || []

  const [selectedCode, setSelectedCode] = useState(availableCodes[0] || 'USD')

  const currentRate = ratesData?.find((r) => r.currency_code === selectedCode)

  const historyQuery = useQuery({
    queryKey: ['admin-rates-history'],
    queryFn: async () => (await http.get('rates/history')).data.history,
  })

  const updateMutation = useMutation({
    mutationFn: async (values) =>
      http.put('rates', {
        rates: {
          [values.code]: {
            buy: Number(values.buy),
            sell: Number(values.sell),
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rates-history'] })
      queryClient.invalidateQueries({ queryKey: ['rates'] })
      refetch()
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.target
    const buy = form.buy.value
    const sell = form.sell.value
    updateMutation.mutate({ code: selectedCode, buy, sell })
  }

  return (
    <div className="grid gap-4">
      <article className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-glass">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Rate Management</h2>
          <span className="text-xs text-slate-500">
            Last Updated: {lastUpdated ? formatTime(lastUpdated) : 'Loading...'}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Manually update exchange rates. Changes are broadcast to all connected clients in real time.
        </p>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={handleSubmit}
        >
          <select className="rounded-xl border border-skybrand-200 px-3 py-2" value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
            {availableCodes.map((code) => <option key={code}>{code}</option>)}
          </select>
          <input className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Buy" name="buy" defaultValue={String(currentRate?.buying_rate || '')} />
          <input className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Sell" name="sell" defaultValue={String(currentRate?.selling_rate || '')} />
          <button disabled={updateMutation.isPending} className="rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{updateMutation.isPending ? 'Publishing' : 'Publish'}</button>
        </form>
        {updateMutation.isSuccess && (
          <p className="mt-3 text-sm text-emerald-600">Rates updated successfully and broadcast to all clients.</p>
        )}
        {(updateMutation.isError || historyQuery.isError) && (
          <p className="mt-3 text-sm text-rose-600">Unable to load or publish rates right now.</p>
        )}
      </article>

      <article className="overflow-x-auto rounded-2xl border border-skybrand-100 bg-white/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-skybrand-100 bg-skybrand-50">
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Currency Name</th>
              <th className="px-4 py-3">Buy</th>
              <th className="px-4 py-3">Sell</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Effective Date</th>
            </tr>
          </thead>
          <tbody>
            {(historyQuery.data || []).map((row, index) => (
              <tr key={`${row.currency_code}_${index}`} className="border-b border-skybrand-100/70 last:border-none">
                <td className="px-4 py-3 font-medium">{row.currency_code}</td>
                <td className="px-4 py-3">{row.currency_actual_name || row.currency_name}</td>
                <td className="px-4 py-3">{row.buying_rate}</td>
                <td className="px-4 py-3">{row.selling_rate}</td>
                <td className="px-4 py-3">{row.source}</td>
                <td className="px-4 py-3">{formatTime(row.updated_at)}</td>
                <td className="px-4 py-3">{formatDateTime(row.effective_date_and_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  )
}
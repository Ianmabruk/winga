import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { http } from '../../lib/http'
import { supportedCurrencies } from '../../data/currencies'

export default function RatesPage() {
  const queryClient = useQueryClient()
  const [rateForm, setRateForm] = useState({ code: 'USD', buy: '129.9', sell: '131.2' })

  const historyQuery = useQuery({
    queryKey: ['admin-rates-history'],
    queryFn: async () => (await http.get('/rates/history')).data.history,
  })

  const updateMutation = useMutation({
    mutationFn: async () =>
      http.put('/rates', {
        rates: {
          [rateForm.code]: {
            buy: Number(rateForm.buy),
            sell: Number(rateForm.sell),
          },
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-rates-history'] }),
  })

  return (
    <div className="grid gap-4">
      <article className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-glass">
        <h2 className="font-display text-2xl">Rate Management</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault()
            updateMutation.mutate()
          }}
        >
          <select className="rounded-xl border border-skybrand-200 px-3 py-2" value={rateForm.code} onChange={(event) => setRateForm((prev) => ({ ...prev, code: event.target.value }))}>
            {supportedCurrencies.map((code) => <option key={code}>{code}</option>)}
          </select>
          <input className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Buy" value={rateForm.buy} onChange={(event) => setRateForm((prev) => ({ ...prev, buy: event.target.value }))} />
          <input className="rounded-xl border border-skybrand-200 px-3 py-2" placeholder="Sell" value={rateForm.sell} onChange={(event) => setRateForm((prev) => ({ ...prev, sell: event.target.value }))} />
          <button disabled={updateMutation.isPending} className="rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{updateMutation.isPending ? 'Publishing' : 'Publish'}</button>
        </form>
        {(updateMutation.isError || historyQuery.isError) && (
          <p className="mt-3 text-sm text-rose-600">Unable to load or publish rates right now.</p>
        )}
      </article>

      <article className="overflow-x-auto rounded-2xl border border-skybrand-100 bg-white/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-skybrand-100 bg-skybrand-50">
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Buy</th>
              <th className="px-4 py-3">Sell</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(historyQuery.data || []).map((row, index) => (
              <tr key={`${row.currency_code}_${index}`} className="border-b border-skybrand-100/70 last:border-none">
                <td className="px-4 py-3">{row.currency_code}</td>
                <td className="px-4 py-3">{row.buy}</td>
                <td className="px-4 py-3">{row.sell}</td>
                <td className="px-4 py-3">{row.source}</td>
                <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  )
}

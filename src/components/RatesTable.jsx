import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronUp, FiChevronDown, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { getFlagUrl } from '../data/flags'
import { formatRate, formatDateTime, spreadPercent } from '../utils/formatters'
import { useForexStore } from '../store/useForexStore'

const SORT_FIELDS = {
  sequence: (a, b) => a.currency_sequence - b.currency_sequence,
  code: (a, b) => a.currency_code.localeCompare(b.currency_code),
  buy: (a, b) => a.buying_rate - b.buying_rate,
  sell: (a, b) => a.selling_rate - b.selling_rate,
  spread: (a, b) =>
    spreadPercent(a.buying_rate, a.selling_rate) -
    spreadPercent(b.buying_rate, b.selling_rate),
}

function SortIcon({ active, dir }) {
  if (!active) return <FiChevronUp className="opacity-20" size={12} />
  return dir === 'asc'
    ? <FiChevronUp className="text-skybrand-500" size={12} />
    : <FiChevronDown className="text-skybrand-500" size={12} />
}

export default function RatesTable({ data = [], isLoading }) {
  const { searchQuery, changedCurrencies, previousRatesMap, favorites } = useForexStore()
  const [sortField, setSortField] = useState('sequence')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const rows = useMemo(() => {
    let filtered = data
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = data.filter(
        (r) =>
          r.currency_code.toLowerCase().includes(q) ||
          r.currency_actual_name?.toLowerCase().includes(q),
      )
    }
    const sorter = SORT_FIELDS[sortField] || SORT_FIELDS.sequence
    const sorted = [...filtered].sort(sorter)
    return sortDir === 'desc' ? sorted.reverse() : sorted
  }, [data, searchQuery, sortField, sortDir])

  const cols = [
    { key: 'sequence', label: '#', sortable: true, cls: 'w-11 text-center' },
    { key: 'code', label: 'Currency', sortable: true, cls: 'min-w-[170px]' },
    { key: '_name', label: 'Full Name', sortable: false, cls: 'hidden lg:table-cell min-w-[220px]' },
    { key: 'buy', label: 'Buying (TZS)', sortable: true, cls: 'text-right min-w-[140px]' },
    { key: 'sell', label: 'Selling (TZS)', sortable: true, cls: 'text-right min-w-[140px]' },
    { key: 'spread', label: 'Spread %', sortable: true, cls: 'hidden md:table-cell text-right min-w-[90px]' },
    { key: '_updated', label: 'Updated', sortable: false, cls: 'hidden xl:table-cell text-right min-w-[170px]' },
  ]

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-cyanice bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-4 py-3">
            <div className="h-4 w-6 animate-pulse rounded bg-skybrand-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-skybrand-100" />
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-skybrand-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-skybrand-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-800">No exchange rates available</p>
        <p className="mt-1 text-sm text-amber-700">
          {searchQuery ? 'Try a different search term.' : 'Please select a branch or check your connection.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-cyanice bg-white shadow-sm">
      <table className="w-full min-w-full table-auto text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {cols.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.cls}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex max-w-full items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis hover:text-slate-800 transition"
                  >
                    {col.label}
                    <SortIcon active={sortField === col.key} dir={sortDir} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((rate, idx) => {
              const prev = previousRatesMap[rate.currency_code]
              const changed = changedCurrencies.includes(rate.currency_code)
              const buyUp = prev && rate.buying_rate > prev.buying_rate
              const buyDown = prev && rate.buying_rate < prev.buying_rate
              const sellUp = prev && rate.selling_rate > prev.selling_rate
              const sellDown = prev && rate.selling_rate < prev.selling_rate
              const isFav = favorites.includes(rate.currency_code)

              return (
                <motion.tr
                  key={rate.currency_code}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-b border-slate-50 transition-colors ${
                    changed ? 'bg-skybrand-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  } hover:bg-skybrand-50/40`}
                >
                  {/* Sequence */}
                  <td className="px-3 py-3 text-center text-xs text-slate-400 whitespace-nowrap">
                    {isFav ? '★' : rate.currency_sequence}
                  </td>

                  {/* Currency code + flag */}
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img
                        src={getFlagUrl(rate.currency_code)}
                        alt={rate.currency_code}
                        className="h-4 w-6 rounded-sm object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/flags/fallback.svg' }}
                      />
                      <div className="min-w-0">
                        <span className="block truncate font-bold text-slate-900">{rate.currency_code}</span>
                        <span className="ml-1.5 hidden max-w-[120px] truncate text-xs text-slate-500 sm:inline-block">
                          {rate.currency_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Full name */}
                  <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                    <span className="block max-w-[260px] break-words text-sm leading-5">
                      {rate.currency_actual_name}
                    </span>
                  </td>

                  {/* Buying rate */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {buyUp && <FiTrendingUp size={11} className="text-green-500" />}
                      {buyDown && <FiTrendingDown size={11} className="text-red-400" />}
                      <span
                        className={`font-semibold ${
                          buyUp ? 'text-green-600' : buyDown ? 'text-red-500' : 'text-slate-900'
                        } whitespace-nowrap text-[clamp(0.76rem,1.95vw,0.92rem)]`}
                      >
                        {formatRate(rate.buying_rate)}
                      </span>
                    </div>
                  </td>

                  {/* Selling rate */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {sellUp && <FiTrendingUp size={11} className="text-green-500" />}
                      {sellDown && <FiTrendingDown size={11} className="text-red-400" />}
                      <span
                        className={`font-semibold ${
                          sellUp ? 'text-green-600' : sellDown ? 'text-red-500' : 'text-slate-900'
                        } whitespace-nowrap text-[clamp(0.76rem,1.95vw,0.92rem)]`}
                      >
                        {formatRate(rate.selling_rate)}
                      </span>
                    </div>
                  </td>

                  {/* Spread */}
                  <td className="hidden px-3 py-3 text-right text-xs text-slate-500 md:table-cell whitespace-nowrap">
                    {spreadPercent(rate.buying_rate, rate.selling_rate).toFixed(2)}%
                  </td>

                  {/* Last updated */}
                  <td className="hidden px-3 py-3 text-right text-xs text-slate-400 xl:table-cell whitespace-nowrap">
                    {formatDateTime(rate.effective_date_and_time)}
                  </td>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

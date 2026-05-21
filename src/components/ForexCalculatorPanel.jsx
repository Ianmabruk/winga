import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiRepeat, FiDollarSign, FiInfo } from 'react-icons/fi';
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { getFlagUrl } from '../data/flags'
import { formatRate, formatTZS } from '../utils/formatters'

/**
 * TZS-based forex calculator.
 *
 * Conversion logic:
 *   Foreign → TZS : amount × buying_rate   (bureau buys foreign from you)
 *   TZS → Foreign : amount / selling_rate  (bureau sells foreign to you)
 *   Cross-currency: Foreign_A → TZS → Foreign_B
 */
function calcConversion({ amount, fromRate, toRate, mode }) {
  const n = Number(amount) || 0
  if (!fromRate || !toRate || n <= 0) return { result: 0, rate: 0, fee: 0 }

  let result
  let effectiveRate

  if (mode === 'buy') {
    // Customer buys foreign → bureau sells at selling_rate
    result = n / toRate.selling_rate
    effectiveRate = toRate.selling_rate
  } else {
    // Customer sells foreign → bureau buys at buying_rate
    result = n * fromRate.buying_rate
    effectiveRate = fromRate.buying_rate
  }

  const fee = result * 0.002 // 0.2% service fee indicator
  return { result, effectiveRate, fee }
}

const MODE_OPTIONS = [
  { value: 'sell', label: 'I\'m Selling (to bureau)' },
  { value: 'buy', label: 'I\'m Buying (from bureau)' },
]

export default function ForexCalculatorPanel({ full = false }) {
  useRates()
  const { ratesData, ratesMap, selectedBranch } = useForexStore()
  const [amount, setAmount] = useState('1000')
  const [fromCode, setFromCode] = useState('USD')
  const [toCode, setToCode] = useState('TZS')
  const [mode, setMode] = useState('sell')
  const [history, setHistory] = useState([])

  const currencyOptions = useMemo(() => {
    const options = ratesData.map((r) => ({
      code: r.currency_code,
      name: r.currency_actual_name,
    }))
    // Ensure TZS is always in the list as the base
    if (!options.find((o) => o.code === 'TZS')) {
      options.unshift({ code: 'TZS', name: 'TANZANIAN SHILLINGS (Base)' })
    }
    return options
  }, [ratesData])

  const fromRate = ratesMap[fromCode]
  const toRate = ratesMap[toCode]

  // Normalized calculation: always go through TZS
  const { result, effectiveRate } = useMemo(() => {
    const n = Number(amount) || 0
    if (n <= 0) return { result: 0, effectiveRate: 0 }

    let tzsAmount
    let finalAmount

    if (fromCode === 'TZS') {
      // TZS → Foreign: bureau sells foreign at selling_rate
      tzsAmount = n
      const to = toRate
      finalAmount = to ? tzsAmount / to.selling_rate : 0
      return { result: finalAmount, effectiveRate: to?.selling_rate || 0 }
    } else if (toCode === 'TZS') {
      // Foreign → TZS: bureau buys foreign at buying_rate
      const from = fromRate
      tzsAmount = from ? n * from.buying_rate : 0
      return { result: tzsAmount, effectiveRate: from?.buying_rate || 0 }
    } else {
      // Cross: Foreign_A → TZS (buy) → Foreign_B (sell)
      const from = fromRate
      const to = toRate
      if (!from || !to) return { result: 0, effectiveRate: 0 }
      tzsAmount = n * from.buying_rate
      finalAmount = tzsAmount / to.selling_rate
      return { result: finalAmount, effectiveRate: from.buying_rate }
    }
  }, [amount, fromCode, toCode, fromRate, toRate])

  const swap = () => {
    setFromCode(toCode)
    setToCode(fromCode)
  }

  const saveToHistory = () => {
    if (!result) return
    setHistory((prev) => [
      {
        id: Date.now(),
        from: fromCode,
        to: toCode,
        amount: Number(amount),
        result,
        at: new Date().toLocaleString(),
      },
      ...prev,
    ].slice(0, 10))
  }

  const CurrencySelect = ({ value, onChange, label }) => (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <div className="relative flex items-center">
        <img
          src={getFlagUrl(value)}
          alt={value}
          className="absolute left-3 h-4 w-6 rounded-sm object-cover"
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-skybrand-200 bg-white py-3 pl-11 pr-3 text-sm outline-none focus:border-skybrand-400 focus:ring-2 focus:ring-skybrand-100"
        >
          {/* TZS base option */}
          <option value="TZS">TZS — TANZANIAN SHILLINGS</option>
          {currencyOptions
            .filter((o) => o.code !== 'TZS')
            .map((o) => (
              <option key={o.code} value={o.code}>
                {o.code} — {o.name}
              </option>
            ))}
        </select>
      </div>
    </label>
  )

  return (
    <section className="glass-surface rounded-3xl p-5 lg:p-7">
      {/* Branch context */}
      {selectedBranch && (
        <p className="mb-4 text-xs text-slate-500">
          Rates from{' '}
          <span className="font-semibold text-skybrand-700">{selectedBranch.branch_name}</span>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <div className="grid gap-4">
          <h2 className="font-display text-2xl text-slate-900">Currency Calculator</h2>
          <p className="text-sm text-slate-600">Real-time TZS rates. Buying = bureau pays you. Selling = bureau charges you.</p>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-skybrand-200 bg-slate-50 p-1">
            {MODE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setMode(o.value)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                  mode === o.value
                    ? 'bg-skybrand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Amount
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-skybrand-200 bg-white py-3 pl-9 pr-3 text-lg font-semibold outline-none focus:border-skybrand-400 focus:ring-2 focus:ring-skybrand-100"
                placeholder="0.00"
              />
            </div>
          </label>

          {/* Currency pair */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <CurrencySelect value={fromCode} onChange={setFromCode} label="From" />
            <motion.button
              onClick={swap}
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.25 }}
              className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-skybrand-500 text-white shadow-glass hover:bg-skybrand-600 transition"
              aria-label="Swap currencies"
            >
              <FiRepeat size={16} />
            </motion.button>
            <CurrencySelect value={toCode} onChange={setToCode} label="To" />
          </div>

          <button
            onClick={saveToHistory}
            className="rounded-xl bg-skybrand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-skybrand-600 active:scale-95"
          >
            Save to History
          </button>
        </div>

        {/* Result panel */}
        <div className="flex flex-col gap-4">
          <motion.div
            key={result}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-skybrand-100 bg-gradient-to-br from-white to-skybrand-50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">You Receive</p>
            <p className="mt-2 font-display text-4xl font-bold text-slate-900">
              {result > 0
                ? result < 1
                  ? result.toFixed(6)
                  : formatTZS(result, result < 100 ? 4 : 2)
                : '—'}
            </p>
            <p className="mt-1 text-sm font-semibold text-skybrand-700">{toCode}</p>

            <div className="my-4 h-px bg-gradient-to-r from-skybrand-200 to-transparent" />

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Amount</span>
                <span className="font-semibold">
                  {formatTZS(Number(amount) || 0, 2)} {fromCode}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Effective Rate</span>
                <span className="font-semibold">
                  1 {fromCode === 'TZS' ? toCode : fromCode} ={' '}
                  {formatRate(effectiveRate)} TZS
                </span>
              </div>
              {fromCode !== 'TZS' && toCode !== 'TZS' && (
                <div className="flex items-center gap-1 text-xs text-amber-700">
                  <FiInfo size={11} />
                  Cross-rate: converted via TZS
                </div>
              )}
            </div>
          </motion.div>

          {/* Rate info */}
          {fromCode !== 'TZS' && fromRate && (
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">{fromCode} Rates (TZS)</p>
              <div className="mt-1 flex gap-4">
                <span>Buy: <strong>{formatRate(fromRate.buying_rate)}</strong></span>
                <span>Sell: <strong>{formatRate(fromRate.selling_rate)}</strong></span>
              </div>
            </div>
          )}
          {toCode !== 'TZS' && toRate && toCode !== fromCode && (
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">{toCode} Rates (TZS)</p>
              <div className="mt-1 flex gap-4">
                <span>Buy: <strong>{formatRate(toRate.buying_rate)}</strong></span>
                <span>Sell: <strong>{formatRate(toRate.selling_rate)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History (full mode) */}
      {full && history.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">Conversion History</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-2 pr-4">Pair</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Result</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-50 text-slate-700">
                    <td className="py-2 pr-4 font-semibold">{h.from}/{h.to}</td>
                    <td className="py-2 pr-4">{formatTZS(h.amount, 2)}</td>
                    <td className="py-2 pr-4 font-semibold text-skybrand-700">
                      {formatTZS(h.result, 4)}
                    </td>
                    <td className="py-2 text-slate-500">{h.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

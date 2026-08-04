import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiRepeat, FiInfo } from 'react-icons/fi';
import { useRates } from '../hooks/useRates'
import { useForexStore } from '../store/useForexStore'
import { formatRate, formatTZS } from '../utils/formatters'
import { supportedCurrencies } from '../data/currencies'
import Flag from './Flag'

const MODE_OPTIONS = [
  { value: 'sell', label: "I'm Selling (to bureau)" },
  { value: 'buy', label: "I'm Buying (from bureau)" },
]

const currencySymbols = {
  USD: '$',
  TZS: 'TZS',
  KES: 'KSh',
  KWD: 'KD',
  EUR: '€',
  GBP: '£',
  AED: 'AED',
  UGX: 'UGX',
  RWF: 'RWF',
  BIF: 'BIF',
  JPY: '¥',
  CNY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
}

function CurrencySelect({ value, onChange, label, currencyOptions }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <div className="relative flex items-center">
        <Flag code={value} size="md" className="absolute left-3 flex-shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 rounded-xl border border-skybrand-200 bg-white py-3 pl-11 pr-3 text-sm outline-none focus:border-skybrand-400 focus:ring-2 focus:ring-skybrand-100"
        >
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
}

export default function ForexCalculatorPanel({ full = false }) {
  const { isError } = useRates()
  const { ratesData, ratesMap, selectedBranch } = useForexStore()
  const [amount, setAmount] = useState('1000')
  const [fromCode, setFromCode] = useState('USD')
  const [toCode, setToCode] = useState('TZS')
  const [mode, setMode] = useState('sell')
  const [history, setHistory] = useState([])
  const hasData = ratesData.length > 0

  const currencyOptions = useMemo(() => {
    const baseOptions = supportedCurrencies.map((code) => ({
      code,
      name: code === 'TZS' ? 'TANZANIAN SHILLINGS (Base)' : code,
    }))

    if (ratesData.length > 0) {
      return baseOptions.map((opt) => {
        const live = ratesData.find((r) => r.currency_code === opt.code)
        return live ? { ...opt, name: live.currency_actual_name || opt.name } : opt
      })
    }

    return baseOptions
  }, [ratesData])

  const fromRate = ratesMap[fromCode]
  const toRate = ratesMap[toCode]

  const { result, effectiveRate } = useMemo(() => {
    const n = Number(amount) || 0
    if (n <= 0) return { result: 0, effectiveRate: 0 }

    // Bureau rate semantics, driven by the user's selected mode:
    //  - 'sell' (selling the FROM currency to the bureau) -> bureau BUY rate
    //  - 'buy'  (buying the FROM currency from the bureau) -> bureau SELL rate
    const fromSide = mode === 'sell' ? 'buying_rate' : 'selling_rate'
    const toSide = mode === 'buy' ? 'selling_rate' : 'buying_rate'

    let tzsAmount
    let finalAmount

    if (fromCode === 'TZS') {
      const to = toRate
      const tzsToForeignSide = 'selling_rate'
      finalAmount = to ? n / Number(to[tzsToForeignSide]) : 0
      return { result: finalAmount, effectiveRate: to ? Number(to[tzsToForeignSide]) : 0 }
    } else if (toCode === 'TZS') {
      const from = fromRate
      tzsAmount = from ? n * Number(from[fromSide]) : 0
      return { result: tzsAmount, effectiveRate: from ? Number(from[fromSide]) : 0 }
    } else {
      const from = fromRate
      const to = toRate
      if (!from || !to) return { result: 0, effectiveRate: 0 }
      tzsAmount = n * Number(from[fromSide])
      finalAmount = tzsAmount / Number(to[toSide])
      return { result: finalAmount, effectiveRate: Number(from[fromSide]) }
    }
  }, [amount, fromCode, toCode, fromRate, toRate, mode])

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

  return (
    <section className="glass-surface overflow-hidden rounded-3xl p-4 sm:p-5 lg:p-7">
      {selectedBranch && (
        <p className="mb-4 text-xs text-slate-500">
          Rates from{' '}
          <span className="font-semibold text-skybrand-700">{selectedBranch.branch_name}</span>
        </p>
      )}

      {isError && !hasData && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          Live rates are currently unavailable. Please check your connection and try again later.
        </div>
      )}
      {isError && hasData && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Connection interrupted — showing last successful rates. Retrying automatically...
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4">
          <h2 className="font-display text-[clamp(1.3rem,3.7vw,1.9rem)] text-slate-900">Currency Calculator</h2>
          <p className="text-sm text-slate-600">Real-time TZS rates. Buying = bureau pays you. Selling = bureau charges you.</p>

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

           <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
             Amount
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                 {currencySymbols[fromCode] || fromCode}
               </span>
               <input
                 type="number"
                 min="0"
                 step="any"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full min-w-0 rounded-xl border border-skybrand-200 bg-white py-3 pl-14 pr-3 text-[clamp(1rem,4.2vw,1.15rem)] font-semibold outline-none focus:border-skybrand-400 focus:ring-2 focus:ring-skybrand-100"
                 placeholder={`Enter amount in ${currencySymbols[fromCode] || fromCode}`}
               />
             </div>
           </label>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
            <CurrencySelect value={fromCode} onChange={setFromCode} label="From" currencyOptions={currencyOptions} />
            <motion.button
              onClick={swap}
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.25 }}
              className="mx-auto mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-skybrand-500 text-white shadow-glass hover:bg-skybrand-600 transition sm:mx-0"
              aria-label="Swap currencies"
            >
              <FiRepeat size={16} />
            </motion.button>
            <CurrencySelect value={toCode} onChange={setToCode} label="To" currencyOptions={currencyOptions} />
          </div>

          <button
            onClick={saveToHistory}
            className="rounded-xl bg-skybrand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-skybrand-600 active:scale-95"
          >
            Save to History
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div
            key={result}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-skybrand-100 bg-gradient-to-br from-white to-skybrand-50 p-6"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">You Receive</p>
            <div className="mt-2 min-w-0 px-2">
              <span className="block text-[clamp(1.1rem,4.5vw,1.8rem)] font-bold whitespace-nowrap text-slate-900">
                {result > 0
                  ? result < 1
                    ? result.toFixed(6)
                    : formatTZS(result, result < 100 ? 4 : 2)
                  : '—'}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-skybrand-700">{toCode}</p>

            <div className="my-4 h-px bg-gradient-to-r from-skybrand-200 to-transparent" />

            <div className="grid gap-2 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2 text-slate-600">
                <span>Amount</span>
                <span className="font-semibold">{formatTZS(Number(amount) || 0, 2)} {fromCode}</span>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2 text-slate-600">
                <span>Effective Rate</span>
                <span className="font-semibold">
                  1 {fromCode === 'TZS' ? toCode : fromCode} = {formatRate(effectiveRate)} TZS
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

          {fromCode !== 'TZS' && fromRate && (
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">{fromCode} Rates (TZS)</p>
              <div className="mt-1 flex flex-wrap gap-4">
                <span>Buy: <strong>{formatRate(fromRate.buying_rate)}</strong></span>
                <span>Sell: <strong>{formatRate(fromRate.selling_rate)}</strong></span>
              </div>
            </div>
          )}
          {toCode !== 'TZS' && toRate && toCode !== fromCode && (
            <div className="rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">{toCode} Rates (TZS)</p>
              <div className="mt-1 flex flex-wrap gap-4">
                <span>Buy: <strong>{formatRate(toRate.buying_rate)}</strong></span>
                <span>Sell: <strong>{formatRate(toRate.selling_rate)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {full && history.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">Conversion History</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[620px] table-fixed text-left text-xs">
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
                    <td className="py-2 pr-4 font-semibold whitespace-nowrap">{h.from}/{h.to}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatTZS(h.amount, 2)}</td>
                    <td className="py-2 pr-4 font-semibold text-skybrand-700 whitespace-nowrap">
                      {formatTZS(h.result, 4)}
                    </td>
                    <td className="py-2 text-slate-500 whitespace-nowrap">{h.at}</td>
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
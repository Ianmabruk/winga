import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiRepeat, FiArrowRight } from 'react-icons/fi'
import { useForexStore } from '../../store/useForexStore'
import { getFlagUrl } from '../../data/flags'
import { buildFallbackRatesData } from '../../data/currencies'

function convertAmount(amount, from, to, ratesData) {
  if (!amount || isNaN(amount)) return ''
  const rmap = {}
  ratesData.forEach((r) => { rmap[r.currency_code] = r })
  const num = parseFloat(amount)
  if (from === 'TZS' && to === 'TZS') return num.toLocaleString()
  if (from === 'TZS') {
    const r = rmap[to]
    if (!r) return '—'
    return (num / parseFloat(r.selling_rate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  if (to === 'TZS') {
    const r = rmap[from]
    if (!r) return '—'
    return (num * parseFloat(r.buying_rate)).toLocaleString()
  }
  // cross rate
  const rf = rmap[from], rt = rmap[to]
  if (!rf || !rt) return '—'
  const tzs = num * parseFloat(rf.buying_rate)
  return (tzs / parseFloat(rt.selling_rate)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export default function CalculatorSection() {
  const storeData = useForexStore((s) => s.ratesData)
  const ratesData = storeData && storeData.length ? storeData : buildFallbackRatesData()
  const codes = ['TZS', ...ratesData.map((r) => r.currency_code)].filter((c, i, a) => a.indexOf(c) === i)

  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('TZS')
  const [amount, setAmount] = useState('100')
  const [swapAnim, setSwapAnim] = useState(false)

  const result = convertAmount(amount, from, to, ratesData)

  const handleSwap = () => {
    setSwapAnim(true)
    setTimeout(() => setSwapAnim(false), 400)
    setFrom(to)
    setTo(from)
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-skybrand-950 via-skybrand-900 to-navysoft relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-skybrand-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-[min(1440px,96vw)] px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-3">Smart Calculator</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Currency Converter</h2>
            <p className="text-skybrand-300 leading-relaxed mb-6">
              Get instant conversion between 25+ currencies using Winga's live rates.
              Real-time, accurate, and transparent.
            </p>
            <ul className="grid gap-2 text-sm text-skybrand-300">
              {['Live rates updated every 15 seconds','TZS-based accurate calculations','No hidden fees or spreads shown separately'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400 shrink-0" />{t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: calculator card */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-glass-lg">

            <h3 className="text-white font-bold text-lg mb-5">Convert Currency</h3>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-skybrand-300 uppercase tracking-wider mb-1.5 block">Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl bg-white/15 border border-white/20 px-4 py-3 text-white text-lg font-bold placeholder-white/40 outline-none focus:border-accent-400 transition"
                placeholder="100" min="0" />
            </div>

            {/* From */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-skybrand-300 uppercase tracking-wider mb-1.5 block">From</label>
              <div className="relative">
                <img src={getFlagUrl(from)} alt={from} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-7 rounded object-cover" />
                <select value={from} onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl bg-white/15 border border-white/20 pl-12 pr-4 py-3 text-white font-semibold outline-none focus:border-accent-400 transition appearance-none">
                  {codes.map((c) => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center my-3">
              <motion.button onClick={handleSwap} animate={{ rotate: swapAnim ? 180 : 0 }} transition={{ duration: 0.35 }}
                className="h-10 w-10 rounded-full bg-accent-500 flex items-center justify-center text-white shadow-md hover:bg-accent-600 transition">
                <FiRepeat size={16} />
              </motion.button>
            </div>

            {/* To */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-skybrand-300 uppercase tracking-wider mb-1.5 block">To</label>
              <div className="relative">
                <img src={getFlagUrl(to)} alt={to} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-7 rounded object-cover" />
                <select value={to} onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl bg-white/15 border border-white/20 pl-12 pr-4 py-3 text-white font-semibold outline-none focus:border-accent-400 transition appearance-none">
                  {codes.map((c) => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="rounded-2xl bg-white/20 border border-white/30 p-5 text-center">
              <p className="text-xs text-skybrand-300 mb-1">{amount || '0'} {from} =</p>
              <p className="text-3xl font-extrabold text-white">{result || '—'}</p>
              <p className="text-sm text-skybrand-300 mt-1">{to}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

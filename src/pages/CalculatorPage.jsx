import ForexCalculatorPanel from '../components/ForexCalculatorPanel'

export default function CalculatorPage() {
  return (
    <section className="grid gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">Calculator</p>
        <h1 className="font-display text-4xl text-slate-900">Instant Currency Conversion</h1>
      </div>
      <ForexCalculatorPanel full />
    </section>
  )
}

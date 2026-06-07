import { useState } from 'react'
import WingaForexLogo from '../components/WingaForexLogo'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return setStatus({ type: 'error', message: 'Please complete all fields before sending your inquiry.' })
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (!emailValid) {
      return setStatus({ type: 'error', message: 'Please enter a valid email address.' })
    }

    setStatus({ type: 'success', message: 'Thank you! Your message has been received. We will respond shortly.' })
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <article className="glass-surface rounded-3xl p-8 shadow-[0_18px_56px_rgba(15,23,42,0.08)]">
        <div className="mb-6 inline-flex items-center gap-3 rounded-3xl bg-skybrand-50 px-4 py-3">
          <WingaForexLogo variant="footer" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-skybrand-700">Winga Forex Bureau</p>
            <p className="text-sm text-slate-600">BEST RATES BEST SERVICES</p>
          </div>
        </div>
        <h1 className="font-display text-3xl text-slate-900">Contact Us</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">Speak to our bureau team for rates, business treasury support, and operational guidance.</p>
        <div className="mt-8 grid gap-4 text-sm text-slate-700">
          <div>
            <p className="font-semibold text-slate-900">Office</p>
            <p>P.O. Box 10581, Arusha</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Phone</p>
            <p><a href="tel:+255768024017" className="text-skybrand-700 hover:underline">+255 768 024 017</a></p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Email</p>
            <p><a href="mailto:wingaforex@gmail.com" className="text-skybrand-700 hover:underline">wingaforex@gmail.com</a></p>
          </div>
        </div>
      </article>

      <form onSubmit={handleSubmit} className="glass-surface rounded-3xl p-8 shadow-[0_18px_56px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-slate-950">Send a message</h2>
          <p className="mt-2 text-sm text-slate-600">Complete the form and our team will follow up with live rate guidance.</p>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-900">
          Full name
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Full name"
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
            required
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-900">
          Email address
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="you@example.com"
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
            required
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-900">
          Message
          <textarea
            rows={6}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            placeholder="Tell us what you need help with"
            className="min-h-[150px] rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100 resize-none"
            required
          />
        </label>

        <div aria-live="polite" className="min-h-[2rem] mt-4 text-sm">
          {status.message && (
            <p className={`rounded-2xl px-4 py-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {status.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-skybrand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-skybrand-500/10 transition hover:bg-skybrand-700"
        >
          Send Inquiry
        </button>
      </form>
    </section>
  )
}

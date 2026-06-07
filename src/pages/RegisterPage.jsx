import { useState } from 'react'
import { Link } from 'react-router-dom'
import WingaForexLogo from '../components/WingaForexLogo'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return setStatus({ type: 'error', message: 'Please complete all fields to register.' })
    }
    if (!emailValid) {
      return setStatus({ type: 'error', message: 'Please enter a valid email address.' })
    }
    if (form.password.length < 8) {
      return setStatus({ type: 'error', message: 'Password must be at least 8 characters long.' })
    }
    if (form.password !== form.confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords do not match. Please retry.' })
    }

    setStatus({ type: 'success', message: 'Registration request submitted successfully. Our team will contact you within one business day.' })
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <section className="mx-auto grid w-[min(960px,95vw)] overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-glass backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative grid content-between gap-6 bg-gradient-to-br from-skybrand-700 to-skybrand-500 p-6 text-white md:p-8">
        <div>
          <WingaForexLogo variant="header" />
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/80">Create your account</p>
          <h1 className="mt-2 font-display text-3xl leading-tight">Register with Winga Forex Bureau</h1>
          <p className="mt-3 max-w-md text-sm text-white/85">Submit your registration details and our team will verify your account for secure forex access.</p>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/10 p-3 text-xs">
          <p className="font-semibold">Secure, audited onboarding.</p>
          <p className="mt-1">Registration requests are reviewed and verified before access is granted.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 p-6 md:p-8">
        <div>
          <h2 className="font-display text-2xl text-skybrand-950">Create account</h2>
          <p className="mt-1 text-sm text-skybrand-800/75">Register for secure rate access and forex transaction support.</p>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-skybrand-900/80">
          Full name
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Full name"
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-skybrand-900/80">
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

        <label className="grid gap-2 text-sm font-semibold text-skybrand-900/80">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Create a password"
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-skybrand-900/80">
          Confirm password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            placeholder="Confirm password"
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
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

        <button type="submit" className="rounded-2xl bg-skybrand-600 px-4 py-3 text-sm font-semibold text-white shadow-glass transition hover:bg-skybrand-700">
          Submit registration request
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-skybrand-700 hover:text-skybrand-900">
            Sign in instead
          </Link>
        </p>
      </form>
    </section>
  )
}

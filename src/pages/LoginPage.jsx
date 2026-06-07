import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { http } from '../lib/http'
import { useAuthStore } from '../store/useAuthStore'
import WingaForexLogo from '../components/WingaForexLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState({ email: 'admin@wingaforex.co.tz', password: 'Admin@12345' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await http.post('/auth/login', form)
      setAuth(response.data)
      navigate(response.data?.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto grid w-[min(860px,95vw)] overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-glass backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative grid content-between gap-6 bg-gradient-to-br from-skybrand-700 to-skybrand-500 p-6 text-white md:p-8">
        <div>
          <WingaForexLogo variant="header" />
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/80">Secure Access</p>
          <h1 className="mt-2 font-display text-3xl leading-tight">Winga Operations Portal</h1>
          <p className="mt-3 text-sm text-white/85">Modern forex command center with role-based security, audit trails, and real-time analytics.</p>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/10 p-3 text-xs">
          <p className="font-semibold">Demo admin: admin@wingaforex.co.tz / Admin@12345</p>
          <p className="mt-1 font-semibold">Demo user: client@wingaforex.co.tz / Client@12345</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 p-6 md:p-8">
        <div>
          <h2 className="font-display text-2xl text-skybrand-950">Sign In</h2>
          <p className="mt-1 text-sm text-skybrand-800/75">Use your secure credentials to continue.</p>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-skybrand-900/80">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
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
            className="rounded-2xl border border-skybrand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-skybrand-500 focus:ring-2 focus:ring-skybrand-100"
            required
          />
        </label>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-skybrand-500 px-4 py-3 text-sm font-semibold text-white shadow-glass transition hover:-translate-y-0.5 hover:bg-skybrand-600 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-skybrand-700 hover:text-skybrand-900">
            Register here
          </Link>
        </p>
      </form>
    </section>
  )
}

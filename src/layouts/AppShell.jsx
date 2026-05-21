import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import WingaForexLogo from '../components/WingaForexLogo'
import LiveTicker from '../components/LiveTicker'
import Footer from '../components/Footer'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import { useAuthStore } from '../store/useAuthStore'
import { useBranches } from '../hooks/useBranches'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/live-rates', label: 'Rates' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function AppShell() {
  useBranches()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skybrand-50/40 via-white to-orange-50/20 text-navysoft overflow-x-hidden">
      {/* Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-glass-lg border-b border-skybrand-100' : 'bg-white/80 backdrop-blur-xl'}`}>
        <div className="mx-auto flex w-[min(1440px,96vw)] items-center justify-between px-4 py-3 md:py-4">
          <WingaForexLogo size="sm" />
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive ? 'bg-skybrand-600 text-white shadow-sm' : 'text-slate-700 hover:text-skybrand-700 hover:bg-skybrand-50'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 rounded-xl border border-skybrand-200 bg-white px-3.5 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-50 transition">
                  <FiUser size={14} /> {user.name || 'Dashboard'}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition">
                  <FiLogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-xl bg-white border border-skybrand-200 px-4 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-50 transition">
                Login
              </Link>
            )}
            <Link to="/live-rates" className="rounded-xl bg-skybrand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-skybrand-700 transition-all duration-200">
              View Rates
            </Link>
          </div>
          <button className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-skybrand-200 bg-white text-skybrand-700 hover:bg-skybrand-50 transition"
            onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }} className="overflow-hidden border-t border-skybrand-100 bg-white/95 backdrop-blur-xl lg:hidden">
              <nav className="mx-auto w-[min(1440px,96vw)] px-4 py-4 grid grid-cols-2 gap-2">
                {navLinks.map(({ to, label, end }) => (
                  <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-skybrand-600 text-white' : 'bg-skybrand-50 text-slate-700 hover:bg-skybrand-100'}`}>
                    {label}
                  </NavLink>
                ))}
                <Link to="/live-rates" onClick={() => setMenuOpen(false)}
                  className="col-span-2 flex items-center justify-center rounded-xl bg-skybrand-600 px-4 py-3 text-sm font-bold text-white hover:bg-skybrand-700 transition">
                  View Live Rates
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Live ticker bar */}
      <div className="w-full bg-skybrand-950/95 border-b border-skybrand-800">
        <div className="mx-auto w-[min(1440px,96vw)]"><LiveTicker /></div>
      </div>

      {/* Page content - no max-width constraint here, pages handle their own layout */}
      <main className="w-full"><Outlet /></main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </div>
  )
}

import { useState, useEffect, lazy, Suspense } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { FiUser, FiLogOut } from 'react-icons/fi'
import WingaForexLogo from '../components/WingaForexLogo'
import LiveTicker from '../components/LiveTicker'
import { useAuthStore } from '../store/useAuthStore'

const Footer = lazy(() => import('../components/Footer'))
const FloatingWhatsApp = lazy(() => import('../components/FloatingWhatsApp'))
const MobileBottomNav = lazy(() => import('../components/MobileBottomNav'))
const DeferredBranches = lazy(() => import('../components/DeferredBranches'))

const DeferredFooter = () => (
  <Suspense fallback={null}>
    <Footer />
  </Suspense>
)

const DeferredFloatingWhatsApp = () => (
  <Suspense fallback={null}>
    <FloatingWhatsApp />
  </Suspense>
)

const DeferredMobileBottomNav = () => (
  <Suspense fallback={null}>
    <MobileBottomNav />
  </Suspense>
)

const DeferredBranchesLoader = () => (
  <Suspense fallback={null}>
    <DeferredBranches />
  </Suspense>
)

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/market', label: 'Market' },
  { to: '/rates', label: 'Rates' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function AppShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/70 bg-white/82 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl' : 'bg-white/68 backdrop-blur-xl'}`}>
        <div className="mx-auto flex w-[min(1440px,96vw)] items-center justify-between gap-4 px-4 py-3 md:py-3.5 lg:gap-6">
          <WingaForexLogo variant="header" />
          <nav className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/70 bg-white/58 px-2 py-1 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive ? 'bg-skybrand-600 text-white shadow-sm' : 'text-slate-700 hover:text-skybrand-700 hover:bg-skybrand-50/80'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2.5">
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
              <>
                <Link to="/register" className="rounded-xl border border-skybrand-200 bg-white px-4 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-50 transition">
                  Register
                </Link>
                <Link to="/login" className="rounded-xl bg-white border border-skybrand-200 px-4 py-2 text-sm font-semibold text-skybrand-700 hover:bg-skybrand-50 transition">
                  Login
                </Link>
              </>
            )}
            <Link to="/rates" className="rounded-full bg-skybrand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-skybrand-700 transition-all duration-200">
              View Rates
            </Link>
          </div>
        </div>
      </header>

      {/* Live ticker bar */}
      <div className="w-full bg-skybrand-950/95 border-b border-skybrand-800">
        <div className="mx-auto w-[min(1440px,96vw)]"><LiveTicker /></div>
      </div>

      {/* Page content - no max-width constraint here, pages handle their own layout */}
      <main className="w-full pb-24 lg:pb-0"><Outlet /></main>

      {/* Footer */}
      <DeferredFooter />

      {/* Floating WhatsApp */}
      <DeferredFloatingWhatsApp />

      {/* Mobile bottom navigation */}
      <DeferredMobileBottomNav />

      {/* Branches loader (deferred) */}
      <DeferredBranchesLoader />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiMenuAlt2, HiOutlineX } from 'react-icons/hi'
import { FiActivity, FiFileText, FiMapPin, FiShield, FiUsers } from 'react-icons/fi'

const items = [
  { to: '/admin/overview', label: 'Overview', icon: FiActivity },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/kyc', label: 'KYC Queue', icon: FiShield },
  { to: '/admin/branches', label: 'Branches', icon: FiMapPin },
  { to: '/admin/rates', label: 'Rate Control', icon: FiActivity },
  { to: '/admin/audit', label: 'Audit Logs', icon: FiFileText },
]

export default function AdminLayoutPage() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('winga_admin_dark') === 'true'
    const savedCollapsed = localStorage.getItem('winga_admin_collapsed') === 'true'
    setIsDark(saved)
    setIsDesktopCollapsed(savedCollapsed)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('winga_admin_dark', `${next}`)
  }

  const toggleDesktopSidebar = () => {
    const next = !isDesktopCollapsed
    setIsDesktopCollapsed(next)
    localStorage.setItem('winga_admin_collapsed', `${next}`)
  }

  const currentSection =
    items.find((item) => location.pathname.startsWith(item.to))?.label || 'Overview'

  const navLinkClass = ({ isActive }) =>
    `flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isDesktopCollapsed ? 'justify-center' : 'gap-3'} ${isActive ? 'bg-skybrand-500 text-white shadow-md shadow-skybrand-500/30' : isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-700 hover:bg-skybrand-100/80'}`

  const SidebarNav = ({ collapsed = false }) => (
    <>
      {!collapsed && (
        <div className={`rounded-2xl p-4 ${isDark ? 'border border-slate-700 bg-slate-900/80' : 'bg-gradient-to-br from-skybrand-50 to-white'}`}>
          <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-slate-300' : 'text-skybrand-700'}`}>
            Admin Dashboard
          </p>
          <h2 className={`mt-2 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Control Center
          </h2>
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage users, KYC approvals, rates, branches, and audit activity.
          </p>
        </div>
      )}

      <button
        onClick={toggleTheme}
        className={`mt-4 w-full rounded-xl px-3 py-2 text-xs font-semibold transition ${collapsed ? 'text-center' : ''} ${isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-skybrand-100 text-skybrand-800 hover:bg-skybrand-200'}`}
      >
        {collapsed ? 'Theme' : isDark ? 'Switch Light Mode' : 'Switch Dark Mode'}
      </button>

      <nav className="mt-4 grid gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setIsSidebarOpen(false)} title={collapsed ? item.label : ''}>
              <Icon className="text-base" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </>
  )

  return (
    <div className={`relative min-h-[70vh] ${isDark ? 'text-slate-100' : ''}`}>
      <div className="mb-4 flex items-center justify-between xl:hidden">
        <div>
          <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-skybrand-700'}`}>
            Admin Dashboard
          </p>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Control Center</h2>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${isDark ? 'border border-slate-700 bg-slate-900 text-slate-100' : 'glass-surface text-skybrand-700'}`}
          aria-label="Open admin sidebar"
        >
          <HiMenuAlt2 className="text-xl" />
        </button>
      </div>

      <div className={`grid gap-6 ${isDesktopCollapsed ? 'xl:grid-cols-[92px_1fr]' : 'xl:grid-cols-[280px_1fr]'}`}>
        <aside className={`hidden xl:block xl:sticky xl:top-24 xl:h-fit xl:rounded-2xl xl:p-4 ${isDark ? 'border border-slate-700 bg-slate-950/85 shadow-xl shadow-black/20' : 'glass-surface'}`}>
          <div className="mb-2 flex justify-end">
            <button
              onClick={toggleDesktopSidebar}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isDesktopCollapsed ? <HiChevronDoubleRight /> : <HiChevronDoubleLeft />}
            </button>
          </div>
          <SidebarNav collapsed={isDesktopCollapsed} />
        </aside>

        <section className={`grid gap-4 rounded-3xl p-3 backdrop-blur-sm md:p-4 ${isDark ? 'border border-slate-700 bg-slate-900/75' : 'border border-white/60 bg-white/45'}`}>
          <header className={`rounded-2xl px-4 py-3 ${isDark ? 'border border-slate-700 bg-slate-900/90' : 'border border-skybrand-100 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.14em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Admin / {currentSection}
            </p>
            <h1 className={`mt-1 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentSection}</h1>
          </header>
          <Outlet />
        </section>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Close admin sidebar overlay"
          />
          <aside className={`relative h-full w-[86%] max-w-[320px] p-4 ${isDark ? 'border-r border-slate-700 bg-slate-950 text-slate-100' : 'border-r border-slate-200 bg-white text-slate-900'}`}>
            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
                aria-label="Close admin sidebar"
              >
                <HiOutlineX className="text-lg" />
              </button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}
    </div>
  )
}

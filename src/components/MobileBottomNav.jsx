import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiHome,
  FiRepeat,
  FiSettings,
} from 'react-icons/fi'
import { useAuthStore } from '../store/useAuthStore'

function DockItem({ to, label, Icon, end = false }) {
  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.92 }}
          className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-semibold transition ${
            isActive ? 'text-skybrand-700' : 'text-slate-600'
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="dock-pill"
              className="absolute inset-0 rounded-2xl bg-skybrand-50"
              transition={{ type: 'spring', stiffness: 310, damping: 28 }}
            />
          )}
          <Icon className="relative" size={16} />
          <span className="relative mt-1 truncate">{label}</span>
        </motion.div>
      )}
    </NavLink>
  )
}

export default function MobileBottomNav() {
  const user = useAuthStore((s) => s.user)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (y < 40 || delta < -6) setVisible(true)
      if (delta > 8) setVisible(false)
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const leftItems = useMemo(
    () => [
      { to: '/calculator', label: 'Calc', Icon: FiRepeat },
      { to: '/market', label: 'Market', Icon: FiBarChart2 },
    ],
    [],
  )

  const rightItems = useMemo(() => {
    const items = [
      { to: '/rates', label: 'Rates', Icon: FiActivity },
      { to: '/services', label: 'Services', Icon: FiBriefcase },
      { to: '/faqs', label: 'Alerts', Icon: FiBell },
    ]

    if (user) {
      items.push({
        to: user.role === 'admin' ? '/admin' : '/dashboard',
        label: user.role === 'admin' ? 'Admin' : 'Settings',
        Icon: FiSettings,
      })
    }

    return items.slice(0, 2)
  }, [user])

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, y: 110 }}
        animate={{ opacity: visible ? 1 : 0.9, y: visible ? 0 : 54 }}
        exit={{ opacity: 0, y: 110 }}
        transition={{ duration: 0.26 }}
        className="fixed inset-x-0 bottom-2 z-[60] lg:hidden"
        aria-label="Primary mobile navigation"
      >
        <div className="pointer-events-auto mx-auto w-[min(640px,94vw)]">
          <div className="mb-2 flex items-center justify-center rounded-full bg-white/90 px-3 py-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <img src="/assets/winga-logo.jpg" alt="Winga Forex Bureau Official Logo" className="h-7 w-auto object-contain" loading="lazy" />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div className="rounded-[24px] border border-skybrand-100/90 bg-white/72 p-1 shadow-[0_10px_30px_rgba(3,105,161,0.18)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1">
              {leftItems.map((item) => (
                <DockItem key={item.to} {...item} />
              ))}
            </div>
          </div>

          <NavLink to="/" end className="block">
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`relative mb-3 flex h-[3.8rem] w-[3.8rem] items-center justify-center rounded-full border border-skybrand-100/90 bg-gradient-to-br from-skybrand-500 to-skybrand-700 text-white shadow-[0_0_0_8px_rgba(224,242,254,0.6),0_14px_34px_rgba(2,132,199,0.36)] ${
                  isActive ? 'ring-4 ring-cyan-200/70' : ''
                }`}
                aria-label="Home"
              >
                <FiHome size={22} />
              </motion.div>
            )}
          </NavLink>

          <div className="rounded-[24px] border border-skybrand-100/90 bg-white/72 p-1 shadow-[0_10px_30px_rgba(3,105,161,0.18)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1">
              {rightItems.map((item) => (
                <DockItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
      </motion.nav>
    </AnimatePresence>
  )
}

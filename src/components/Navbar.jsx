import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import WingaForexLogo from './WingaForexLogo'

const links = [
	{ to: '/', label: 'Home', end: true },
	{ to: '/market', label: 'Market' },
	{ to: '/rates', label: 'Rates' },
	{ to: '/services', label: 'Services' },
	{ to: '/about', label: 'About' },
	{ to: '/contact', label: 'Contact' },
]

export default function Navbar() {
	const [open, setOpen] = useState(false)
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/70 bg-white/82 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl' : 'bg-white/68 backdrop-blur-xl'}`}>
			<div className="mx-auto flex w-[min(1440px,96vw)] items-center justify-between px-4 py-3 md:py-3.5">
				<WingaForexLogo variant="header" />

				<nav className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/70 bg-white/58 px-2 py-1 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
					{links.map(({ to, label, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className={({ isActive }) =>
								`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
									isActive
										? 'bg-skybrand-600 text-white shadow-sm'
										: 'text-slate-700 hover:text-skybrand-700 hover:bg-skybrand-50/80'
								}`
							}
						>
							{label}
						</NavLink>
					))}
					<Link to="/rates" className="ml-1 rounded-full bg-skybrand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-skybrand-700 transition-all duration-200">
						View Rates
					</Link>
				</nav>

				<button
					className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-skybrand-200 bg-white text-skybrand-700 hover:bg-skybrand-50 transition"
					onClick={() => setOpen((v) => !v)}
					aria-label="Toggle menu"
				>
					{open ? <FiX size={20} /> : <FiMenu size={20} />}
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden border-t border-skybrand-100 bg-white/95 backdrop-blur-xl lg:hidden"
					>
						<nav className="mx-auto w-[min(1440px,96vw)] px-4 py-4 grid grid-cols-2 gap-2">
							{links.map(({ to, label, end }) => (
								<NavLink
									key={to}
									to={to}
									end={end}
									onClick={() => setOpen(false)}
									className={({ isActive }) =>
										`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
											isActive
												? 'bg-skybrand-600 text-white'
												: 'bg-skybrand-50 text-slate-700 hover:bg-skybrand-100'
										}`
									}
								>
									{label}
								</NavLink>
							))}
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	)
}

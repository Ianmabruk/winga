import { Link } from 'react-router-dom'
import { FaInstagram, FaLinkedin, FaXTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa6'
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import WingaForexLogo from './WingaForexLogo'

const quickLinks = [
  { to: '/live-rates', label: 'Live Rates' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
]

const services = [
  'Currency Exchange',
  'International Transfers',
  'Travel Money',
  'Business Forex',
  'Corporate Transactions',
  'Online Rate Monitoring',
]

export default function Footer() {
  return (
    <footer className="bg-skybrand-950 text-slate-300">
      {/* Top band */}
      <div className="border-b border-skybrand-800/60">
        <div className="mx-auto w-[min(1440px,96vw)] px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <WingaForexLogo size="sm" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mt-4">
              Tanzania's most trusted foreign exchange bureau. Real-time rates,
              Bank of Tanzania licensed, serving Arusha since day one.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: FaFacebook, label: 'Facebook', href: '#' },
                { icon: FaInstagram, label: 'Instagram', href: '#' },
                { icon: FaXTwitter, label: 'Twitter/X', href: '#' },
                { icon: FaLinkedin, label: 'LinkedIn', href: '#' },
                { icon: FaWhatsapp, label: 'WhatsApp', href: 'https://wa.me/255000000000' },
              ].map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-skybrand-800 flex items-center justify-center text-slate-300 hover:bg-skybrand-600 hover:text-white transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-4">Quick Links</p>
            <ul className="grid gap-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-white hover:pl-1 transition-all duration-150">
                    › {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-4">Our Services</p>
            <ul className="grid gap-2">
              {services.map((s) => (
                <li key={s} className="text-sm text-slate-400">› {s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-4">Contact Us</p>
            <ul className="grid gap-3">
              <li className="flex items-start gap-2.5">
                <FiMapPin size={14} className="mt-0.5 shrink-0 text-skybrand-400" />
                <span className="text-sm text-slate-400">Sokoine Road, Arusha, Tanzania – Near NBC Bank</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiPhone size={14} className="shrink-0 text-skybrand-400" />
                <a href="tel:+255000000000" className="text-sm text-slate-400 hover:text-white transition">+255 000 000 000</a>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail size={14} className="shrink-0 text-skybrand-400" />
                <a href="mailto:info@wingaforex.co.tz" className="text-sm text-slate-400 hover:text-white transition">info@wingaforex.co.tz</a>
              </li>
              <li className="flex items-start gap-2.5">
                <FiClock size={14} className="mt-0.5 shrink-0 text-skybrand-400" />
                <span className="text-sm text-slate-400">Mon–Fri: 8am–6pm<br />Sat: 9am–3pm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto w-[min(1440px,96vw)] px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Winga Forex Bureau. All rights reserved.</p>
        <p>Licensed by the Bank of Tanzania · Sokoine Road, Arusha</p>
      </div>
    </footer>
  )
}

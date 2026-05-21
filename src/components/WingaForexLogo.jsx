import { Link } from 'react-router-dom'

export default function WingaForexLogo({ size = 'md' }) {
  const imgSize = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-20 w-20' : 'h-14 w-14'
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]'
  const locSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]'

  return (
    <Link to="/" className="flex items-center gap-3 select-none">
      {/* Logo image container */}
      <div
        className={`relative ${imgSize} flex-shrink-0 rounded-2xl overflow-hidden shadow-glass
                    border border-skybrand-200 bg-white`}
      >
        <img
          src="/images/winga-logo.png"
          alt="Winga Forex Bureau Logo"
          className="w-full h-full object-contain p-1.5 transition-transform duration-300 hover:scale-110"
          loading="eager"
        />
        {/* Live indicator dot */}
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-market-up animate-pulseRate ring-1 ring-white" />
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <h1 className={`${titleSize} font-extrabold tracking-wide text-skybrand-950 uppercase font-display`}>
          Winga Forex Bureau
        </h1>
        <p className={`${subSize} font-semibold text-accent-500 uppercase tracking-widest`}>
          Best Rates • Best Services
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 text-skybrand-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className={`${locSize} text-slate-500 font-medium`}>
            Sokoine Road, Arusha, Tanzania
          </p>
        </div>
      </div>
    </Link>
  )
}

import { Link } from 'react-router-dom'

export default function WingaForexLogo({ variant = 'default' }) {
  const isHeader = variant === 'header'
  const isFooter = variant === 'footer'

  const baseClasses = "flex items-center justify-center overflow-hidden border border-sky-100/90 bg-white"

  return (
    <Link to="/" className={`flex items-center ${isHeader ? 'gap-2.5 md:gap-3.5' : 'gap-3'}`} aria-label="Winga Forex Bureau Home">
      <div className={`${baseClasses} ${isHeader ? 'h-12 w-12 rounded-full p-1 shadow-[0_10px_28px_rgba(15,23,42,0.08)] md:h-12 md:w-12' : 'h-14 w-14 rounded-full p-1.5 shadow-xl md:h-20 md:w-20'}`}>
        <img
          src="/assets/winga-logo.jpg"
          alt="Winga Forex Bureau Official Logo"
          loading="eager"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        {isHeader ? (
          <>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-[0.95rem] font-bold tracking-[0.18em] text-wingaOrange md:text-[1.02rem]">
                WINGA
              </span>
              <span className="mt-1 truncate text-[0.74rem] font-semibold tracking-[0.12em] text-wingaBlue md:text-[0.8rem]">
                FOREX BUREAU
              </span>
            </div>
            <div className="mt-2 hidden items-center gap-2 text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-wingaBlue xl:flex">
              <span>BEST RATES BEST SERVICES</span>
            </div>
            <div className="mt-1 text-[0.68rem] font-semibold tracking-[0.08em] text-wingaBlue md:hidden">
              BEST RATES BEST SERVICES
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className={`truncate font-bold tracking-[0.14em] text-white ${isFooter ? 'text-sm md:text-base' : 'text-lg md:text-xl text-wingaOrange'}`}>
                WINGA
              </span>
              <span className={`truncate text-sm font-semibold tracking-[0.08em] ${isFooter ? 'text-slate-400' : 'text-wingaBlue md:text-base'}`}>
                FOREX BUREAU
              </span>
            </div>
            <p className={`mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${isFooter ? 'text-slate-500' : 'text-wingaBlue'}`}>
              BEST RATES BEST SERVICES
            </p>
          </>
        )}
      </div>
    </Link>
  )
}

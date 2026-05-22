export default function WingaForexLogo({ variant = 'default' }) {
  const isHeader = variant === 'header'
  const isFooter = variant === 'footer'

  return (
    <div className={`flex items-center ${isHeader ? 'gap-2.5 md:gap-3.5' : 'gap-3'}`}>
      <div className={`flex items-center justify-center overflow-hidden border border-sky-100/90 bg-white ${isHeader ? 'h-11 w-11 rounded-2xl p-1.5 shadow-[0_10px_28px_rgba(15,23,42,0.08)] md:h-12 md:w-12' : 'h-14 w-14 rounded-2xl p-2 shadow-xl md:h-20 md:w-20'}`}>
        <img
          src="/winga-logo.png"
          alt="Winga Forex Bureau Logo"
          className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        {isHeader ? (
          <>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-[0.95rem] font-semibold tracking-[0.18em] text-slate-950 md:text-[1.02rem]">
                Winga
              </span>
              <span className="mt-1 truncate text-[0.74rem] font-medium tracking-[0.12em] text-slate-500 md:text-[0.8rem]">
                Forex Bureau
              </span>
            </div>
            <div className="mt-2 hidden items-center gap-2 text-[0.63rem] font-medium uppercase tracking-[0.18em] text-slate-400 xl:flex">
              <span>Business Services</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Arusha, Tanzania</span>
            </div>
            <div className="mt-1 text-[0.68rem] font-medium tracking-[0.08em] text-slate-500 md:hidden">
              Winga Forex
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className={`truncate font-semibold tracking-[0.14em] text-white ${isFooter ? 'text-sm md:text-base' : 'text-lg md:text-xl text-sky-900'}`}>
                Winga
              </span>
              <span className={`truncate text-sm font-medium tracking-[0.08em] ${isFooter ? 'text-slate-400' : 'text-slate-500 md:text-base'}`}>
                Forex Bureau
              </span>
            </div>
            <p className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${isFooter ? 'text-slate-500' : 'text-sky-700'}`}>
              Business Services
            </p>
          </>
        )}
      </div>
    </div>
  )
}

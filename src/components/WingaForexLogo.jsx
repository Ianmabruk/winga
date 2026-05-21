import React from 'react'

export default function WingaForexLogo() {
  return (
    <div className="flex items-center gap-3">

      {/* Logo */}
      <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-white shadow-xl border border-sky-100 p-2 flex items-center justify-center">

        <img
          src="/winga-logo.png"
          alt="Winga Forex Bureau Logo"
          className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
        />

      </div>

      {/* Company Details */}
      <div className="flex flex-col">

        <h1 className="text-lg md:text-2xl font-extrabold uppercase tracking-wide text-sky-900 leading-tight">
          Winga Forex Bureau
        </h1>

        <p className="text-orange-500 text-[10px] md:text-sm font-semibold uppercase tracking-widest">
          BEST RATES BEST SERVICES
        </p>

        <p className="text-gray-500 text-[10px] md:text-xs mt-1">
          Sokoine Road, Arusha, Tanzania – Near NBC Bank
        </p>

      </div>

    </div>
  )
}

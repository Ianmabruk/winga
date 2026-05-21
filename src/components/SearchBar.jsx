import { useRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useForexStore } from '../store/useForexStore'

export default function SearchBar({ placeholder = 'Search currency…', className = '' }) {
  const { searchQuery, setSearchQuery } = useForexStore()
  const inputRef = useRef(null)

  return (
    <div className={`relative flex items-center ${className}`}>
      <FiSearch className="absolute left-3 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search currencies"
        className="w-full rounded-xl border border-skybrand-200 bg-white/90 py-2.5 pl-9 pr-8 text-sm text-slate-800 outline-none transition focus:border-skybrand-400 focus:ring-2 focus:ring-skybrand-200"
      />
      {searchQuery && (
        <button
          onClick={() => {
            setSearchQuery('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute right-2.5 rounded-full p-0.5 text-slate-400 hover:text-slate-700 transition"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  )
}

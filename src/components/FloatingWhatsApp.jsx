import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { FiX } from 'react-icons/fi'

const WHATSAPP_NUMBER = '255000000000'
const DEFAULT_MSG = 'Hello Winga Forex Bureau! I would like to inquire about your exchange rates.'

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(DEFAULT_MSG)

  const handleSend = () => {
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-[6.75rem] right-4 z-[50] flex flex-col items-end gap-3 md:bottom-6 md:right-5 lg:z-[55]">
      {/* Popup card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            id="whatsapp-panel"
            className="w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-skybrand-100 bg-white shadow-glass-lg"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FaWhatsapp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Winga Forex Bureau</p>
                  <p className="text-white/80 text-xs">Typically replies instantly</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70">
                <FiX size={18} />
              </button>
            </div>

            {/* Chat bubble */}
            <div className="p-3 bg-[#ece5dd]">
              <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm text-sm text-slate-700 leading-relaxed">
                Hi there! 👋 Welcome to <strong>Winga Forex Bureau</strong>. How can we help you today?
              </div>
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={2}
                aria-label="WhatsApp message"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#25D366] transition"
                placeholder="Type your message…"
              />
              <button
                onClick={handleSend}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white hover:bg-[#22c55e] transition-all"
              >
                <FaWhatsapp size={16} />
                Chat on WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: open ? '0 0 0 0 rgba(37,211,102,0)' : ['0 0 0 0 rgba(37,211,102,0.4)', '0 0 0 14px rgba(37,211,102,0)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/25"
        aria-label="Chat on WhatsApp"
        aria-expanded={open}
        aria-controls="whatsapp-panel"
      >
        {open ? <FiX size={22} /> : <FaWhatsapp size={26} />}
      </motion.button>
    </div>
  )
}

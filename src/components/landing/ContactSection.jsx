import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheck } from 'react-icons/fi'

export default function ContactSection() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, send to backend or email service
    setSent(true)
    setTimeout(() => setSent(false), 5000)
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section id="contact" className="py-16 md:py-20 bg-skybrand-50/40">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Get In Touch</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">Contact Us</h2>
          <p className="text-slate-500 mt-2 text-sm">We are here to assist you Monday to Saturday</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Left: info + map */}
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: FiMapPin, label: 'Office Address', val: 'Sokoine Road, Arusha, Tanzania – Near NBC Bank' },
                { icon: FiPhone, label: 'Phone', val: '+255 000 000 000', href: 'tel:+255000000000' },
                { icon: FiMail, label: 'Email', val: 'info@wingaforex.co.tz', href: 'mailto:info@wingaforex.co.tz' },
                { icon: FiClock, label: 'Working Hours', val: 'Mon–Fri: 8am–6pm\nSat: 9am–3pm' },
              ].map(({ icon: Icon, label, val, href }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-xl bg-skybrand-50 flex items-center justify-center">
                      <Icon size={15} className="text-skybrand-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</p>
                  </div>
                  {href
                    ? <a href={href} className="text-sm text-skybrand-700 font-medium hover:text-skybrand-900 transition">{val}</a>
                    : <p className="text-sm text-slate-600 whitespace-pre-line">{val}</p>}
                </motion.div>
              ))}
            </div>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card">
              <iframe
                title="Winga Forex Bureau Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.825!2d36.6853!3d-3.3869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18371204!2sSokoine%20Road%2C%20Arusha!5e0!3m2!1sen!2stz!4v1"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: contact form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 md:p-8">
            <h3 className="text-xl font-bold text-skybrand-950 mb-6">Send Us a Message</h3>

            {sent && (
              <div className="flex items-center gap-2 rounded-xl bg-market-up/10 border border-market-up/20 px-4 py-3 text-sm font-semibold text-market-up mb-5">
                <FiCheck size={16} /> Message sent! We will contact you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-skybrand-400 focus:bg-white transition"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-skybrand-400 focus:bg-white transition"
                    placeholder="+255 000 000 000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-skybrand-400 focus:bg-white transition"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-skybrand-400 focus:bg-white transition"
                  placeholder="How can we help you?" />
              </div>
              <button type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-skybrand-600 py-3.5 text-sm font-bold text-white hover:bg-skybrand-700 hover:shadow-glow-sky transition-all duration-200">
                <FiSend size={15} /> Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

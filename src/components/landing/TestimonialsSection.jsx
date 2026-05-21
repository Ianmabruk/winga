import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'

const testimonials = [
  {
    name: 'Amina Hassan',
    role: 'Travel Agent, Arusha',
    text: 'Winga Forex Bureau has been our go-to for travel currency for 3 years. The rates are unbeatable and the staff is incredibly professional.',
    rating: 5,
  },
  {
    name: 'James Mwangi',
    role: 'Business Owner, Dar es Salaam',
    text: 'For our corporate forex needs, Winga always delivers. Fast transactions, honest rates, and excellent customer care every time.',
    rating: 5,
  },
  {
    name: 'Sarah Omondi',
    role: 'Student, Nairobi',
    text: 'I exchange money here every time I visit Arusha. The process is super quick and the rates are much better than elsewhere.',
    rating: 5,
  },
  {
    name: 'Mohammed Ali',
    role: 'Tour Operator',
    text: 'Reliable, fast, and professional. Winga Forex Bureau is the best exchange bureau in Northern Tanzania without doubt.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-skybrand-50/60 via-white to-orange-50/20">
      <div className="mx-auto w-[min(1440px,96vw)] px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500 mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-skybrand-950">What Our Customers Say</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map(({ name, role, text, rating }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-glass transition-all duration-300">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, j) => (
                  <FiStar key={j} size={13} className="fill-accent-400 text-accent-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{text}"</p>
              <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3">
                <div className="h-9 w-9 rounded-full bg-skybrand-100 flex items-center justify-center text-sm font-bold text-skybrand-700">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'

const faqs = [
  {
    q: 'How often are rates refreshed?',
    a: 'Rates are auto-refreshed from provider-integrated services and updated in real time over socket streams.',
    tag: 'Rates',
  },
  {
    q: 'Can I lock a rate before payment?',
    a: 'Yes, our operations team can provide a temporary lock window for approved transactions.',
    tag: 'Transactions',
  },
  {
    q: 'Do you support corporate forex cards?',
    a: 'Yes, we support virtual and corporate card workflows with spending controls and monitoring.',
    tag: 'Cards',
  },
]

export default function FaqPage() {
  const [activeTag, setActiveTag] = useState('All')
  const [openQuestion, setOpenQuestion] = useState(faqs[0].q)

  const tags = ['All', ...new Set(faqs.map((item) => item.tag))]
  const filteredFaqs = activeTag === 'All' ? faqs : faqs.filter((item) => item.tag === activeTag)

  return (
    <section className="grid gap-5">
      <header className="glass-surface rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-skybrand-700">Support Hub</p>
        <h1 className="mt-2 font-display text-4xl text-slate-900">Frequently Asked Questions</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">Quick guidance on rates, transactions, and operational workflows.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeTag === tag ? 'bg-skybrand-600 text-white' : 'bg-skybrand-100 text-skybrand-800 hover:bg-skybrand-200'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredFaqs.map((item) => (
          <article key={item.q} className="glass-surface rounded-2xl p-4">
            <button
              onClick={() => setOpenQuestion(openQuestion === item.q ? '' : item.q)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-skybrand-700">{item.tag}</p>
                <h3 className="mt-1 font-display text-xl text-slate-900">{item.q}</h3>
              </div>
              <span className="rounded-full bg-skybrand-100 px-2 py-1 text-xs font-bold text-skybrand-700">
                {openQuestion === item.q ? '-' : '+'}
              </span>
            </button>
            {openQuestion === item.q ? <p className="mt-3 text-sm text-slate-700">{item.a}</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}

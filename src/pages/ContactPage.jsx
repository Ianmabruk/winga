export default function ContactPage() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <article className="glass-surface rounded-2xl p-5">
        <h1 className="font-display text-3xl text-slate-900">Contact Us</h1>
        <p className="mt-2 text-sm text-slate-700">Speak to our bureau team for rates, business treasury support, and operational guidance.</p>
        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <p>Nairobi CBD, Kenya</p>
          <p>+254 700 000 000</p>
          <p>support@wingaforex.com</p>
        </div>
      </article>
      <form className="glass-surface grid gap-3 rounded-2xl p-5">
        <input placeholder="Full name" className="rounded-xl border border-skybrand-200 bg-white px-3 py-3" />
        <input placeholder="Email" className="rounded-xl border border-skybrand-200 bg-white px-3 py-3" />
        <textarea placeholder="Message" rows={5} className="rounded-xl border border-skybrand-200 bg-white px-3 py-3" />
        <button className="rounded-xl bg-skybrand-500 px-4 py-3 text-sm font-semibold text-white">Send Inquiry</button>
      </form>
    </section>
  )
}

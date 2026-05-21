import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="grid place-items-center rounded-3xl border border-white/50 bg-white/75 p-10 shadow-glass">
      <div className="text-center">
        <h1 className="font-display text-4xl">Page Not Found</h1>
        <p className="mt-2 text-skybrand-900/75">The requested page does not exist.</p>
        <Link to="/" className="mt-5 inline-flex rounded-xl bg-skybrand-500 px-4 py-2 text-sm font-semibold text-white">
          Return Home
        </Link>
      </div>
    </div>
  )
}

/**
 * Reusable skeleton loading components.
 */

/** Generic shimmer block */
export const Shimmer = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-xl bg-gradient-to-r from-skybrand-50 via-slate-100 to-skybrand-50 bg-[length:200%_100%] ${className}`}
    style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite linear' }}
  />
)

/** Skeleton for a single currency card */
export const CurrencyCardSkeleton = () => (
  <article className="glass-surface rounded-2xl p-4">
    <div className="flex items-center gap-2">
      <Shimmer className="h-4 w-6 rounded" />
      <Shimmer className="h-4 w-20" />
    </div>
    <Shimmer className="mt-3 h-6 w-24" />
    <Shimmer className="mt-1 h-4 w-28" />
    <Shimmer className="mt-3 h-14 w-full" />
  </article>
)

/** Skeleton for the rates table */
export const RatesTableSkeleton = ({ rows = 8 }) => (
  <div className="glass-surface rounded-2xl overflow-hidden">
    <div className="p-4 border-b border-slate-100">
      <Shimmer className="h-5 w-32" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-100">
          {['Currency', 'Name', 'Buying', 'Selling', 'Spread', 'Updated'].map((h) => (
            <th key={h} className="px-4 py-3 text-left">
              <Shimmer className="h-3 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-slate-50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Shimmer className="h-4 w-6 rounded" />
                <Shimmer className="h-4 w-10" />
              </div>
            </td>
            <td className="px-4 py-3"><Shimmer className="h-4 w-28" /></td>
            <td className="px-4 py-3"><Shimmer className="h-4 w-20" /></td>
            <td className="px-4 py-3"><Shimmer className="h-4 w-20" /></td>
            <td className="px-4 py-3"><Shimmer className="h-4 w-14" /></td>
            <td className="px-4 py-3"><Shimmer className="h-4 w-24" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/** Skeleton for branch selector */
export const BranchSelectorSkeleton = () => (
  <div className="flex gap-2 flex-wrap">
    {Array.from({ length: 4 }).map((_, i) => (
      <Shimmer key={i} className="h-9 w-28 rounded-xl" />
    ))}
  </div>
)

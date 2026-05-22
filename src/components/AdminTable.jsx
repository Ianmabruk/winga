export default function AdminTable({ columns, rows, actions }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-skybrand-100 bg-white/80 p-6 text-center text-sm text-slate-500">
        No records found yet.
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-skybrand-100 bg-white/85 p-4 shadow-sm">
            <div className="grid gap-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-slate-500">{column.label}</span>
                  <span className="max-w-[60%] text-right font-medium text-slate-800">{row[column.key] ?? '-'}</span>
                </div>
              ))}
              {actions ? <div className="pt-2">{actions(row)}</div> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-skybrand-100 bg-white/80 md:block">
        <table className="w-full min-w-[740px] text-left text-sm">
          <thead>
            <tr className="border-b border-skybrand-100 bg-skybrand-50/80">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold text-skybrand-800">
                  {column.label}
                </th>
              ))}
              {actions ? <th className="px-4 py-3 text-skybrand-800">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-skybrand-100/70 last:border-none">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-skybrand-900/85">
                    {row[column.key] ?? '-'}
                  </td>
                ))}
                {actions ? <td className="px-4 py-3">{actions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

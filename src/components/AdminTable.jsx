export default function AdminTable({ columns, rows, actions }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-skybrand-100 bg-white/80">
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
  )
}

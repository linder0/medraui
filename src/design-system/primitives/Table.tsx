import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Generic, data-driven table.
 * Columns describe how to render each row — pages never write <tr> markup.
 */
export interface Column<Row> {
  key: string
  header: ReactNode
  /** Cell renderer. Defaults expect the row to be indexable by key. */
  render: (row: Row) => ReactNode
  align?: 'left' | 'right'
  /** Optional fixed width class, e.g. 'w-24'. */
  widthClassName?: string
}

export interface DataTableProps<Row> {
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  /** Rendered when rows is empty. */
  emptyState?: ReactNode
  className?: string
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  className,
}: DataTableProps<Row>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-3 py-2.5 text-2xs font-semibold tracking-wide text-tertiary uppercase',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.widthClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-edge/60 transition-colors last:border-0 hover:bg-panel"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-3 py-3 text-primary',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

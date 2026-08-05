import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Standard page region: a scrollable pane with a centered content column.
 * Every top-level page renders inside one of these so gutters, column
 * width, and scroll behavior stay consistent.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      <div className={cn('mx-auto max-w-5xl px-8 py-8', className)}>
        {children}
      </div>
    </div>
  )
}

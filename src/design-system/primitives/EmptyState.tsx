import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-edge-strong bg-panel px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-1 text-tertiary">{icon}</div>}
      <p className="text-md font-medium text-primary">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-secondary">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

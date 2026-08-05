import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CardVariant = 'raised' | 'outlined' | 'sunken'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantClasses: Record<CardVariant, string> = {
  raised: 'bg-raised border border-edge shadow-sm',
  outlined: 'bg-raised border border-edge',
  sunken: 'bg-panel border border-edge',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const

export function Card({
  variant = 'raised',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  )
}

/** Section header inside a card: title + optional description + actions slot. */
export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

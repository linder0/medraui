import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
type BadgeVariant = 'soft' | 'outline'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  variant?: BadgeVariant
  icon?: ReactNode
}

const softTones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-soft text-neutral',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-soft text-accent',
}

const outlineTones: Record<BadgeTone, string> = {
  neutral: 'border border-edge-strong text-secondary',
  success: 'border border-success/30 text-success',
  warning: 'border border-warning/30 text-warning',
  danger: 'border border-danger/30 text-danger',
  info: 'border border-info/30 text-info',
  accent: 'border border-accent/30 text-accent',
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold tracking-wide uppercase',
        variant === 'soft' ? softTones[tone] : outlineTones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}

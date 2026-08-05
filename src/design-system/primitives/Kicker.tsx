import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface KickerProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode
  tone?: 'default' | 'muted' | 'inverse'
}

const tones = {
  default: 'text-secondary',
  muted: 'text-tertiary',
  inverse: 'text-on-inverse-muted',
} as const

/** Tiny uppercase eyebrow label used above titles and nav sections. */
export function Kicker({
  icon,
  tone = 'muted',
  className,
  children,
  ...props
}: KickerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-2xs font-semibold tracking-[0.08em] uppercase',
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}

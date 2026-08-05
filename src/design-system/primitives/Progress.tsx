import { cn } from '@/lib/cn'

export interface ProgressProps {
  /** 0–100 */
  value: number
  tone?: 'default' | 'success' | 'accent'
  className?: string
}

const toneClasses = {
  default: 'bg-action',
  success: 'bg-success',
  accent: 'bg-accent',
} as const

export function Progress({ value, tone = 'default', className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-sunken', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width]', toneClasses[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

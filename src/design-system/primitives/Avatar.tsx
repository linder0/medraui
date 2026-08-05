import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type AvatarSize = 'sm' | 'md' | 'lg'
type AvatarTone = 'inverse' | 'accent' | 'neutral'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Text to derive initials from (first letters of first two words). */
  name: string
  size?: AvatarSize
  tone?: AvatarTone
  shape?: 'square' | 'circle'
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-6 text-2xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
}

const toneClasses: Record<AvatarTone, string> = {
  inverse: 'bg-inverse text-on-inverse',
  accent: 'bg-accent-soft text-accent',
  neutral: 'bg-neutral-soft text-neutral',
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')
}

export function Avatar({
  name,
  size = 'md',
  tone = 'inverse',
  shape = 'square',
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center font-semibold select-none',
        shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {initialsOf(name)}
    </div>
  )
}

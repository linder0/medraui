import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type IconButtonVariant = 'secondary' | 'ghost' | 'inverse-ghost'
type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — rendered as aria-label and title. */
  label: string
  icon: ReactNode
  variant?: IconButtonVariant
  size?: IconButtonSize
}

const variantClasses: Record<IconButtonVariant, string> = {
  secondary:
    'bg-raised text-secondary border border-edge-strong hover:bg-panel hover:text-primary shadow-xs',
  ghost: 'bg-transparent text-secondary hover:bg-sunken hover:text-primary',
  'inverse-ghost':
    'bg-transparent text-on-inverse-muted hover:bg-sidebar-raised hover:text-on-inverse',
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-7 rounded-sm',
  md: 'size-8.5 rounded-md',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, variant = 'ghost', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition duration-150 ease-smooth',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  ),
)
IconButton.displayName = 'IconButton'

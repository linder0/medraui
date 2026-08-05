import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon rendered before the label. Pass a sized lucide icon. */
  leadingIcon?: ReactNode
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-action text-on-action hover:bg-action-hover shadow-xs border border-transparent',
  secondary:
    'bg-raised text-primary border border-edge-strong hover:bg-panel shadow-xs',
  ghost: 'bg-transparent text-secondary hover:bg-sunken hover:text-primary',
  inverse:
    'bg-sidebar-raised text-on-inverse border border-edge-inverse hover:bg-sidebar',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-sm',
  md: 'h-8.5 px-3.5 text-sm gap-2 rounded-md',
  lg: 'h-10 px-4 text-md gap-2 rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      leadingIcon,
      trailingIcon,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap transition duration-150 ease-smooth',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  ),
)
Button.displayName = 'Button'

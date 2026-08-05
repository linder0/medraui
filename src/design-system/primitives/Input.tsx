import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered inside the field, before the text. */
  leadingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon, className, ...props }, ref) => (
    <div
      className={cn(
        'flex h-8.5 items-center gap-2 rounded-md border border-edge-strong bg-raised px-3 shadow-xs transition-colors',
        'focus-within:border-ring focus-within:outline-1 focus-within:outline-ring',
        className,
      )}
    >
      {leadingIcon && <span className="shrink-0 text-tertiary">{leadingIcon}</span>}
      <input
        ref={ref}
        className="w-full min-w-0 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary"
        {...props}
      />
    </div>
  ),
)
Input.displayName = 'Input'

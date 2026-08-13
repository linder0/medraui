import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type InputSize = 'sm' | 'md'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Icon rendered inside the field, before the text. */
  leadingIcon?: ReactNode
  /** sm is the compact pill used for inline search/filter fields — same
   *  height as sm buttons so mixed toolbars stay flush. */
  size?: InputSize
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-7 gap-1.5 rounded-md px-2.5',
  md: 'h-8.5 gap-2 rounded-md px-3',
}

const textClasses: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon, size = 'md', className, ...props }, ref) => (
    <div
      className={cn(
        'flex items-center border border-edge-strong bg-raised shadow-xs transition-colors',
        // Same focus treatment as the AI chat composer.
        'focus-within:border-primary focus-within:outline-1 focus-within:outline-primary',
        sizeClasses[size],
        className,
      )}
    >
      {leadingIcon && <span className="shrink-0 text-tertiary">{leadingIcon}</span>}
      <input
        ref={ref}
        className={cn(
          'w-full min-w-0 bg-transparent text-primary outline-none placeholder:text-tertiary',
          textClasses[size],
        )}
        {...props}
      />
    </div>
  ),
)
Input.displayName = 'Input'

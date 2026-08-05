import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names, resolving Tailwind conflicts last-wins —
 * so `cn('bg-raised', 'bg-panel')` reliably yields `bg-panel` instead of
 * depending on stylesheet order.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

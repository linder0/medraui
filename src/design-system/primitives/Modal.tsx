'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'
import { IconButton } from './IconButton'

type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Accessible label for the dialog when no visible title is wired up. */
  label?: string
  size?: ModalSize
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

/**
 * Portal-based centered dialog: dimmed backdrop, click-outside and Escape to
 * dismiss, spring enter/exit. Compose the body from design-system primitives.
 */
export function Modal({
  open,
  onClose,
  children,
  label,
  size = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Capture + stop so Escape only dismisses the topmost layer, not
        // ancestors with their own document-level Escape handlers (e.g. the
        // Experimentalist overlay).
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: spring.moderate.exit }}
          transition={spring.moderate}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-inverse/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cn(
              'relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-xl border border-edge bg-raised shadow-lg',
              sizeClasses[size],
              className,
            )}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: spring.moderate.exit }}
            transition={spring.moderate}
          >
            <div className="absolute right-3 top-3 z-10">
              <IconButton
                label="Close"
                size="sm"
                icon={<X className="size-4" strokeWidth={1.75} />}
                onClick={onClose}
              />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

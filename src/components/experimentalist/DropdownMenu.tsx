'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'

export interface MenuItem {
  label: string
  icon?: ReactNode
  destructive?: boolean
  onSelect: () => void
}

/**
 * Minimal anchored dropdown for the Experimentalist overlay: click the
 * trigger to toggle, click-outside or Escape to dismiss. `direction="up"`
 * flips the menu above the trigger for anchors near the bottom edge
 * (e.g. the composer's focus selector).
 */
export function DropdownMenu({
  trigger,
  items,
  direction = 'down',
  align = 'end',
  className,
}: {
  /** Rendered as-is inside the click target wrapper. */
  trigger: ReactNode
  items: MenuItem[]
  direction?: 'down' | 'up'
  align?: 'start' | 'end'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    // Capture phase so Escape closes the menu before the overlay handler.
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
      >
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'down' ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: direction === 'down' ? -4 : 4,
              scale: 0.98,
              transition: spring.moderate.exit,
            }}
            transition={spring.moderate}
            role="menu"
            className={cn(
              'absolute z-50 min-w-44 rounded-md border border-edge bg-raised p-1 shadow-md',
              direction === 'down' ? 'top-full mt-1' : 'bottom-full mb-1',
              align === 'end' ? 'right-0' : 'left-0',
            )}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm font-medium transition-colors',
                  item.destructive
                    ? 'text-danger hover:bg-danger-soft'
                    : 'text-secondary hover:bg-sunken hover:text-primary',
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

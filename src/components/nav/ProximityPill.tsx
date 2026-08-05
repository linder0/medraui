'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { ItemRect } from '@/hooks/useProximityHover'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'

/**
 * The floating hover background used by proximity-hover nav lists
 * (sidebar, campaign tabs). Springs between item rects and fades in
 * from `originRect` — usually the active route — so the highlight
 * grows out of where you are instead of appearing from nowhere.
 */
export function ProximityPill({
  hoverRect,
  originRect,
  sessionKey,
  className,
}: {
  hoverRect: ItemRect | null
  originRect?: ItemRect | null
  sessionKey: number
  className?: string
}) {
  return (
    <AnimatePresence>
      {hoverRect && (
        <motion.div
          key={sessionKey}
          aria-hidden
          className={cn('pointer-events-none absolute rounded-md', className)}
          initial={{ opacity: 0, ...(originRect ?? hoverRect) }}
          animate={{ opacity: 1, ...hoverRect }}
          exit={{ opacity: 0, transition: spring.fast.exit }}
          transition={{ ...spring.fast, opacity: { duration: 0.08 } }}
        />
      )}
    </AnimatePresence>
  )
}

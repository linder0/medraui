'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { Avatar } from '@/design-system'
import { campaigns } from '@/data/campaigns'
import type { Campaign } from '@/data/types'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'

/** Keep the user on the same campaign section when switching
 *  (e.g. /campaigns/a/assays → /campaigns/b/assays). */
function hrefForCampaign(pathname: string, campaignId: string): string {
  const match = pathname.match(/^\/campaigns\/[^/]+(?:\/([^/]+))?/)
  const section = match?.[1]
  return section
    ? `/campaigns/${campaignId}/${section}`
    : `/campaigns/${campaignId}`
}

export function CampaignSwitcher({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

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
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sunken"
      >
        <Avatar name={campaign.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-primary">
            {campaign.name}
          </span>
          <span className="block text-xs text-tertiary">
            Updated {campaign.updatedAgo}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-tertiary transition-transform',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.98,
              transition: spring.moderate.exit,
            }}
            transition={spring.moderate}
            role="menu"
            aria-label="Switch campaign"
            className="absolute inset-x-0 top-full z-50 mt-1 rounded-md border border-edge bg-raised p-1 shadow-md"
          >
            {campaigns.map((option) => {
              const active = option.id === campaign.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setOpen(false)
                    if (!active) {
                      router.push(hrefForCampaign(pathname, option.id))
                    }
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors',
                    active ? 'bg-sunken' : 'hover:bg-sunken',
                  )}
                >
                  <Avatar name={option.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-primary">
                      {option.name}
                    </span>
                    <span className="block text-2xs text-tertiary">
                      Updated {option.updatedAgo}
                    </span>
                  </span>
                  {active && (
                    <Check
                      className="size-3.5 shrink-0 text-secondary"
                      strokeWidth={2}
                    />
                  )}
                </button>
              )
            })}
            <div className="my-1 border-t border-edge" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                router.push('/campaigns')
              }}
              className="flex w-full items-center rounded-sm px-2.5 py-1.5 text-left text-sm font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              View all campaigns
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import type { ReactNode } from 'react'

/**
 * Standard scrolling content area for campaign pages — sits to the right of
 * the campaign panel. Full-bleed sections (Knowledge) skip this wrapper.
 */
export function CampaignScrollArea({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden bg-sunken">
      <div className="relative h-full overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}

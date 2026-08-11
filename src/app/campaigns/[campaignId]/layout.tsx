import type { ReactNode } from 'react'
import { CampaignPanel } from '@/components/campaign/CampaignPanel'
import { ExperimentalistProvider } from '@/components/experimentalist/ExperimentalistContext'
import { ExperimentalistOverlay } from '@/components/experimentalist/ExperimentalistOverlay'
import { getCampaignOrRedirect, type CampaignParams } from './campaign'

/**
 * Layout for /campaigns/[campaignId] — renders the campaign context
 * panel next to the section content.
 */
export default async function CampaignDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: CampaignParams
}) {
  const { campaignId } = await params
  const campaign = getCampaignOrRedirect(campaignId)

  return (
    <ExperimentalistProvider campaign={campaign}>
      <div className="relative flex min-w-0 flex-1">
        <CampaignPanel campaign={campaign} />
        <div className="relative min-w-0 flex-1 overflow-hidden bg-sunken">
          <div className="relative h-full overflow-y-auto overscroll-contain">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8">
              {children}
            </div>
          </div>
        </div>

        {/* Full-bleed chat overlay — covers the campaign panel and content. */}
        <ExperimentalistOverlay />
      </div>
    </ExperimentalistProvider>
  )
}

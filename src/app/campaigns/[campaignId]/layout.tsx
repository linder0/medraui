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
        {/* Pages wrap themselves in CampaignScrollArea; full-bleed sections
            (Knowledge) instead pin to this relative container so they can
            cover the campaign panel, like the chat overlay does. */}
        {children}

        {/* Full-bleed chat overlay — covers the campaign panel and content. */}
        <ExperimentalistOverlay />
      </div>
    </ExperimentalistProvider>
  )
}

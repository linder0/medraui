import { redirect } from 'next/navigation'
import { getCampaignById } from '@/data/campaigns'
import type { Campaign } from '@/data/types'

export type CampaignParams = Promise<{ campaignId: string }>

/** Resolve the campaign for a detail route, bouncing to /campaigns if unknown. */
export function getCampaignOrRedirect(campaignId: string): Campaign {
  const campaign = getCampaignById(campaignId)
  if (!campaign) redirect('/campaigns')
  return campaign
}

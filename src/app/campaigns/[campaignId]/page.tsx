import { CampaignScrollArea } from '@/components/campaign/CampaignScrollArea'
import { CampaignOverview } from '@/views/CampaignDetailPage'
import { getCampaignOrRedirect, type CampaignParams } from './campaign'

export default async function Page({ params }: { params: CampaignParams }) {
  const { campaignId } = await params
  const campaign = getCampaignOrRedirect(campaignId)
  return (
    <CampaignScrollArea>
      <CampaignOverview campaign={campaign} />
    </CampaignScrollArea>
  )
}

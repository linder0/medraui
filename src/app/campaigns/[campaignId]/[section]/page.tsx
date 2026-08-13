import { notFound } from 'next/navigation'
import { campaignSections } from '@/data/navigation'
import { CampaignScrollArea } from '@/components/campaign/CampaignScrollArea'
import { CampaignSection } from '@/views/CampaignDetailPage'
import { CampaignAssays } from '@/views/CampaignAssaysPage'
import { CampaignChats } from '@/views/CampaignChatsPage'
import { CampaignKnowledge } from '@/views/CampaignKnowledgePage'
import { getCampaignOrRedirect } from '../campaign'

/** One route serves every campaign tab (Assays, Plan, Knowledge, Chats). */
export default async function Page({
  params,
}: {
  params: Promise<{ campaignId: string; section: string }>
}) {
  const { campaignId, section } = await params
  const meta = campaignSections.find((s) => s.segment === section)
  if (!meta) notFound()

  const campaign = getCampaignOrRedirect(campaignId)

  // Knowledge is a full-bleed workspace pane — no scroll wrapper.
  if (section === 'knowledge') {
    return <CampaignKnowledge campaign={campaign} />
  }

  if (section === 'assays') {
    return (
      <CampaignScrollArea>
        <CampaignAssays campaign={campaign} />
      </CampaignScrollArea>
    )
  }

  if (section === 'chats') {
    return (
      <CampaignScrollArea>
        <CampaignChats campaign={campaign} />
      </CampaignScrollArea>
    )
  }

  return (
    <CampaignScrollArea>
      <CampaignSection campaign={campaign} title={meta.label} />
    </CampaignScrollArea>
  )
}

export function generateStaticParams() {
  return campaignSections.map((s) => ({ section: s.segment }))
}

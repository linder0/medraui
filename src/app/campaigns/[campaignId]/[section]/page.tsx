import { notFound } from 'next/navigation'
import { campaignSections } from '@/data/navigation'
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

  if (section === 'assays') {
    return <CampaignAssays campaign={campaign} />
  }

  if (section === 'knowledge') {
    return <CampaignKnowledge campaign={campaign} />
  }

  if (section === 'chats') {
    return <CampaignChats campaign={campaign} />
  }

  return <CampaignSection campaign={campaign} title={meta.label} />
}

export function generateStaticParams() {
  return campaignSections.map((s) => ({ section: s.segment }))
}

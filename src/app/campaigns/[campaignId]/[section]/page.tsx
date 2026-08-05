import { notFound } from 'next/navigation'
import { campaignSections } from '@/data/navigation'
import { CampaignSection } from '@/views/CampaignDetailPage'
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
  return <CampaignSection campaign={campaign} title={meta.label} />
}

export function generateStaticParams() {
  return campaignSections.map((s) => ({ section: s.segment }))
}

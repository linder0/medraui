import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Avatar, Button, Card, Progress } from '@/design-system'
import { PageContainer } from '@/components/layout/PageContainer'
import { CampaignStatusBadge } from '@/components/campaign/CampaignStatusBadge'
import { campaigns } from '@/data/campaigns'
import type { Campaign } from '@/data/types'

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaigns/${campaign.id}`} className="group">
      <Card className="h-full transition-colors group-hover:border-primary!">
        <div className="flex items-start justify-between gap-3">
          <Avatar name={campaign.name} size="lg" />
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-primary">
          {campaign.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-secondary">
          {campaign.objective ?? 'No objective recorded yet.'}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={campaign.progressPercent} className="flex-1" />
          <span className="text-xs font-medium text-secondary">
            {campaign.progressPercent}%
          </span>
        </div>
        <p className="mt-3 text-xs text-tertiary">
          {campaign.assayCount} assays · Updated {campaign.updatedAgo}
        </p>
      </Card>
    </Link>
  )
}

export function CampaignsPage() {
  return (
    <PageContainer>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Campaigns
          </h1>
          <p className="mt-1 text-md text-secondary">
            Long-running scientific efforts, each with goals, assays, and a
            knowledge base.
          </p>
        </div>
        <Button
          variant="primary"
          leadingIcon={<Plus className="size-4" strokeWidth={1.75} />}
        >
          New campaign
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </PageContainer>
  )
}

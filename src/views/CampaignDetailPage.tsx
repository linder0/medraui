import Link from 'next/link'
import {
  ArrowLeft,
  MessagesSquare,
  Plus,
  Sparkles,
  Hand,
  FlaskConical,
} from 'lucide-react'
import { Badge, Button, EmptyState } from '@/design-system'
import { CampaignStatusBadge } from '@/components/campaign/CampaignStatusBadge'
import { ActionCard } from '@/components/campaign/ActionCard'
import { ExperimentalistTrigger } from '@/components/experimentalist/ExperimentalistTrigger'
import { FileBrowser } from '@/components/campaign/FileBrowser'
import type { Campaign } from '@/data/types'
import type { ReactNode } from 'react'

function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" strokeWidth={1.75} />
      {children}
    </Link>
  )
}

export function CampaignOverview({ campaign }: { campaign: Campaign }) {
  return (
    <>
      <header>
        <BackLink href="/campaigns">Back to campaigns</BackLink>
        <div className="mt-5 flex items-center gap-2">
          <CampaignStatusBadge status={campaign.status} />
          <Badge variant="outline">Created {campaign.createdAgo}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
          {campaign.name}
        </h1>
        <p className="mt-2 max-w-xl text-md text-secondary">
          {campaign.objective ??
            'No objective recorded yet. Open the AI Experimentalist to start shaping this campaign.'}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          emphasized
          kicker="Recommended"
          kickerIcon={<Sparkles className="size-3" strokeWidth={2} />}
          title="Plan with the AI Experimentalist"
          description="Start chatting with AI Experimentalist to build your campaign, draft goals, outline assays, and turn your context into a working plan."
          action={
            <ExperimentalistTrigger
              variant="primary"
              leadingIcon={
                <MessagesSquare className="size-4" strokeWidth={1.75} />
              }
            >
              Open AI Experimentalist
            </ExperimentalistTrigger>
          }
        />
        <ActionCard
          kicker="Manual"
          kickerIcon={<Hand className="size-3" strokeWidth={2} />}
          title="Add the first goal"
          description="Define the first scientific objective yourself, then link assays or ask the AI Experimentalist to help design the next layer."
          action={
            <Button leadingIcon={<Plus className="size-4" strokeWidth={1.75} />}>
              Add goal
            </Button>
          }
        />
      </div>

      <FileBrowser files={campaign.files} />
    </>
  )
}

/** Stub for campaign tabs that aren't built yet (Assays, Plan, Knowledge, Chats). */
export function CampaignSection({
  campaign,
  title,
}: {
  campaign: Campaign
  title: string
}) {
  return (
    <>
      <header>
        <BackLink href={`/campaigns/${campaign.id}`}>Back to overview</BackLink>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-primary">
          {title}
        </h1>
      </header>
      <EmptyState
        icon={<FlaskConical className="size-6" strokeWidth={1.5} />}
        title={`No ${title.toLowerCase()} yet`}
        description={`${title} for ${campaign.name} will appear here once created.`}
      />
    </>
  )
}

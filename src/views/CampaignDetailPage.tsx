import Link from 'next/link'
import {
  ArrowLeft,
  MessagesSquare,
  Plus,
  Sparkles,
  Hand,
  FlaskConical,
} from 'lucide-react'
import { Button, EmptyState } from '@/design-system'
import { ActionCard } from '@/components/campaign/ActionCard'
import { CampaignHeroCard } from '@/components/campaign/CampaignHeroCard'
import { GoalsSection } from '@/components/campaign/GoalsSection'
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
  const isEmpty = campaign.goals.length === 0

  return (
    <>
      <CampaignHeroCard campaign={campaign} />

      {isEmpty ? (
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
              <Button
                leadingIcon={<Plus className="size-4" strokeWidth={1.75} />}
              >
                Add goal
              </Button>
            }
          />
        </div>
      ) : (
        <GoalsSection goals={campaign.goals} />
      )}

      <FileBrowser files={campaign.files} />
    </>
  )
}

/** Stub for campaign tabs that aren't built yet (Plan). */
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

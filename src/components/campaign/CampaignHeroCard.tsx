import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, MessagesSquare, Pencil, Plus } from 'lucide-react'
import { Button } from '@/design-system'
import { ExperimentalistTrigger } from '@/components/experimentalist/ExperimentalistTrigger'
import { runs } from '@/data/campaigns'
import type { Campaign, CampaignStatus } from '@/data/types'
import { cn } from '@/lib/cn'

const statusDot: Record<CampaignStatus, string> = {
  planned: 'bg-on-inverse-muted',
  active: 'bg-success',
  paused: 'bg-warning',
  completed: 'bg-success',
}

function HeroPill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-2xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs font-semibold tracking-wide text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

/**
 * Purple gradient campaign summary — the hero at the top of a campaign
 * overview, carrying status, objective, schedule, and progress.
 */
export function CampaignHeroCard({ campaign }: { campaign: Campaign }) {
  const openGoals = campaign.goals.filter((g) => g.status !== 'completed')
  const activeGoals = openGoals.filter((g) => g.status === 'active').length
  const plannedGoals = openGoals.filter((g) => g.status === 'planned').length
  const runCount = runs.filter((r) => r.campaignName === campaign.name).length
  const goalLabel =
    campaign.goals.length === 0
      ? 'No goals'
      : activeGoals > 0
        ? `${activeGoals} active goal${activeGoals === 1 ? '' : 's'}`
        : `${plannedGoals} planned goal${plannedGoals === 1 ? '' : 's'}`

  return (
    <section className="relative overflow-hidden rounded-xl bg-linear-to-br from-[#3b1d8f] via-[#5b35c5] to-[#7b6ef0] p-6 text-white shadow-sm sm:p-7">
      {/* Soft highlight so the right side reads lighter, like the reference. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full bg-[#2a1068]/35 blur-3xl"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to campaigns
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="border-white/20 bg-white/15 text-white shadow-none hover:bg-white/25"
            leadingIcon={<Pencil className="size-3.5" strokeWidth={1.75} />}
          >
            Edit
          </Button>
          <ExperimentalistTrigger
            size="sm"
            className="border-white/20 bg-white/15 text-white shadow-none hover:bg-white/25"
            leadingIcon={
              <MessagesSquare className="size-3.5" strokeWidth={1.75} />
            }
          >
            AI Experimentalist
          </ExperimentalistTrigger>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
          >
            New goal
          </Button>
        </div>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-2">
        <HeroPill>
          {campaign.status === 'planned' ? (
            <Check className="size-3" strokeWidth={2.25} aria-hidden />
          ) : (
            <span
              className={cn('size-1.5 rounded-full', statusDot[campaign.status])}
            />
          )}
          {campaign.status}
        </HeroPill>
        <HeroPill>{goalLabel}</HeroPill>
        <HeroPill>
          {runCount} run{runCount === 1 ? '' : 's'}
        </HeroPill>
      </div>

      <h1 className="relative mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {campaign.name}
      </h1>
      <p className="relative mt-2 max-w-2xl text-md leading-relaxed text-white/80">
        {campaign.objective ??
          'No objective recorded yet. Open the AI Experimentalist to start shaping this campaign.'}
      </p>

      <div className="relative mt-8 flex flex-col gap-6 border-t border-white/15 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:gap-10">
          <MetaCell label="Start" value={campaign.startDate} />
          <MetaCell label="Target" value={campaign.targetDate} />
          <MetaCell label="Lead" value={campaign.lead ?? 'Unassigned'} />
          <MetaCell label="Versions" value={String(campaign.versions)} />
        </div>

        <div className="w-full sm:max-w-56">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-white/70">
              Campaign progress
            </span>
            <span className="text-xs font-semibold text-white">
              {campaign.progressPercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={campaign.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          >
            <div
              className="h-full rounded-full bg-white transition-[width]"
              style={{ width: `${campaign.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

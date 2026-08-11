import type { Assay, AssayStatus, CampaignGoal } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * Dot color per assay status. Draft renders hollow so unstarted work reads
 * as an outline rather than competing with the filled status colors.
 */
const statusDot: Record<AssayStatus, string> = {
  draft: 'border border-edge-strong bg-transparent',
  ready: 'bg-info',
  running: 'bg-warning animate-pulse',
  completed: 'bg-success',
}

const statusLabel: Record<AssayStatus, string> = {
  draft: 'draft',
  ready: 'ready',
  running: 'running',
  completed: 'completed',
}

function AssayDot({ assay, goalCode }: { assay: Assay; goalCode: string }) {
  const label = `${goalCode} · ${assay.name} · ${statusLabel[assay.status]}`
  return (
    <span
      title={label}
      className={cn('size-2 shrink-0 rounded-full', statusDot[assay.status])}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}

/**
 * Goal/assay tracking indicator — one group per goal carrying a status dot
 * per assay, plus a completion summary. Replaces plain "N assays across
 * M goals" copy with something you can actually read progress from.
 */
export function GoalAssayTracker({ goals }: { goals: CampaignGoal[] }) {
  const goalsWithAssays = goals.filter((goal) => goal.assays.length > 0)
  const assays = goalsWithAssays.flatMap((goal) => goal.assays)

  if (assays.length === 0) {
    return (
      <span className="text-2xs font-semibold tracking-[0.08em] text-tertiary uppercase">
        No assays linked
      </span>
    )
  }

  const completed = assays.filter((a) => a.status === 'completed').length
  const running = assays.filter((a) => a.status === 'running').length
  const summary = [
    `${completed} of ${assays.length} complete`,
    running > 0 && `${running} running`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {goalsWithAssays.map((goal) => (
          <span
            key={goal.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-panel py-1 pr-2 pl-1.5"
          >
            <span className="font-mono text-2xs font-semibold tracking-wide text-secondary uppercase">
              {goal.code}
            </span>
            <span className="flex items-center gap-1">
              {goal.assays.map((assay) => (
                <AssayDot key={assay.id} assay={assay} goalCode={goal.code} />
              ))}
            </span>
          </span>
        ))}
      </div>
      <span className="text-2xs font-semibold tracking-[0.08em] text-tertiary uppercase">
        {summary}
      </span>
    </div>
  )
}

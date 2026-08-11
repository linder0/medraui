import {
  ArrowRight,
  FlaskConical,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  IconButton,
  type BadgeTone,
} from '@/design-system'
import type { Assay, AssayStatus, CampaignGoal, GoalStatus } from '@/data/types'

const goalStatusTone: Record<GoalStatus, BadgeTone> = {
  planned: 'neutral',
  active: 'info',
  completed: 'success',
}

const assayStatusTone: Record<AssayStatus, BadgeTone> = {
  draft: 'neutral',
  ready: 'info',
  running: 'warning',
  completed: 'success',
}

function AssayRow({ assay }: { assay: Assay }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-edge bg-panel px-3.5 py-3">
      <FlaskConical
        className="size-5 shrink-0 text-secondary"
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-primary">{assay.name}</p>
          <Badge tone={assayStatusTone[assay.status]}>{assay.status}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-tertiary">
          {assay.versions} version{assay.versions === 1 ? '' : 's'} ·{' '}
          {assay.runCount} run{assay.runCount === 1 ? '' : 's'} ·{' '}
          <span className="capitalize">{assay.status}</span> {assay.experimentId}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          trailingIcon={<ArrowRight className="size-3.5" strokeWidth={1.75} />}
        >
          Open
        </Button>
        <Button size="sm" variant="ghost">
          Unlink
        </Button>
      </div>
    </div>
  )
}

function GoalCard({ goal }: { goal: CampaignGoal }) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-sunken px-2 py-1 font-mono text-2xs font-semibold tracking-wide text-secondary uppercase">
            {goal.code}
          </span>
          <Badge tone={goalStatusTone[goal.status]} variant="outline">
            {goal.status}
          </Badge>
          <span className="text-xs text-tertiary">
            Target {goal.targetDate ?? '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            leadingIcon={<Pencil className="size-3.5" strokeWidth={1.75} />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
          >
            Add assay
          </Button>
          <IconButton
            label="More goal actions"
            size="sm"
            icon={<MoreVertical className="size-4" strokeWidth={1.75} />}
          />
        </div>
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-primary">
        {goal.title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-secondary">
        {goal.description}
      </p>

      {goal.assays.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          {goal.assays.map((assay) => (
            <AssayRow key={assay.id} assay={assay} />
          ))}
        </div>
      )}
    </Card>
  )
}

export function GoalsSection({ goals }: { goals: CampaignGoal[] }) {
  return (
    <section>
      <CardHeader
        title="Goals"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              leadingIcon={
                <GripVertical className="size-3.5" strokeWidth={1.75} />
              }
            >
              Reorder goals
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
            >
              New goal
            </Button>
          </div>
        }
      />
      <div className="mt-4 flex flex-col gap-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  )
}

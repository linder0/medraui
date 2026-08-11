import Link from 'next/link'
import { Badge, Card, CardHeader, DataTable, type Column } from '@/design-system'
import { PageContainer } from '@/components/layout/PageContainer'
import { campaigns, runs, currentUser } from '@/data/campaigns'
import type { Run } from '@/data/types'

const runStatusTone = {
  queued: 'neutral',
  running: 'info',
  succeeded: 'success',
  failed: 'danger',
} as const

const runColumns: Column<Run>[] = [
  {
    key: 'name',
    header: 'Run',
    render: (run) => <span className="font-medium">{run.name}</span>,
  },
  {
    key: 'campaign',
    header: 'Campaign',
    render: (run) => <span className="text-secondary">{run.campaignName}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    widthClassName: 'w-28',
    render: (run) => <Badge tone={runStatusTone[run.status]}>{run.status}</Badge>,
  },
  {
    key: 'started',
    header: 'Started',
    widthClassName: 'w-28',
    render: (run) => <span className="text-secondary">{run.startedAgo}</span>,
  },
  {
    key: 'duration',
    header: 'Duration',
    align: 'right',
    widthClassName: 'w-28',
    render: (run) => <span className="text-secondary">{run.duration}</span>,
  },
]

function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string
  value: string
  detail: string
  href?: string
}) {
  const card = (
    <Card className={href ? 'transition-shadow hover:shadow-md' : undefined}>
      <p className="text-sm font-medium text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs text-tertiary">{detail}</p>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block rounded-lg focus-visible:outline-2">
        {card}
      </Link>
    )
  }

  return card
}

export function DashboardPage() {
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const runningRuns = runs.filter((r) => r.status === 'running').length

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight text-primary">
        Welcome back, {currentUser.name}
      </h1>
      <p className="mt-1 text-md text-secondary">
        Here is what is happening across your lab today.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active campaigns"
          value={String(activeCampaigns)}
          detail={`${campaigns.length} total campaigns`}
          href="/campaigns"
        />
        <StatCard
          label="Runs in progress"
          value={String(runningRuns)}
          detail={`${runs.length} runs this week`}
        />
        <StatCard
          label="Pending approvals"
          value="2"
          detail="Plan updates awaiting review"
        />
      </div>

      <Card className="mt-6" padding="lg">
        <CardHeader
          title="Recent runs"
          description="Latest activity across all campaigns."
        />
        <DataTable
          className="mt-4"
          columns={runColumns}
          rows={runs}
          rowKey={(run) => run.id}
        />
      </Card>
    </PageContainer>
  )
}

import { Badge, Card, DataTable, type Column } from '@/design-system'
import { PageContainer } from '@/components/layout/PageContainer'
import { runs } from '@/data/campaigns'
import type { Run } from '@/data/types'

const runStatusTone = {
  queued: 'neutral',
  running: 'info',
  succeeded: 'success',
  failed: 'danger',
} as const

const runColumns: Column<Run>[] = [
  {
    key: 'id',
    header: 'ID',
    widthClassName: 'w-28',
    render: (run) => (
      <span className="font-mono text-xs text-secondary">{run.id}</span>
    ),
  },
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
    render: (run) => (
      <Badge tone={runStatusTone[run.status]}>{run.status}</Badge>
    ),
  },
  {
    key: 'started',
    header: 'Started',
    widthClassName: 'w-28',
    render: (run) => (
      <span className="text-secondary">{run.startedAgo}</span>
    ),
  },
  {
    key: 'duration',
    header: 'Duration',
    align: 'right',
    widthClassName: 'w-28',
    render: (run) => <span className="text-secondary">{run.duration}</span>,
  },
]

function StatusSummary() {
  const counts = {
    queued: runs.filter((r) => r.status === 'queued').length,
    running: runs.filter((r) => r.status === 'running').length,
    succeeded: runs.filter((r) => r.status === 'succeeded').length,
    failed: runs.filter((r) => r.status === 'failed').length,
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(counts) as Array<keyof typeof counts>).map((status) => (
        <Badge key={status} tone={runStatusTone[status]}>
          {status}
          <span className="tabular-nums">{counts[status]}</span>
        </Badge>
      ))}
    </div>
  )
}

export function RunsPage() {
  return (
    <PageContainer>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Runs
        </h1>
        <p className="mt-1 text-md text-secondary">
          Assay executions across campaigns — queued, in progress, and
          completed.
        </p>
      </div>

      <div className="mt-6">
        <StatusSummary />
      </div>

      <Card className="mt-6" padding="none">
        <DataTable columns={runColumns} rows={runs} rowKey={(run) => run.id} />
      </Card>
    </PageContainer>
  )
}

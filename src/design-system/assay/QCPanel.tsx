import { Badge, type BadgeTone } from '../primitives/Badge'
import { cn } from '@/lib/cn'

export type QCStatus = 'pass' | 'warn' | 'fail'

export interface QCMetric {
  /** Metric name, e.g. "Z′-factor". */
  label: string
  /** Formatted value, e.g. '0.71'. */
  value: string
  status: QCStatus
  /** One-line context, e.g. 'threshold ≥ 0.5'. */
  detail?: string
}

export interface QCPanelProps {
  metrics: QCMetric[]
  /** Overall verdict; defaults to the worst metric status. */
  verdict?: QCStatus
  className?: string
}

const statusTone: Record<QCStatus, BadgeTone> = {
  pass: 'success',
  warn: 'warning',
  fail: 'danger',
}

const statusLabel: Record<QCStatus, string> = {
  pass: 'QC pass',
  warn: 'QC warning',
  fail: 'QC fail',
}

const statusDot: Record<QCStatus, string> = {
  pass: 'bg-success',
  warn: 'bg-warning',
  fail: 'bg-danger',
}

function worst(metrics: QCMetric[]): QCStatus {
  if (metrics.some((m) => m.status === 'fail')) return 'fail'
  if (metrics.some((m) => m.status === 'warn')) return 'warn'
  return 'pass'
}

/**
 * QC gate rendered above assay results: control performance, Z′, CV%,
 * drift — pass/fail verdicts before any science. A failed gate should
 * visually de-emphasize the results below it; bad data must not look
 * trustworthy.
 */
export function QCPanel({ metrics, verdict, className }: QCPanelProps) {
  const overall = verdict ?? worst(metrics)
  return (
    <div
      className={cn(
        'rounded-md border border-edge bg-panel p-3',
        overall === 'fail' && 'border-danger/30',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Badge tone={statusTone[overall]}>{statusLabel[overall]}</Badge>
        {metrics.map((m) => (
          <span
            key={m.label}
            className="inline-flex items-baseline gap-1.5 text-sm"
            title={m.detail}
          >
            <span
              aria-hidden
              className={cn(
                'inline-block h-1.5 w-1.5 self-center rounded-full',
                statusDot[m.status],
              )}
            />
            <span className="text-secondary">{m.label}</span>
            <span className="font-mono font-medium text-primary">{m.value}</span>
            {m.detail && (
              <span className="text-xs text-tertiary">({m.detail})</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

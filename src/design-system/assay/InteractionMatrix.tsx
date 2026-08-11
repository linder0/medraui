import { Fragment } from 'react'

export interface InteractionMatrixProps {
  /** Row/column labels; the matrix is square in these. */
  labels: string[]
  /** Pairwise strengths in [0, 1], indexed [row][col]. */
  values: number[][]
  /** At/above this value a pair counts as interacting. */
  threshold?: number
  /** Legend label for interacting cells, e.g. 'Competes (same bin)'. */
  interactionLabel: string
  /** Legend label for non-interacting cells, e.g. 'Sandwich-compatible'. */
  noInteractionLabel: string
  /** Axis semantics for tooltips, e.g. ['immobilized', 'detecting']. */
  axisRoles?: [string, string]
}

function cellFill(t: number): string {
  const pct = Math.round(6 + t * 86)
  return `color-mix(in srgb, var(--medra-indigo-600) ${pct}%, var(--surface-raised))`
}

/**
 * Pairwise relationship heatmap: epitope binning, cross-reactivity,
 * selectivity panels. Cluster-ordered labels make bins pop out as
 * blocks along the diagonal.
 */
export function InteractionMatrix({
  labels,
  values,
  threshold = 0.5,
  interactionLabel,
  noInteractionLabel,
  axisRoles,
}: InteractionMatrixProps) {
  return (
    <div className="space-y-3">
      <div
        className="grid w-fit gap-[3px]"
        style={{
          gridTemplateColumns: `4.5rem repeat(${labels.length}, 2.25rem)`,
        }}
        role="img"
        aria-label={`Interaction matrix across ${labels.length} entries`}
      >
        <span aria-hidden />
        {labels.map((label) => (
          <span
            key={`c${label}`}
            className="truncate text-center text-2xs text-tertiary"
            title={label}
          >
            {label.replace(/^[^-]*-/, '')}
          </span>
        ))}
        {labels.map((rowLabel, r) => (
          <Fragment key={rowLabel}>
            <span
              className="flex items-center truncate text-2xs text-tertiary"
              title={rowLabel}
            >
              {rowLabel}
            </span>
            {labels.map((colLabel, c) => {
              const v = values[r][c]
              const interacts = v >= threshold
              const pair = axisRoles
                ? `${rowLabel} (${axisRoles[0]}) × ${colLabel} (${axisRoles[1]})`
                : `${rowLabel} × ${colLabel}`
              return (
                <span
                  key={`x${rowLabel}-${colLabel}`}
                  title={`${pair} · ${interacts ? interactionLabel : noInteractionLabel}`}
                  className="aspect-square rounded-[var(--radius-xs)] border border-edge"
                  style={{ background: cellFill(interacts ? Math.max(v, 0.55) : v * 0.15) }}
                />
              )
            })}
          </Fragment>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-3 w-3 rounded-[3px]"
            style={{ background: cellFill(0.85) }}
          />
          {interactionLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-3 w-3 rounded-[3px] border border-edge"
            style={{ background: cellFill(0.04) }}
          />
          {noInteractionLabel}
        </span>
      </div>
    </div>
  )
}

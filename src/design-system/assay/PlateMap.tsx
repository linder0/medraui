import { Fragment } from 'react'

const ROW_LABELS = 'ABCDEFGHIJKLMNOP'

export interface PlateMapProps {
  /** Well values by [row][col]; null renders an empty well. */
  values: (number | null)[][]
  /** What the value means, used in tooltips and the legend, e.g. '% inhibition'. */
  valueLabel: string
  /** Color-scale domain; defaults to the data extent. */
  domain?: [number, number]
  /** 0-based column indices reserved for controls, annotated in the legend. */
  controlCols?: { positive?: number[]; negative?: number[] }
  /** Non-control wells at/above this value render with a hit ring. */
  hitThreshold?: number
}

function wellFill(t: number): string {
  const pct = Math.round(8 + t * 88)
  return `color-mix(in srgb, var(--medra-indigo-600) ${pct}%, var(--surface-raised))`
}

/**
 * Spatial heatmap of any plate-format readout (96/384-well). The
 * scientist's instinctive first look at plate data — edge effects,
 * dispenser streaks, and control failures jump out spatially before
 * any statistic is computed.
 */
export function PlateMap({
  values,
  valueLabel,
  domain,
  controlCols = {},
  hitThreshold,
}: PlateMapProps) {
  const cols = Math.max(...values.map((row) => row.length))
  const flat = values.flat().filter((v): v is number => v !== null)
  const [lo, hi] = domain ?? [Math.min(...flat), Math.max(...flat)]
  const span = hi - lo || 1

  const positive = new Set(controlCols.positive ?? [])
  const negative = new Set(controlCols.negative ?? [])

  return (
    <div className="space-y-3">
      <div
        className="grid w-fit gap-[3px]"
        style={{ gridTemplateColumns: `1.25rem repeat(${cols}, 1.5rem)` }}
        role="img"
        aria-label={`Plate map of ${valueLabel}`}
      >
        <span aria-hidden />
        {Array.from({ length: cols }, (_, c) => (
          <span key={`c${c}`} className="text-center text-2xs text-tertiary">
            {c + 1}
          </span>
        ))}
        {values.map((row, r) => (
          <Fragment key={ROW_LABELS[r]}>
            <span className="flex items-center text-2xs text-tertiary">
              {ROW_LABELS[r]}
            </span>
            {Array.from({ length: cols }, (_, c) => {
              const v = row[c] ?? null
              if (v === null) {
                return (
                  <span
                    key={`w${r}-${c}`}
                    className="aspect-square rounded-[var(--radius-xs)] border border-dashed border-edge"
                  />
                )
              }
              const isControl = positive.has(c) || negative.has(c)
              const isHit =
                hitThreshold !== undefined && !isControl && v >= hitThreshold
              const well = `${ROW_LABELS[r]}${String(c + 1).padStart(2, '0')}`
              return (
                <span
                  key={`w${r}-${c}`}
                  title={`${well} · ${v} ${valueLabel}${isHit ? ' · hit' : ''}${isControl ? (positive.has(c) ? ' · positive control' : ' · negative control') : ''}`}
                  className={
                    isHit
                      ? 'aspect-square rounded-[var(--radius-xs)] ring-2 ring-[var(--medra-ink-900)] ring-inset'
                      : 'aspect-square rounded-[var(--radius-xs)] border border-edge'
                  }
                  style={{ background: wellFill((v - lo) / span) }}
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
            className="h-3 w-3 rounded-[3px] border border-edge"
            style={{ background: wellFill(0.06) }}
          />
          Low {valueLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-3 w-3 rounded-[3px]"
            style={{ background: wellFill(1) }}
          />
          High {valueLabel}
        </span>
        {hitThreshold !== undefined && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-3 w-3 rounded-[3px] ring-2 ring-[var(--medra-ink-900)] ring-inset"
            />
            Hit (≥ {hitThreshold})
          </span>
        )}
        {(controlCols.positive?.length ?? 0) > 0 && (
          <span className="text-tertiary">
            Col {controlCols.positive!.map((c) => c + 1).join(', ')} = positive ctrl
          </span>
        )}
        {(controlCols.negative?.length ?? 0) > 0 && (
          <span className="text-tertiary">
            Col {controlCols.negative!.map((c) => c + 1).join(', ')} = negative ctrl
          </span>
        )}
      </div>
    </div>
  )
}

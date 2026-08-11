import { XYChart, type XYPoint, type YMarker } from './internal/XYChart'

export interface TimecourseSeries {
  /** Condition or variant label, e.g. 'Linker v3.1'. */
  label: string
  color?: string
  points: XYPoint[]
}

export interface TimecourseProps {
  series: TimecourseSeries[]
  xLabel: string
  yLabel: string
  /** Threshold crossings to mark, e.g. the 50% line a half-life is read from. */
  thresholds?: YMarker[]
  height?: number
}

/**
 * Value-over-time comparison across conditions: stability decay, growth,
 * viability, expression. Overlaying variants is the primary mode — these
 * assays are almost always run to choose between candidates.
 */
export function Timecourse({
  series,
  xLabel,
  yLabel,
  thresholds = [],
  height,
}: TimecourseProps) {
  return (
    <XYChart
      series={series}
      xLabel={xLabel}
      yLabel={yLabel}
      yMarkers={thresholds}
      height={height}
    />
  )
}

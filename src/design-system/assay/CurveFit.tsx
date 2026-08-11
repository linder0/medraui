import {
  XYChart,
  type XYPoint,
  type YMarker,
} from './internal/XYChart'

export interface CurveFitSeries {
  label: string
  color?: string
  /** Measured points, drawn as open dots. */
  points: XYPoint[]
  /** Fitted model evaluated densely across the x range, drawn as the curve. */
  fit: XYPoint[]
}

export interface CurveFitProps {
  series: CurveFitSeries[]
  xLabel: string
  yLabel: string
  /** Log-10 x axis — the default, since dose series are log-spaced. */
  logX?: boolean
  /** Horizontal crossings to mark, e.g. the 50% line an IC50 is read from. */
  crossings?: YMarker[]
  height?: number
}

/**
 * Dose–response curve: measured points with the fitted model (4PL or
 * similar) overlaid on a log-dose axis. The same primitive serves
 * potency (IC50/EC50), viability, and selectivity readouts — only the
 * axis labels change.
 */
export function CurveFit({
  series,
  xLabel,
  yLabel,
  logX = true,
  crossings = [],
  height,
}: CurveFitProps) {
  return (
    <XYChart
      series={series}
      xLabel={xLabel}
      yLabel={yLabel}
      logX={logX}
      yMarkers={crossings}
      height={height}
    />
  )
}

import { XYChart, type XYPoint } from './internal/XYChart'

export interface ChromatogramPeak {
  /** Retention time of the peak apex. */
  x: number
  /** Signal at the apex, used to place the annotation. */
  y: number
  label: string
}

export interface ChromatogramProps {
  trace: XYPoint[]
  peaks?: ChromatogramPeak[]
  xLabel?: string
  yLabel?: string
  color?: string
  height?: number
}

/**
 * Signal vs retention time with annotated peaks. Purity and release
 * questions reduce to peak-area ratios, so integration results should
 * always render alongside (see FitParamsCard).
 */
export function Chromatogram({
  trace,
  peaks = [],
  xLabel = 'Retention time (min)',
  yLabel = 'Intensity',
  color,
  height,
}: ChromatogramProps) {
  return (
    <XYChart
      series={[{ label: yLabel, color, points: trace, fillArea: true }]}
      xLabel={xLabel}
      yLabel={yLabel}
      annotations={peaks}
      height={height}
      hideLegend
    />
  )
}

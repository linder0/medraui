import { XYChart, type XYPoint, type XBand } from './internal/XYChart'

export interface SensorgramTrace {
  /** Analyte concentration label, e.g. '100 nM'. */
  label: string
  color?: string
  points: XYPoint[]
}

export interface SensorgramProps {
  traces: SensorgramTrace[]
  /** Association/dissociation phase bands drawn behind the traces. */
  phases?: XBand[]
  xLabel?: string
  yLabel?: string
  height?: number
}

/**
 * SPR/BLI binding kinetics: time-resolved response traces at an analyte
 * concentration series, with the association and dissociation phases
 * annotated so on/off-rate behavior reads at a glance.
 */
export function Sensorgram({
  traces,
  phases = [],
  xLabel = 'Time (s)',
  yLabel = 'Response (RU)',
  height,
}: SensorgramProps) {
  return (
    <XYChart
      series={traces}
      xLabel={xLabel}
      yLabel={yLabel}
      xBands={phases}
      height={height}
    />
  )
}

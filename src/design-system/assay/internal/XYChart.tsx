/**
 * Internal SVG chart core shared by the curve-based assay primitives
 * (CurveFit, Sensorgram, Timecourse, Chromatogram). Not exported from
 * the design-system public API — assay primitives wrap it with
 * domain-specific props instead.
 */

export interface XYPoint {
  x: number
  y: number
}

export interface XYSeriesSpec {
  label: string
  /** CSS color; defaults to the shared series palette by index. */
  color?: string
  points: XYPoint[]
  /** Fitted-model curve drawn as a solid line; when present, `points` render as dots. */
  fit?: XYPoint[]
  /** Shade the area under the line down to the baseline. */
  fillArea?: boolean
}

/** Horizontal dashed marker on the value axis (thresholds, crossings). */
export interface YMarker {
  y: number
  label: string
}

/** Shaded x-range with a label, e.g. association/dissociation phases. */
export interface XBand {
  from: number
  to: number
  label: string
}

/** Point annotation, e.g. an integrated chromatogram peak. */
export interface XYAnnotation {
  x: number
  y: number
  label: string
}

export interface XYChartProps {
  series: XYSeriesSpec[]
  xLabel: string
  yLabel: string
  /** Log-10 x axis (dose series). All x values must be > 0. */
  logX?: boolean
  yMarkers?: YMarker[]
  xBands?: XBand[]
  annotations?: XYAnnotation[]
  /** Force the y domain; defaults to [0, niceCeil(dataMax)]. */
  yDomain?: [number, number]
  height?: number
  /** Hide the series legend (single-series charts). */
  hideLegend?: boolean
}

export const seriesPalette = [
  'var(--medra-indigo-600)',
  'var(--medra-blue-600)',
  'var(--medra-green-600)',
  'var(--medra-amber-600)',
  'var(--medra-red-600)',
  'var(--medra-ink-500)',
]

const W = 640
const M = { top: 16, right: 20, bottom: 40, left: 52 }

function linearTicks(min: number, max: number, count = 5): number[] {
  const span = max - min
  if (span <= 0) return [min]
  const step0 = span / count
  const mag = 10 ** Math.floor(Math.log10(step0))
  const norm = step0 / mag
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-6; v += step) {
    ticks.push(Number(v.toFixed(10)))
  }
  return ticks
}

function logTicks(min: number, max: number): number[] {
  const ticks: number[] = []
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    const v = 10 ** e
    if (v >= min * 0.999 && v <= max * 1.001) ticks.push(v)
  }
  return ticks
}

function formatTick(v: number): string {
  if (v !== 0 && Math.abs(v) < 0.01) return v.toExponential(0)
  if (Math.abs(v) >= 10000) return `${Number((v / 1000).toFixed(1))}k`
  return String(Number(v.toFixed(2)))
}

export function XYChart({
  series,
  xLabel,
  yLabel,
  logX = false,
  yMarkers = [],
  xBands = [],
  annotations = [],
  yDomain,
  height = 260,
  hideLegend = false,
}: XYChartProps) {
  const allPoints = series.flatMap((s) => [...s.points, ...(s.fit ?? [])])
  if (allPoints.length === 0) return null

  const xs = allPoints.map((p) => p.x)
  const ys = [...allPoints.map((p) => p.y), ...yMarkers.map((m) => m.y)]

  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const dataYMax = Math.max(...ys)
  const dataYMin = Math.min(0, ...ys)
  const [yMin, yMax] = yDomain ?? [dataYMin, dataYMax * 1.06]

  const plotW = W - M.left - M.right
  const plotH = height - M.top - M.bottom

  const tx = (x: number) => {
    const t = logX
      ? (Math.log10(x) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))
      : (x - xMin) / (xMax - xMin)
    return M.left + t * plotW
  }
  const ty = (y: number) => M.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH

  const xTicks = logX ? logTicks(xMin, xMax) : linearTicks(xMin, xMax, 6)
  const yTicks = linearTicks(yMin, yMax, 5)
  const baselineY = ty(Math.max(yMin, 0))

  const linePath = (pts: XYPoint[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ')

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        role="img"
        aria-label={`${yLabel} vs ${xLabel}`}
        className="w-full"
      >
        {xBands.map((band) => (
          <g key={band.label}>
            <rect
              x={tx(band.from)}
              y={M.top}
              width={tx(band.to) - tx(band.from)}
              height={plotH}
              fill="var(--surface-sunken)"
              opacity={0.55}
            />
            <text
              x={(tx(band.from) + tx(band.to)) / 2}
              y={M.top + 12}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-tertiary)"
            >
              {band.label}
            </text>
          </g>
        ))}

        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={ty(t)}
              y2={ty(t)}
              stroke="var(--border-default)"
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={ty(t) + 3}
              textAnchor="end"
              fontSize={10}
              fill="var(--text-tertiary)"
            >
              {formatTick(t)}
            </text>
          </g>
        ))}

        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line
              x1={tx(t)}
              x2={tx(t)}
              y1={M.top + plotH}
              y2={M.top + plotH + 4}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <text
              x={tx(t)}
              y={M.top + plotH + 16}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-tertiary)"
            >
              {formatTick(t)}
            </text>
          </g>
        ))}

        <line
          x1={M.left}
          x2={W - M.right}
          y1={M.top + plotH}
          y2={M.top + plotH}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />

        {yMarkers.map((m) => (
          <g key={m.label}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={ty(m.y)}
              y2={ty(m.y)}
              stroke="var(--medra-amber-600)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text
              x={W - M.right}
              y={ty(m.y) - 5}
              textAnchor="end"
              fontSize={10}
              fill="var(--medra-amber-600)"
            >
              {m.label}
            </text>
          </g>
        ))}

        {series.map((s, i) => {
          const color = s.color ?? seriesPalette[i % seriesPalette.length]
          const linePts = s.fit ?? s.points
          return (
            <g key={s.label}>
              {s.fillArea && (
                <path
                  d={`${linePath(linePts)} L${tx(linePts[linePts.length - 1].x).toFixed(1)},${baselineY.toFixed(1)} L${tx(linePts[0].x).toFixed(1)},${baselineY.toFixed(1)} Z`}
                  fill={color}
                  opacity={0.1}
                />
              )}
              <path
                d={linePath(linePts)}
                fill="none"
                stroke={color}
                strokeWidth={1.75}
                strokeLinejoin="round"
              />
              {s.fit &&
                s.points.map((p) => (
                  <circle
                    key={`${p.x}:${p.y}`}
                    cx={tx(p.x)}
                    cy={ty(p.y)}
                    r={3}
                    fill="var(--surface-raised)"
                    stroke={color}
                    strokeWidth={1.5}
                  >
                    <title>{`${s.label} · ${xLabel} ${formatTick(p.x)} → ${formatTick(p.y)}`}</title>
                  </circle>
                ))}
            </g>
          )
        })}

        {annotations.map((a) => (
          <g key={a.label}>
            <line
              x1={tx(a.x)}
              x2={tx(a.x)}
              y1={ty(a.y) - 6}
              y2={ty(a.y) - 18}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <text
              x={tx(a.x)}
              y={ty(a.y) - 22}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="var(--text-secondary)"
            >
              {a.label}
            </text>
          </g>
        ))}

        <text
          x={M.left + plotW / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize={11}
          fill="var(--text-secondary)"
        >
          {xLabel}
        </text>
        <text
          x={12}
          y={M.top + plotH / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--text-secondary)"
          transform={`rotate(-90 12 ${M.top + plotH / 2})`}
        >
          {yLabel}
        </text>
      </svg>

      {!hideLegend && series.length > 1 && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-secondary">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: s.color ?? seriesPalette[i % seriesPalette.length] }}
              />
              {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}

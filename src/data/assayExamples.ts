/**
 * Demo datasets for the assay primitive gallery (/iteration).
 * Shaped like real output from the three seeded campaigns — EGFR SPR
 * kinetics and epitope binning, the KRAS G12C screen, and HER2 ADC
 * stability — so the primitives are exercised with realistic structure.
 */

import type { XYPoint } from '@/design-system'

/* ------------------------------------------------------------------ */
/* Dose–response (KRAS G12C · IC50 titration)                          */
/* ------------------------------------------------------------------ */

/** Four-parameter logistic: % inhibition at dose x given an IC50 and Hill slope. */
function fourPL(x: number, ic50: number, hill = 1, top = 100, bottom = 0): number {
  return bottom + (top - bottom) / (1 + (ic50 / x) ** hill)
}

function doseSeries(ic50: number, noise: number[]): {
  points: XYPoint[]
  fit: XYPoint[]
} {
  const doses = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000]
  const points = doses.map((x, i) => ({
    x,
    y: Math.max(0, Math.min(100, fourPL(x, ic50) + noise[i % noise.length])),
  }))
  const fit: XYPoint[] = []
  for (let e = -1; e <= 3.48; e += 0.08) {
    const x = 10 ** e
    fit.push({ x, y: fourPL(x, ic50) })
  }
  return { points, fit }
}

export const doseResponseExample = {
  series: [
    { label: 'MDR-1042', ...doseSeries(42, [0.3, -0.8, 1.1, -0.4, 1.9, -1.6, 0.7, -1.1, 0.4, -0.3]) },
    { label: 'MDR-1058', ...doseSeries(310, [-0.2, 0.5, -0.6, 1.3, -0.9, 1.7, -1.3, 0.8, -0.5, 0.2]) },
  ],
  params: [
    { name: 'IC50 (MDR-1042)', value: '42.3', unit: 'nM', ci: '38.1 – 47.0' },
    { name: 'IC50 (MDR-1058)', value: '312', unit: 'nM', ci: '281 – 347' },
    { name: 'Hill slope', value: '1.02', ci: '0.94 – 1.10' },
    { name: 'Top / Bottom', value: '98.7 / 0.4', unit: '%' },
  ],
  qc: [
    { label: 'Z′-factor', value: '0.71', status: 'pass', detail: 'threshold ≥ 0.5' },
    { label: 'Replicate CV', value: '4.2%', status: 'pass', detail: 'threshold ≤ 10%' },
    { label: 'Top plateau', value: 'anchored', status: 'pass' },
  ],
} as const

/* ------------------------------------------------------------------ */
/* SPR kinetics (EGFR lead triage)                                     */
/* ------------------------------------------------------------------ */

function sprTrace(rmax: number, kobs: number, koff: number): XYPoint[] {
  const pts: XYPoint[] = []
  const tAssocEnd = 300
  const plateau = rmax * (1 - Math.exp(-kobs * tAssocEnd))
  for (let t = 0; t <= 600; t += 15) {
    const y =
      t <= tAssocEnd
        ? rmax * (1 - Math.exp(-kobs * t))
        : plateau * Math.exp(-koff * (t - tAssocEnd))
    pts.push({ x: t, y: Math.round(y * 10) / 10 })
  }
  return pts
}

export const sprExample = {
  traces: [
    { label: '100 nM', points: sprTrace(158, 0.0135, 0.0042) },
    { label: '33 nM', points: sprTrace(112, 0.0088, 0.0042) },
    { label: '11 nM', points: sprTrace(62, 0.0061, 0.0042) },
  ],
  phases: [
    { from: 0, to: 300, label: 'Association' },
    { from: 300, to: 600, label: 'Dissociation' },
  ],
  params: [
    { name: 'kon', value: '3.1 × 10⁵', unit: 'M⁻¹s⁻¹', ci: '2.8 – 3.4 × 10⁵' },
    { name: 'koff', value: '4.2 × 10⁻³', unit: 's⁻¹', ci: '3.9 – 4.6 × 10⁻³' },
    { name: 'KD', value: '13.5', unit: 'nM', ci: '11.9 – 15.3' },
    { name: 'Rmax', value: '164', unit: 'RU' },
  ],
  qc: [
    { label: 'χ²/Rmax²', value: '0.008', status: 'pass', detail: 'threshold ≤ 0.05' },
    { label: 'Bulk shift', value: 'none', status: 'pass' },
    { label: 'Mass transport', value: 'suspected', status: 'warn', detail: 'kobs vs conc. sublinear' },
  ],
} as const

/* ------------------------------------------------------------------ */
/* Plate screen (KRAS G12C · primary binding screen)                   */
/* ------------------------------------------------------------------ */

function plateValues(): (number | null)[][] {
  const rows = 8
  const cols = 12
  const plate: (number | null)[][] = []
  for (let r = 0; r < rows; r++) {
    const row: (number | null)[] = []
    for (let c = 0; c < cols; c++) {
      if (c === 0) {
        row.push(90 + ((r * 17) % 8))
      } else if (c === cols - 1) {
        row.push(2 + ((r * 13) % 5))
      } else {
        const h = ((r * 12 + c) * 61) % 100
        row.push(h > 92 ? h : Math.round(h * 0.3))
      }
    }
    plate.push(row)
  }
  return plate
}

export const plateScreenExample = {
  values: plateValues(),
  qc: [
    { label: 'Z′-factor', value: '0.64', status: 'pass', detail: 'threshold ≥ 0.5' },
    { label: 'Plate CV', value: '6.8%', status: 'pass', detail: 'threshold ≤ 10%' },
    { label: 'Edge effect', value: 'not detected', status: 'pass' },
  ],
} as const

/* ------------------------------------------------------------------ */
/* Epitope binning (EGFR · classical sandwich)                         */
/* ------------------------------------------------------------------ */

const binningLabels = ['mAb-01', 'mAb-02', 'mAb-03', 'mAb-04', 'mAb-05', 'mAb-06']
const binAssignment = [1, 1, 2, 2, 2, 3]

export const binningExample = {
  labels: binningLabels,
  values: binningLabels.map((_, r) =>
    binningLabels.map((_, c) =>
      binAssignment[r] === binAssignment[c]
        ? r === c
          ? 1
          : 0.82
        : 0.06 + ((r * 7 + c * 3) % 10) / 100,
    ),
  ),
  bins: '3 bins — {01, 02} · {03, 04, 05} · {06}',
} as const

/* ------------------------------------------------------------------ */
/* Plasma stability (HER2 ADC · linker comparison)                     */
/* ------------------------------------------------------------------ */

export const stabilityExample = {
  series: [
    {
      label: 'Linker v3.1',
      points: [
        { x: 0, y: 100 },
        { x: 6, y: 96 },
        { x: 24, y: 88 },
        { x: 48, y: 79 },
        { x: 72, y: 71 },
        { x: 96, y: 64 },
      ],
    },
    {
      label: 'Linker v2.0',
      points: [
        { x: 0, y: 100 },
        { x: 6, y: 88 },
        { x: 24, y: 68 },
        { x: 48, y: 49 },
        { x: 72, y: 36 },
        { x: 96, y: 27 },
      ],
    },
  ],
  params: [
    { name: 't½ (v3.1)', value: '148', unit: 'h', ci: '132 – 167' },
    { name: 't½ (v2.0)', value: '46.8', unit: 'h', ci: '42.5 – 51.7' },
    { name: 'Decay model', value: 'mono-exponential' },
    { name: 'Ratio v3.1 / v2.0', value: '3.2×' },
  ],
}

/* ------------------------------------------------------------------ */
/* LC-MS payload release (HER2 ADC)                                    */
/* ------------------------------------------------------------------ */

function gaussian(x: number, mu: number, sigma: number, h: number): number {
  return h * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2))
}

export const lcmsExample = {
  trace: Array.from({ length: 101 }, (_, i) => {
    const x = i / 10
    const y =
      1.5 +
      gaussian(x, 3.5, 0.18, 41) +
      gaussian(x, 6.5, 0.22, 87) +
      gaussian(x, 7.1, 0.3, 9)
    return { x, y: Math.round(y * 10) / 10 }
  }),
  peaks: [
    { x: 3.5, y: 42.5, label: 'Free payload · 3.5 min' },
    { x: 6.5, y: 88.5, label: 'Intact conjugate · 6.5 min' },
  ],
  params: [
    { name: 'Payload release', value: '18.4', unit: '%', ci: '17.1 – 19.8' },
    { name: 'Free payload area', value: '1.86 × 10⁶', unit: 'counts·s' },
    { name: 'Conjugate area', value: '8.24 × 10⁶', unit: 'counts·s' },
    { name: 'RT drift vs ref', value: '+0.02', unit: 'min' },
  ],
} as const

/* ------------------------------------------------------------------ */
/* QC gate demo (failing plate)                                        */
/* ------------------------------------------------------------------ */

export const failingQCExample = [
  { label: 'Z′-factor', value: '0.31', status: 'fail', detail: 'threshold ≥ 0.5' },
  { label: 'Positive ctrl CV', value: '18.2%', status: 'fail', detail: 'threshold ≤ 10%' },
  { label: 'Edge effect', value: 'rows A, H elevated', status: 'warn' },
] as const

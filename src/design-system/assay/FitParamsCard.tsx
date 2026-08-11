'use client'

import { useState } from 'react'
import { Button } from '../primitives/Button'

export interface FitParam {
  /** Parameter name, e.g. 'IC50'. */
  name: string
  /** Formatted value, e.g. '42.3'. */
  value: string
  unit?: string
  /** Formatted confidence interval, e.g. '38.1 – 47.0'. */
  ci?: string
}

export interface FitParamsCardProps {
  /** e.g. '4PL fit · MDR-1042'. */
  title: string
  params: FitParam[]
  /** Fit-quality line, e.g. 'R² 0.998 · 10 points · 3 replicates'. */
  meta?: string
}

/**
 * Derived parameters in copyable, machine-readable form — the half of
 * every assay view built for the AI Experimentalist. Whatever a curve
 * shows a human, this card states as numbers the agent can cite.
 */
export function FitParamsCard({ title, params, meta }: FitParamsCardProps) {
  const [copied, setCopied] = useState(false)

  const copyJson = () => {
    const payload = Object.fromEntries(
      params.map((p) => [
        p.name,
        { value: p.value, ...(p.unit && { unit: p.unit }), ...(p.ci && { ci: p.ci }) },
      ]),
    )
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-md border border-edge bg-raised">
      <div className="flex items-center justify-between gap-3 border-b border-edge px-3 py-2">
        <span className="text-xs font-semibold text-secondary">{title}</span>
        <Button size="sm" variant="ghost" onClick={copyJson}>
          {copied ? 'Copied' : 'Copy JSON'}
        </Button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-3 py-2.5">
        {params.map((p) => (
          <div key={p.name} className="col-span-2 grid grid-cols-subgrid items-baseline">
            <dt className="text-sm text-secondary">{p.name}</dt>
            <dd className="font-mono text-sm text-primary">
              {p.value}
              {p.unit && <span className="text-tertiary"> {p.unit}</span>}
              {p.ci && (
                <span className="text-xs text-tertiary"> · 95% CI {p.ci}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {meta && (
        <p className="border-t border-edge px-3 py-2 text-xs text-tertiary">{meta}</p>
      )}
    </div>
  )
}

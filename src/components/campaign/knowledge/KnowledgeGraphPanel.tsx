'use client'

import { useMemo, useState } from 'react'
import { Card, Kicker } from '@/design-system'
import type { KnowledgeGraph, KnowledgeNode } from '@/data/types'
import { edgeStyle, nodeKindOrder, nodeStyle } from './graphTheme'
import { ResearchGraph } from './ResearchGraph'
import { KnowledgeNodeModal } from './KnowledgeNodeModal'

export function KnowledgeGraphPanel({ graph }: { graph: KnowledgeGraph }) {
  const [selected, setSelected] = useState<KnowledgeNode | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const n of graph.nodes) c[n.kind] = (c[n.kind] ?? 0) + 1
    return c
  }, [graph])

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-edge px-5 py-3">
        {nodeKindOrder.map((kind) => (
          <LegendDot
            key={kind}
            color={nodeStyle[kind].color}
            label={nodeStyle[kind].label}
            count={counts[kind] ?? 0}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-edge" aria-hidden />
        <LegendLine color={edgeStyle.cited.color} label={edgeStyle.cited.label} />
        <LegendLine
          color={edgeStyle.semantic.color}
          label={edgeStyle.semantic.label}
          dashed
        />
      </div>

      <div className="h-[560px] w-full">
        <ResearchGraph
          graph={graph}
          onSelectNode={setSelected}
          selectedId={selected?.id ?? null}
        />
      </div>

      <KnowledgeNodeModal node={selected} onClose={() => setSelected(null)} />
    </Card>
  )
}

function LegendDot({
  color,
  label,
  count,
}: {
  color: string
  label: string
  count: number
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <Kicker tone="default">
        {label} {count}
      </Kicker>
    </span>
  )
}

function LegendLine({
  color,
  label,
  dashed,
}: {
  color: string
  label: string
  dashed?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="18" height="6" aria-hidden>
        <line
          x1="0"
          y1="3"
          x2="18"
          y2="3"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '3 2' : undefined}
        />
      </svg>
      <Kicker tone="default">{label}</Kicker>
    </span>
  )
}

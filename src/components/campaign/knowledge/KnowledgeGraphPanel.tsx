'use client'

import { useMemo } from 'react'
import { Kicker } from '@/design-system'
import type { KnowledgeGraph, KnowledgeNode } from '@/data/types'
import { edgeStyle, nodeKindOrder, nodeStyle } from './graphTheme'
import { ResearchGraph } from './ResearchGraph'

/** Selection is controlled by the parent so the tree sidebar, graph, tabs,
 *  and node modal all agree on the active node. */
export function KnowledgeGraphPanel({
  graph,
  selected,
  onSelect,
}: {
  graph: KnowledgeGraph
  selected: KnowledgeNode | null
  onSelect: (node: KnowledgeNode) => void
}) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const n of graph.nodes) c[n.kind] = (c[n.kind] ?? 0) + 1
    return c
  }, [graph])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 w-full flex-1">
        <ResearchGraph
          graph={graph}
          onSelectNode={onSelect}
          selectedId={selected?.id ?? null}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-edge px-5 py-3">
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
    </div>
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

import type { KnowledgeEdgeKind, KnowledgeNodeKind } from '@/data/types'

/**
 * Data-visualization palette for the research graph. These are concrete hex
 * values (not semantic tokens) because SVG fills encode data categories — the
 * same reason a chart legend hard-codes its series colors.
 */
export const nodeStyle: Record<
  KnowledgeNodeKind,
  { color: string; label: string; radius: number }
> = {
  chunk: { color: '#3b82f6', label: 'Chunk', radius: 6 },
  memory: { color: '#8b5cf6', label: 'Memory', radius: 6 },
  result: { color: '#f59e0b', label: 'Result', radius: 6.5 },
  source: { color: '#10b981', label: 'Source', radius: 5 },
}

/** Order used in the legend and stat row. */
export const nodeKindOrder: KnowledgeNodeKind[] = [
  'chunk',
  'memory',
  'result',
  'source',
]

export const edgeStyle: Record<
  KnowledgeEdgeKind,
  { color: string; label: string }
> = {
  cited: { color: '#f59e0b', label: 'Cited source' },
  semantic: { color: '#c9c6bf', label: 'Semantic match' },
}

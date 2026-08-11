/**
 * Domain types for placeholder data.
 * When a real API exists, these become the contract for its client —
 * pages and components only ever see these shapes.
 */

export type CampaignStatus = 'planned' | 'active' | 'paused' | 'completed'

export type GoalStatus = 'planned' | 'active' | 'completed'

export type AssayStatus = 'draft' | 'ready' | 'running' | 'completed'

export interface Assay {
  id: string
  name: string
  status: AssayStatus
  versions: number
  runCount: number
  /** Experiment id shown in the assay row, e.g. 'exp-egfr-spr'. */
  experimentId: string
}

export interface CampaignGoal {
  id: string
  /** Display code, e.g. 'G01'. */
  code: string
  title: string
  description: string
  status: GoalStatus
  /** Display date or null when unset ('Target —'). */
  targetDate: string | null
  assays: Assay[]
}

export interface CampaignFile {
  id: string
  name: string
  /** Short uppercase type label, e.g. 'MD', 'CSV', 'PDF'. */
  type: string
  /** Human-readable size, e.g. '994 B'. */
  size: string
  indexed: boolean
  /** Folders group files visually in the knowledge base; they skip indexing. */
  isFolder?: boolean
}

export interface PlanVariantStage {
  id: string
  /** Node labels for this pipeline column; more than one means the steps run in parallel. */
  steps: string[]
}

/** An alternative campaign design proposed by the AI Experimentalist,
 *  optimized along a single axis (speed, cost, …). */
export interface PlanVariant {
  id: string
  /** One-word optimization axis used as the tab label, e.g. 'Speed'. */
  axis: string
  title: string
  /** One-sentence framing of the trade-off this variant makes. */
  summary: string
  /** Narrative of how the campaign gates are sequenced under this variant. */
  goals: string
  stages: PlanVariantStage[]
}

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  /** Relative labels keep placeholder data simple; swap for ISO dates with a real API. */
  createdAgo: string
  updatedAgo: string
  /** Display dates for the hero metadata row, e.g. '5/4/2026'. */
  startDate: string
  targetDate: string
  /** Scientist owning the campaign, or null when unassigned. */
  lead: string | null
  versions: number
  objective: string | null
  progressPercent: number
  goals: CampaignGoal[]
  assayCount: number
  files: CampaignFile[]
  /** Alternative campaign designs the Experimentalist can propose; empty when none drafted. */
  planVariants: PlanVariant[]
}

/**
 * Campaign research knowledge graph.
 * Nodes are the four things that accumulate around a campaign — the indexed
 * chunks of uploaded documents, the AI Experimentalist's memories, the
 * results produced by runs, and the external sources cited along the way.
 * Edges connect them by shared context: a hard "cited" link (a chunk or
 * result references a source) or a softer "semantic" match.
 */
export type KnowledgeNodeKind = 'chunk' | 'memory' | 'result' | 'source'

export interface KnowledgeNode {
  id: string
  kind: KnowledgeNodeKind
  /** Heading shown in the node label and modal title. */
  title: string
  /** One-line gloss under the title. */
  summary: string
  /** Long body — abstract for sources, note body for memories, etc. */
  detail: string
  /** Relative label, e.g. 'Jun 17'. */
  updatedAgo: string
  /** Where the node came from — document name, run id, chat title. */
  origin: string
  /** Sources only: formatted citation, e.g. a DOI. */
  citation?: string
  /** Semantic relevance to the campaign, 0–1, or null when not scored. */
  match?: number | null
}

export type KnowledgeEdgeKind = 'cited' | 'semantic'

export interface KnowledgeEdge {
  /** Node id. */
  source: string
  /** Node id. */
  target: string
  kind: KnowledgeEdgeKind
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  /** Rich block rendered below the message text, e.g. the plan-variants explorer. */
  attachment?: 'plan-variants'
  /** Names of files attached to the message via the composer. */
  attachments?: string[]
}

export interface Chat {
  id: string
  title: string
  /** Relative label, e.g. '3h ago'. */
  updatedAgo: string
  /** Display name of whoever last touched the chat. */
  author: string
  messages: ChatMessage[]
}

export interface Run {
  id: string
  name: string
  campaignName: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  startedAgo: string
  duration: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  location: string
  quantity: string
  status: 'in-stock' | 'low' | 'out-of-stock'
}

export interface User {
  name: string
  role: string
}

export interface Organization {
  name: string
  plan: string
}

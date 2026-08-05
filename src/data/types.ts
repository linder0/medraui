/**
 * Domain types for placeholder data.
 * When a real API exists, these become the contract for its client —
 * pages and components only ever see these shapes.
 */

export type CampaignStatus = 'planned' | 'active' | 'paused' | 'completed'

export interface CampaignGoal {
  id: string
  title: string
  status: 'active' | 'completed'
}

export interface CampaignFile {
  id: string
  name: string
  /** Short uppercase type label, e.g. 'MD', 'CSV', 'PDF'. */
  type: string
  /** Human-readable size, e.g. '994 B'. */
  size: string
  indexed: boolean
}

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  /** Relative labels keep placeholder data simple; swap for ISO dates with a real API. */
  createdAgo: string
  updatedAgo: string
  objective: string | null
  progressPercent: number
  goals: CampaignGoal[]
  assayCount: number
  files: CampaignFile[]
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
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

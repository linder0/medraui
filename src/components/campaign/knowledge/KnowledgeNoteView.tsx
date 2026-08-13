import type { ReactNode } from 'react'
import { BookOpen, Brain, FileText, FlaskConical } from 'lucide-react'
import { Badge, Kicker } from '@/design-system'
import type { KnowledgeNode, KnowledgeNodeKind } from '@/data/types'
import { nodeStyle } from './graphTheme'

const kindMeta: Record<
  KnowledgeNodeKind,
  { icon: ReactNode; noun: string; bodyLabel: string }
> = {
  source: {
    icon: <BookOpen className="size-4" strokeWidth={1.75} />,
    noun: 'Source',
    bodyLabel: 'Abstract',
  },
  chunk: {
    icon: <FileText className="size-4" strokeWidth={1.75} />,
    noun: 'Document',
    bodyLabel: 'Excerpt',
  },
  memory: {
    icon: <Brain className="size-4" strokeWidth={1.75} />,
    noun: 'Memory',
    bodyLabel: 'Note',
  },
  result: {
    icon: <FlaskConical className="size-4" strokeWidth={1.75} />,
    noun: 'Result',
    bodyLabel: 'Summary',
  },
}

function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-edge bg-panel p-3">
      <Kicker>{label}</Kicker>
      <p className="mt-1 text-sm text-primary">{children}</p>
    </div>
  )
}

/** Obsidian-style reading view for a knowledge node opened as a tab. */
export function KnowledgeNoteView({ node }: { node: KnowledgeNode }) {
  const meta = kindMeta[node.kind]

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <article className="mx-auto max-w-2xl px-8 py-10">
        <div className="flex items-center gap-2">
          <span
            className="shrink-0"
            style={{ color: nodeStyle[node.kind].color }}
          >
            {meta.icon}
          </span>
          <span className="text-sm font-semibold text-primary">
            {meta.noun}
          </span>
          <span className="text-sm text-tertiary">{node.updatedAgo}</span>
        </div>

        <h1 className="mt-4 text-2xl leading-snug font-semibold tracking-tight text-primary">
          {node.title}
        </h1>
        {node.summary !== node.title && (
          <p className="mt-2 text-sm text-secondary">{node.summary}</p>
        )}

        <div className="mt-8">
          <Kicker>{meta.bodyLabel}</Kicker>
          <p className="mt-2 text-[15px] leading-relaxed text-primary">
            {node.detail}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <MetaCell label="Type">{meta.noun}</MetaCell>
          <MetaCell label="Updated">{node.updatedAgo}</MetaCell>
          <MetaCell label="Origin">{node.origin}</MetaCell>
          <MetaCell label="Match">
            {node.match == null ? (
              '—'
            ) : (
              <Badge tone={node.match >= 0.6 ? 'success' : 'warning'}>
                {Math.round(node.match * 100)}%
              </Badge>
            )}
          </MetaCell>
        </div>

        {node.citation && (
          <div className="mt-8">
            <Kicker>Citation</Kicker>
            <p className="mt-2 rounded-md border border-edge bg-panel p-3 font-mono text-xs text-secondary">
              {node.citation}
            </p>
          </div>
        )}
      </article>
    </div>
  )
}

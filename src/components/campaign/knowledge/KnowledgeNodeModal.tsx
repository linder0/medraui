'use client'

import type { ReactNode } from 'react'
import {
  BookOpen,
  Brain,
  ExternalLink,
  FileText,
  FlaskConical,
  Trash2,
} from 'lucide-react'
import { Badge, Button, Kicker, Modal } from '@/design-system'
import type { KnowledgeNode, KnowledgeNodeKind } from '@/data/types'
import { nodeStyle } from './graphTheme'

const kindMeta: Record<
  KnowledgeNodeKind,
  { icon: ReactNode; noun: string; bodyLabel: string; primaryAction: string }
> = {
  source: {
    icon: <BookOpen className="size-5" strokeWidth={1.75} />,
    noun: 'Source',
    bodyLabel: 'Abstract',
    primaryAction: 'Open source',
  },
  chunk: {
    icon: <FileText className="size-5" strokeWidth={1.75} />,
    noun: 'Document',
    bodyLabel: 'Excerpt',
    primaryAction: 'Open document',
  },
  memory: {
    icon: <Brain className="size-5" strokeWidth={1.75} />,
    noun: 'Memory',
    bodyLabel: 'Note',
    primaryAction: 'Open in chat',
  },
  result: {
    icon: <FlaskConical className="size-5" strokeWidth={1.75} />,
    noun: 'Result',
    bodyLabel: 'Summary',
    primaryAction: 'Open result',
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

export function KnowledgeNodeModal({
  node,
  onClose,
}: {
  node: KnowledgeNode | null
  onClose: () => void
}) {
  const meta = node ? kindMeta[node.kind] : null

  return (
    <Modal open={node != null} onClose={onClose} label={node?.title}>
      {node && meta && (
        <>
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 pr-12">
            <div className="flex items-center gap-2">
              <span
                className="shrink-0"
                style={{ color: nodeStyle[node.kind].color }}
              >
                {meta.icon}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">
                  {meta.noun}
                </span>
                <span className="text-sm text-tertiary">{node.updatedAgo}</span>
              </div>
            </div>

            <h2 className="mt-4 text-xl leading-snug font-semibold tracking-tight text-primary">
              {node.title}
            </h2>
            {node.summary !== node.title && (
              <p className="mt-1.5 text-sm text-secondary">{node.summary}</p>
            )}

            <div className="mt-5">
              <Kicker>{meta.bodyLabel}</Kicker>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                {node.detail}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
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
              <div className="mt-5">
                <Kicker>Citation</Kicker>
                <p className="mt-1.5 rounded-md border border-edge bg-panel p-3 font-mono text-xs text-secondary">
                  {node.citation}
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-edge bg-panel px-6 py-3">
            <Button
              leadingIcon={<ExternalLink className="size-4" strokeWidth={1.75} />}
            >
              {meta.primaryAction}
            </Button>
            <Button
              variant="ghost"
              className="text-danger hover:bg-danger-soft hover:text-danger"
              leadingIcon={<Trash2 className="size-4" strokeWidth={1.75} />}
            >
              Delete {meta.noun.toLowerCase()}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

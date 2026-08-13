'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowDownAZ,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FolderPlus,
  PanelLeft,
  Search,
  Settings,
  SquarePen,
  Upload,
  X,
} from 'lucide-react'
import { IconButton } from '@/design-system'
import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeNodeKind,
} from '@/data/types'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/springs'
import { nodeKindOrder, nodeStyle } from './graphTheme'

const folderLabel: Record<KnowledgeNodeKind, string> = {
  chunk: 'Documents',
  memory: 'Memories',
  result: 'Results',
  source: 'Sources',
}

/**
 * Obsidian-style vault explorer for campaign knowledge: icon toolbar on top,
 * the campaign as the vault root, one collapsible folder per node kind, and
 * plain text rows for the notes themselves. Clicking a row selects the node
 * in the graph and opens its detail modal.
 */
export function KnowledgeTreeSidebar({
  backHref,
  vaultName,
  graph,
  selectedId,
  onSelect,
  onCollapse,
}: {
  /** Campaign overview route — the pane owns the "back" navigation. */
  backHref: string
  vaultName: string
  graph: KnowledgeGraph
  selectedId: string | null
  onSelect: (node: KnowledgeNode) => void
  /** Collapses the pane; the toggle then reappears in the tab strip. */
  onCollapse: () => void
}) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [rootOpen, setRootOpen] = useState(true)
  const [alphaSort, setAlphaSort] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<KnowledgeNodeKind>>(
    () => new Set(),
  )

  const byKind = useMemo(() => {
    const groups = new Map<KnowledgeNodeKind, KnowledgeNode[]>()
    for (const kind of nodeKindOrder) groups.set(kind, [])
    for (const node of graph.nodes) groups.get(node.kind)?.push(node)
    return groups
  }, [graph])

  const normalized = query.trim().toLowerCase()
  const allCollapsed = collapsed.size === nodeKindOrder.length

  const toggleFolder = (kind: KnowledgeNodeKind) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })
  }

  const toggleCollapseAll = () => {
    setCollapsed(allCollapsed ? new Set() : new Set(nodeKindOrder))
    if (allCollapsed) setRootOpen(true)
  }

  const rowsFor = (kind: KnowledgeNodeKind) => {
    let rows = byKind.get(kind) ?? []
    if (normalized) {
      rows = rows.filter((node) =>
        node.title.toLowerCase().includes(normalized),
      )
    }
    if (alphaSort) {
      rows = [...rows].sort((a, b) => a.title.localeCompare(b.title))
    }
    return rows
  }

  const nothingMatches =
    normalized && nodeKindOrder.every((kind) => rowsFor(kind).length === 0)

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-edge bg-panel">
      {/* The back row is h-13 to line up with the central pane's tab strip
          and the chat pane header, keeping that border continuous. */}
      <div className="flex h-13 shrink-0 items-center border-b border-edge px-3">
        <Link
          href={backHref}
          className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="truncate">Back to overview</span>
        </Link>
      </div>

      <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-edge px-1.5">
        <IconButton
          label="Collapse knowledge tree"
          size="sm"
          onClick={onCollapse}
          icon={<PanelLeft className="size-4" strokeWidth={1.75} />}
        />
        <span className="mx-0.5 h-4 w-px shrink-0 bg-edge" aria-hidden />
        {!searchOpen && (
          <>
            <IconButton
              label="New note"
              size="sm"
              icon={<SquarePen className="size-4" strokeWidth={1.75} />}
            />
            <IconButton
              label="New folder"
              size="sm"
              icon={<FolderPlus className="size-4" strokeWidth={1.75} />}
            />
            <IconButton
              label="Upload documents"
              size="sm"
              icon={<Upload className="size-4" strokeWidth={1.75} />}
            />
            <IconButton
              label="Sort A to Z"
              size="sm"
              onClick={() => setAlphaSort((value) => !value)}
              className={cn(alphaSort && 'bg-sunken text-primary')}
              icon={<ArrowDownAZ className="size-4" strokeWidth={1.75} />}
            />
            <IconButton
              label={allCollapsed ? 'Expand all' : 'Collapse all'}
              size="sm"
              onClick={toggleCollapseAll}
              icon={
                allCollapsed ? (
                  <ChevronsUpDown className="size-4" strokeWidth={1.75} />
                ) : (
                  <ChevronsDownUp className="size-4" strokeWidth={1.75} />
                )
              }
            />
          </>
        )}

        {/* The search icon expands into a pill input that takes over the
            rest of the header row while active. */}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <AnimatePresence initial={false} mode="wait">
            {searchOpen ? (
              <motion.div
                key="search-pill"
                initial={{ width: 28, opacity: 0.4 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{
                  width: 28,
                  opacity: 0,
                  transition: spring.moderate.exit,
                }}
                transition={spring.moderate}
                /* p-px leaves room for the 1px focus outline, which would
                   otherwise be clipped by overflow-hidden. */
                className="overflow-hidden p-px"
              >
                <div className="flex h-7 items-center gap-1.5 rounded-md border border-edge-strong bg-raised pl-2.5 pr-1 shadow-xs transition-colors focus-within:border-primary focus-within:outline-1 focus-within:outline-primary">
                  <Search
                    className="size-3.5 shrink-0 text-tertiary"
                    strokeWidth={1.75}
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeSearch()
                    }}
                    placeholder="Filter..."
                    className="min-w-0 flex-1 bg-transparent text-xs text-primary outline-none placeholder:text-tertiary"
                  />
                  <button
                    type="button"
                    aria-label="Close filter"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={closeSearch}
                    className="flex size-5 shrink-0 items-center justify-center rounded-sm text-tertiary transition-colors hover:bg-sunken hover:text-primary"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <IconButton
                key="search-icon"
                label="Filter knowledge"
                size="sm"
                onClick={() => setSearchOpen(true)}
                icon={<Search className="size-4" strokeWidth={1.75} />}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        <button
          type="button"
          onClick={() => setRootOpen((value) => !value)}
          className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-xs font-semibold text-primary transition-colors hover:bg-sunken"
        >
          {rootOpen ? (
            <ChevronDown
              className="size-3.5 shrink-0 text-tertiary"
              strokeWidth={1.75}
            />
          ) : (
            <ChevronRight
              className="size-3.5 shrink-0 text-tertiary"
              strokeWidth={1.75}
            />
          )}
          <span className="truncate">{vaultName}</span>
        </button>

        {rootOpen &&
          nodeKindOrder.map((kind) => {
            const rows = rowsFor(kind)
            if (normalized && rows.length === 0) return null
            // Filtering auto-expands so matches are never hidden.
            const isOpen = normalized ? true : !collapsed.has(kind)

            return (
              <div key={kind}>
                <button
                  type="button"
                  onClick={() => toggleFolder(kind)}
                  className="flex w-full items-center gap-1 rounded-md py-1 pl-4 pr-1.5 text-xs font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
                >
                  {isOpen ? (
                    <ChevronDown
                      className="size-3.5 shrink-0 text-tertiary"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <ChevronRight
                      className="size-3.5 shrink-0 text-tertiary"
                      strokeWidth={1.75}
                    />
                  )}
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: nodeStyle[kind].color }}
                    aria-hidden
                  />
                  <span className="flex-1 truncate text-left">
                    {folderLabel[kind]}
                  </span>
                  <span className="shrink-0 text-2xs text-tertiary">
                    {rows.length}
                  </span>
                </button>

                {isOpen &&
                  rows.map((node) => {
                    const active = node.id === selectedId
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => onSelect(node)}
                        title={node.title}
                        className={cn(
                          'flex w-full items-center rounded-md py-1 pl-9 pr-1.5 text-left text-xs transition-colors',
                          active
                            ? 'bg-sunken font-medium text-primary'
                            : 'text-secondary hover:bg-sunken hover:text-primary',
                        )}
                      >
                        <span className="truncate">{node.title}</span>
                      </button>
                    )
                  })}
              </div>
            )
          })}

        {nothingMatches && (
          <p className="px-1.5 py-3 text-xs text-tertiary">
            No knowledge matches “{query.trim()}”.
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-edge px-3 py-2">
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-tertiary"
          strokeWidth={1.75}
        />
        <span className="flex-1 truncate text-xs font-medium text-secondary">
          Knowledge base
        </span>
        <IconButton
          label="Knowledge settings"
          size="sm"
          icon={<Settings className="size-3.5" strokeWidth={1.75} />}
        />
      </div>
    </aside>
  )
}

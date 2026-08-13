'use client'

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  MessagesSquare,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Plus,
  Waypoints,
  X,
} from 'lucide-react'
import { Button, IconButton } from '@/design-system'
import { KnowledgeGraphPanel } from '@/components/campaign/knowledge/KnowledgeGraphPanel'
import { KnowledgeNoteView } from '@/components/campaign/knowledge/KnowledgeNoteView'
import { KnowledgeTreeSidebar } from '@/components/campaign/knowledge/KnowledgeTreeSidebar'
import { ChatConversation } from '@/components/experimentalist/ChatConversation'
import { ExperimentalistOrb } from '@/components/experimentalist/ExperimentalistOrb'
import { useExperimentalist } from '@/components/experimentalist/ExperimentalistContext'
import { getKnowledgeGraph } from '@/data/knowledge'
import type {
  Campaign,
  ChatMessage,
  KnowledgeNode,
  KnowledgeNodeKind,
} from '@/data/types'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/springs'

const GRAPH_TAB = 'graph'

const CHAT_MIN_WIDTH = 300
const CHAT_MAX_WIDTH = 640
const CHAT_DEFAULT_WIDTH = 384

/**
 * A workspace tab, like Obsidian's: it carries its own navigation history so
 * back/forward can retrace notes that were opened in place. An empty
 * "New tab" is `{ history: [], index: -1 }`.
 */
interface NoteTab {
  id: string
  history: KnowledgeNode[]
  index: number
}

/** The note currently shown in a tab (null for an empty "New tab"). */
function tabNode(tab: NoteTab): KnowledgeNode | null {
  return tab.history[tab.index] ?? null
}

// Random suffix so ids stay unique even when Fast Refresh re-evaluates the
// module (resetting the counter) while existing tabs survive in state.
let tabSeq = 0
function nextTabId() {
  tabSeq += 1
  return `tab-${tabSeq}-${Math.random().toString(36).slice(2, 8)}`
}

const tabIcon: Record<KnowledgeNodeKind, ReactNode> = {
  chunk: <FileText className="size-3.5 shrink-0" strokeWidth={1.75} />,
  memory: <Brain className="size-3.5 shrink-0" strokeWidth={1.75} />,
  result: <FlaskConical className="size-3.5 shrink-0" strokeWidth={1.75} />,
  source: <BookOpen className="size-3.5 shrink-0" strokeWidth={1.75} />,
}

function WorkspaceTab({
  icon,
  label,
  active,
  onSelect,
  onClose,
}: {
  icon: ReactNode
  label: string
  active: boolean
  onSelect: () => void
  onClose?: () => void
}) {
  // div[role=button] because the close control is itself a button and
  // buttons can't nest.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      title={label}
      className={cn(
        // Tabs hug their label (capped at max-w-44); once the strip fills
        // up they shrink to make room and the labels truncate.
        'flex h-8 min-w-0 max-w-44 shrink cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs transition-colors',
        active
          ? 'border-edge-strong bg-raised font-medium text-primary shadow-xs'
          : 'border-transparent text-secondary hover:bg-sunken hover:text-primary',
      )}
    >
      <span className="shrink-0 text-tertiary">{icon}</span>
      <span className="truncate">{label}</span>
      {onClose && (
        <button
          type="button"
          aria-label={`Close ${label}`}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          className="-mr-1 ml-0.5 shrink-0 rounded-sm p-0.5 text-tertiary transition-colors hover:bg-sunken hover:text-primary"
        >
          <X className="size-3" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

/**
 * Knowledge is a full workspace pane (tree left, tabbed graph/notes center,
 * chat right) rather than a scrolling document page. Like the chat overlay,
 * it pins itself to the campaign layout's relative container so it covers
 * the campaign panel; the z-index keeps it under the Experimentalist
 * overlay (z-40).
 */
export function CampaignKnowledge({ campaign }: { campaign: Campaign }) {
  const { openExperimentalist } = useExperimentalist()
  // Memoized so the force simulation isn't restarted by unrelated re-renders.
  const graph = useMemo(() => getKnowledgeGraph(campaign.id), [campaign.id])
  const [treeOpen, setTreeOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  /** Highlighted node — shared by the tree, the graph, and the tabs. */
  const [selected, setSelected] = useState<KnowledgeNode | null>(null)
  const [tabs, setTabs] = useState<NoteTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>(GRAPH_TAB)
  /** The note tab that opens from the graph reuse, so clicking around the
      graph doesn't spawn a tab per node. */
  const lastNoteTabRef = useRef<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatWidth, setChatWidth] = useState(CHAT_DEFAULT_WIDTH)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef(false)
  /** Swallows the click that trails a tab drag, so dragging never selects. */
  const tabDragRef = useRef(false)
  /** Tab drag-and-drop: the dragged tab stays put and a divider highlights
      the insertion gap, VS Code style. */
  const [dragTabId, setDragTabId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const tabRefs = useRef(new Map<string, HTMLDivElement>())
  const pendingDragRef = useRef<{ id: string; startX: number } | null>(null)

  const onResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    resizingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onResizeMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return
    const rect = workspaceRef.current?.getBoundingClientRect()
    if (!rect) return
    // The chat panel hugs the right edge, so its width is the distance from
    // the pointer to that edge.
    const width = Math.min(
      CHAT_MAX_WIDTH,
      Math.max(CHAT_MIN_WIDTH, rect.right - event.clientX),
    )
    setChatWidth(width)
  }

  const onResizeEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    resizingRef.current = false
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* pointer already released */
    }
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null
  const activeDoc = activeTab ? tabNode(activeTab) : null

  /**
   * Obsidian-style open: if the note is already showing somewhere, jump to
   * it; otherwise it replaces the active tab (recorded in the tab's history
   * so back/forward can retrace). The graph tab can't be replaced, so
   * opening from there reuses the last note tab — a tab is only spawned
   * when none exists yet.
   */
  const openTab = (node: KnowledgeNode) => {
    setSelected(node)
    const existing = tabs.find((tab) => tabNode(tab)?.id === node.id)
    if (existing) {
      setActiveTabId(existing.id)
      lastNoteTabRef.current = existing.id
      return
    }
    const target =
      activeTab ??
      tabs.find((tab) => tab.id === lastNoteTabRef.current) ??
      null
    if (target) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== target.id) return tab
          // Opening while mid-history drops the forward entries, like a
          // browser would.
          const history = [...tab.history.slice(0, tab.index + 1), node]
          return { ...tab, history, index: history.length - 1 }
        }),
      )
      setActiveTabId(target.id)
      lastNoteTabRef.current = target.id
      return
    }
    const tab = { id: nextTabId(), history: [node], index: 0 }
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
    lastNoteTabRef.current = tab.id
  }

  /** Explicit "+" — the only way a second tab gets created. */
  const openEmptyTab = () => {
    const tab = { id: nextTabId(), history: [], index: -1 }
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
    lastNoteTabRef.current = tab.id
  }

  /** Insertion gap for the pointer: how many tab midpoints it has passed. */
  const computeDropIndex = (clientX: number) => {
    let index = 0
    for (const tab of tabs) {
      const el = tabRefs.current.get(tab.id)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (clientX > rect.left + rect.width / 2) index += 1
    }
    return index
  }

  const moveTab = (id: string, to: number) => {
    setTabs((prev) => {
      const from = prev.findIndex((tab) => tab.id === id)
      if (from === -1) return prev
      // Dropping past the original slot: account for the removed tab.
      const insert = from < to ? to - 1 : to
      if (insert === from) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(insert, 0, moved!)
      return next
    })
  }

  const endTabDrag = () => {
    pendingDragRef.current = null
    if (dragTabId == null) return
    if (dropIndex != null) moveTab(dragTabId, dropIndex)
    setDragTabId(null)
    setDropIndex(null)
    // Cleared on the next tick so the drag's trailing click is ignored but
    // real clicks still work.
    window.setTimeout(() => {
      tabDragRef.current = false
    }, 0)
  }

  const canGoBack = activeTab != null && activeTab.index > 0
  const canGoForward =
    activeTab != null && activeTab.index < activeTab.history.length - 1

  const stepHistory = (delta: -1 | 1) => {
    if (!activeTab) return
    const index = activeTab.index + delta
    const node = activeTab.history[index]
    if (!node) return
    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTab.id ? { ...tab, index } : tab)),
    )
    setSelected(node)
  }

  const closeTab = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id)
    const next = tabs.filter((tab) => tab.id !== id)
    setTabs(next)
    if (activeTabId === id) {
      // Fall back to the neighboring tab, then the graph.
      setActiveTabId((next[index - 1] ?? next[index])?.id ?? GRAPH_TAB)
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-app">
      <div ref={workspaceRef} className="flex min-h-0 flex-1">
        <AnimatePresence initial={false}>
          {treeOpen && (
            <motion.div
              key="knowledge-tree"
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              exit={{ width: 0, transition: spring.moderate.exit }}
              transition={spring.moderate}
              className="shrink-0 overflow-hidden"
            >
              <KnowledgeTreeSidebar
                backHref={`/campaigns/${campaign.id}`}
                vaultName={campaign.name}
                graph={graph}
                selectedId={selected?.id ?? null}
                onSelect={openTab}
                onCollapse={() => setTreeOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex min-w-0 flex-1 flex-col">
          {/* Obsidian-style tab strip: the taller row matches the chat pane
              header, and the tabs sit as smaller centered pills with space
              above. When the tree pane is collapsed, its toggle docks here. */}
          <div className="flex h-13 shrink-0 items-center gap-1 overflow-hidden border-b border-edge bg-panel px-2">
            <AnimatePresence initial={false}>
              {!treeOpen && (
                <motion.div
                  key="tree-toggle"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: spring.moderate.exit,
                  }}
                  transition={spring.moderate}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="flex items-center gap-0.5">
                    {/* The back link lives in the tree pane, so it docks here
                        alongside the toggle while the pane is collapsed. */}
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      aria-label="Back to overview"
                      title="Back to overview"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-sunken hover:text-primary"
                    >
                      <ArrowLeft className="size-4" strokeWidth={1.75} />
                    </Link>
                    <IconButton
                      label="Show knowledge tree"
                      size="sm"
                      onClick={() => setTreeOpen(true)}
                      icon={<PanelLeft className="size-4" strokeWidth={1.75} />}
                    />
                    <span
                      className="mx-1 h-4 w-px shrink-0 bg-edge"
                      aria-hidden
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <WorkspaceTab
              icon={<Waypoints className="size-3.5" strokeWidth={1.75} />}
              label="Graph view"
              active={activeTabId === GRAPH_TAB}
              onSelect={() => setActiveTabId(GRAPH_TAB)}
            />
            {tabs.map((tab, index) => {
              const node = tabNode(tab)
              // Obsidian-style dividers: a tick between adjacent tabs, hidden
              // on either side of the active pill so it reads as one shape.
              // While dragging, the tick at the insertion gap becomes the
              // drop indicator.
              const prevId = index === 0 ? GRAPH_TAB : tabs[index - 1]!.id
              const dividerHidden =
                tab.id === activeTabId || prevId === activeTabId
              const dropTarget = dragTabId != null && dropIndex === index
              return (
                <div
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el)
                    else tabRefs.current.delete(tab.id)
                  }}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return
                    pendingDragRef.current = {
                      id: tab.id,
                      startX: event.clientX,
                    }
                  }}
                  onPointerMove={(event) => {
                    const pending = pendingDragRef.current
                    if (!pending) return
                    if (dragTabId == null) {
                      // Small threshold so plain clicks never start a drag.
                      if (Math.abs(event.clientX - pending.startX) < 4) return
                      setDragTabId(pending.id)
                      tabDragRef.current = true
                      event.currentTarget.setPointerCapture(event.pointerId)
                    }
                    setDropIndex(computeDropIndex(event.clientX))
                  }}
                  onPointerUp={endTabDrag}
                  onPointerCancel={endTabDrag}
                  className={cn(
                    'flex min-w-0 shrink touch-none items-center gap-1',
                    dragTabId === tab.id && 'opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'h-4 w-px shrink-0 rounded-full bg-edge transition-all',
                      dividerHidden && !dropTarget && 'opacity-0',
                      dropTarget && 'h-7 w-0.5 bg-action',
                    )}
                    aria-hidden
                  />
                  <WorkspaceTab
                    icon={
                      node ? (
                        tabIcon[node.kind]
                      ) : (
                        <FileText
                          className="size-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                      )
                    }
                    label={node?.title ?? 'New tab'}
                    active={tab.id === activeTabId}
                    onSelect={() => {
                      if (tabDragRef.current) return
                      setActiveTabId(tab.id)
                      lastNoteTabRef.current = tab.id
                      if (node) setSelected(node)
                    }}
                    onClose={() => {
                      if (tabDragRef.current) return
                      closeTab(tab.id)
                    }}
                  />
                </div>
              )
            })}
            {/* Trailing drop slot: dropping after the last tab. */}
            <span
              className={cn(
                'h-4 w-px shrink-0 rounded-full bg-edge opacity-0 transition-all',
                dragTabId != null &&
                  dropIndex === tabs.length &&
                  'h-7 w-0.5 bg-action opacity-100',
              )}
              aria-hidden
            />
            <IconButton
              label="New tab"
              size="sm"
              className="shrink-0"
              onClick={openEmptyTab}
              icon={<Plus className="size-4" strokeWidth={1.75} />}
            />

            {/* When the chat pane is collapsed, its toggle docks at the right
                end of the tab strip — mirroring the tree toggle on the left. */}
            <AnimatePresence initial={false}>
              {!chatOpen && (
                <motion.div
                  key="chat-toggle"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: spring.moderate.exit,
                  }}
                  transition={spring.moderate}
                  className="ml-auto shrink-0 overflow-hidden"
                >
                  <div className="flex items-center">
                    <span
                      className="mx-1 h-4 w-px shrink-0 bg-edge"
                      aria-hidden
                    />
                    <IconButton
                      label="Show chat panel"
                      size="sm"
                      onClick={() => setChatOpen(true)}
                      icon={
                        <PanelRight className="size-4" strokeWidth={1.75} />
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Obsidian-style view header: back/forward, centered view title. */}
          <div className="relative flex h-9 shrink-0 items-center justify-between border-b border-edge px-2">
            <div className="flex items-center gap-0.5">
              <IconButton
                label="Back"
                size="sm"
                disabled={!canGoBack}
                onClick={() => stepHistory(-1)}
                icon={<ChevronLeft className="size-4" strokeWidth={1.75} />}
              />
              <IconButton
                label="Forward"
                size="sm"
                disabled={!canGoForward}
                onClick={() => stepHistory(1)}
                icon={<ChevronRight className="size-4" strokeWidth={1.75} />}
              />
            </div>
            <span className="pointer-events-none absolute inset-x-12 truncate text-center text-xs font-medium text-secondary">
              {activeTabId === GRAPH_TAB
                ? 'Graph view'
                : (activeDoc?.title ?? 'New tab')}
            </span>
            <IconButton
              label="View options"
              size="sm"
              icon={<MoreHorizontal className="size-4" strokeWidth={1.75} />}
            />
          </div>

          {/* The graph stays mounted while a note tab is open so the force
              layout doesn't restart on every tab switch. */}
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              activeTabId !== GRAPH_TAB && 'hidden',
            )}
          >
            <KnowledgeGraphPanel
              graph={graph}
              selected={selected}
              onSelect={openTab}
            />
          </div>
          {activeDoc && <KnowledgeNoteView node={activeDoc} />}
          {activeTabId !== GRAPH_TAB && !activeDoc && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-8 text-center">
              <p className="text-lg font-medium text-secondary">New tab</p>
              <p className="text-sm text-tertiary">
                Pick a note from the knowledge tree to open it here.
              </p>
            </div>
          )}
        </section>

        {chatOpen && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat panel"
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            className="relative z-10 -mr-1 w-1 shrink-0 cursor-col-resize touch-none transition-colors hover:bg-edge-strong active:bg-edge-strong"
          />
        )}
        {chatOpen && (
          <aside
            style={{ width: chatWidth }}
            className="flex shrink-0 flex-col border-l border-edge bg-panel"
          >
            <div className="flex h-13 shrink-0 items-center gap-2.5 border-b border-edge pl-4 pr-3">
              <ExperimentalistOrb className="size-6" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-primary">
                  AI Experimentalist
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-tertiary">
                  <MessagesSquare
                    className="size-3 shrink-0"
                    strokeWidth={1.75}
                  />
                  Ask about this graph
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={openExperimentalist}
                  leadingIcon={
                    <MessagesSquare className="size-3.5" strokeWidth={1.75} />
                  }
                >
                  Open chats
                </Button>
                <IconButton
                  label="Hide chat panel"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  icon={<PanelRight className="size-4" strokeWidth={1.75} />}
                />
              </div>
            </div>
            <ChatConversation
              campaign={campaign}
              messages={messages}
              onMessagesChange={setMessages}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

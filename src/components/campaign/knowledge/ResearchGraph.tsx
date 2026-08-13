'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Maximize2, Minus, Plus } from 'lucide-react'
import type { KnowledgeGraph, KnowledgeNode } from '@/data/types'
import { cn } from '@/lib/cn'
import { edgeStyle, nodeStyle } from './graphTheme'
import { useForceSimulation, type SimNode } from './useForceSimulation'

interface Transform {
  k: number
  tx: number
  ty: number
}

const MIN_ZOOM = 0.2
const MAX_ZOOM = 3.5

export function ResearchGraph({
  graph,
  onSelectNode,
  selectedId,
}: {
  graph: KnowledgeGraph
  onSelectNode: (node: KnowledgeNode) => void
  selectedId: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState<Transform>({ k: 1, tx: 0, ty: 0 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const { nodes, links, version, reheat } = useForceSimulation(graph)
  const nodeData = useMemo(() => {
    const map = new Map<string, KnowledgeNode>()
    for (const n of graph.nodes) map.set(n.id, n)
    return map
  }, [graph])

  // Adjacency for hover highlighting.
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const n of graph.nodes) map.set(n.id, new Set())
    for (const e of graph.edges) {
      map.get(e.source)?.add(e.target)
      map.get(e.target)?.add(e.source)
    }
    return map
  }, [graph])

  // Track container size.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fitToView = useCallback(() => {
    if (!size.width || !size.height || nodes.length === 0) return
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of nodes) {
      minX = Math.min(minX, n.x)
      minY = Math.min(minY, n.y)
      maxX = Math.max(maxX, n.x)
      maxY = Math.max(maxY, n.y)
    }
    const pad = 48
    const bw = Math.max(maxX - minX, 1)
    const bh = Math.max(maxY - minY, 1)
    const k = Math.min(
      (size.width - pad * 2) / bw,
      (size.height - pad * 2) / bh,
      MAX_ZOOM,
    )
    const clampedK = Math.max(MIN_ZOOM, k)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    setTransform({
      k: clampedK,
      tx: size.width / 2 - cx * clampedK,
      ty: size.height / 2 - cy * clampedK,
    })
  }, [nodes, size.width, size.height])

  // Auto-fit once the layout has warmed up and we know our size, until the
  // user takes manual control of the viewport.
  const userMovedRef = useRef(false)
  const didFitRef = useRef(false)
  useEffect(() => {
    if (userMovedRef.current || didFitRef.current) return
    if (!size.width || version < 8) return
    fitToView()
    didFitRef.current = true
  }, [version, size.width, fitToView])

  // Re-fit on resize (unless the user has panned/zoomed themselves).
  useEffect(() => {
    if (userMovedRef.current) return
    if (!size.width) return
    fitToView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height])

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect()
      const px = clientX - (rect?.left ?? 0)
      const py = clientY - (rect?.top ?? 0)
      return {
        x: (px - transform.tx) / transform.k,
        y: (py - transform.ty) / transform.k,
      }
    },
    [transform],
  )

  /* --------------------------- interaction --------------------------- */

  const dragRef = useRef<{
    kind: 'node' | 'pan'
    node?: SimNode
    startX: number
    startY: number
    moved: boolean
    lastX: number
    lastY: number
  } | null>(null)

  const onNodePointerDown = (
    event: ReactPointerEvent<SVGCircleElement>,
    node: SimNode,
  ) => {
    event.stopPropagation()
    ;(event.target as Element).setPointerCapture(event.pointerId)
    dragRef.current = {
      kind: 'node',
      node,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      lastX: event.clientX,
      lastY: event.clientY,
    }
  }

  const onBackgroundPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    dragRef.current = {
      kind: 'pan',
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      lastX: event.clientX,
      lastY: event.clientY,
    }
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const dxTotal = event.clientX - drag.startX
    const dyTotal = event.clientY - drag.startY
    if (Math.abs(dxTotal) + Math.abs(dyTotal) > 3) drag.moved = true

    if (drag.kind === 'node' && drag.node) {
      const world = screenToWorld(event.clientX, event.clientY)
      drag.node.fx = world.x
      drag.node.fy = world.y
      reheat()
    } else if (drag.kind === 'pan') {
      const dx = event.clientX - drag.lastX
      const dy = event.clientY - drag.lastY
      userMovedRef.current = true
      setTransform((t) => ({ ...t, tx: t.tx + dx, ty: t.ty + dy }))
    }
    drag.lastX = event.clientX
    drag.lastY = event.clientY
  }

  const onPointerUp = (event: ReactPointerEvent) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    if (drag.kind === 'node' && drag.node) {
      // Release the pin so the node re-settles into the layout.
      drag.node.fx = null
      drag.node.fy = null
      reheat()
      if (!drag.moved) {
        const data = nodeData.get(drag.node.id)
        if (data) onSelectNode(data)
      }
    }
    try {
      ;(event.target as Element).releasePointerCapture(event.pointerId)
    } catch {
      /* pointer already released */
    }
  }

  // React registers `onWheel` as a passive listener, which makes
  // `preventDefault()` a no-op and lets the page scroll/zoom along with the
  // graph. Attach a native non-passive listener instead.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      userMovedRef.current = true
      const rect = svg.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      setTransform((t) => {
        const factor = Math.exp(-event.deltaY * 0.0015)
        const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k * factor))
        const wx = (px - t.tx) / t.k
        const wy = (py - t.ty) / t.k
        return { k, tx: px - wx * k, ty: py - wy * k }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  const zoomBy = (factor: number) => {
    userMovedRef.current = true
    setTransform((t) => {
      const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.k * factor))
      const cx = size.width / 2
      const cy = size.height / 2
      const wx = (cx - t.tx) / t.k
      const wy = (cy - t.ty) / t.k
      return { k, tx: cx - wx * k, ty: cy - wy * k }
    })
  }

  /* ----------------------------- render ------------------------------ */

  const activeId = hoveredId ?? selectedId
  const activeSet = activeId
    ? new Set<string>([activeId, ...(neighbors.get(activeId) ?? [])])
    : null

  // `version` drives re-render as the sim ticks; referenced to satisfy lint.
  void version

  const showLabel = (id: string) =>
    transform.k > 1.15 || activeSet?.has(id) || id === selectedId

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-panel"
    >
      <svg
        ref={svgRef}
        className="h-full w-full touch-none select-none"
        style={{ cursor: dragRef.current?.kind === 'pan' ? 'grabbing' : 'grab' }}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <g transform={`translate(${transform.tx},${transform.ty}) scale(${transform.k})`}>
          {links.map((link, i) => {
            const s = nodes[link.source]
            const t = nodes[link.target]
            const style = edgeStyle[link.kind]
            const connected =
              !activeSet ||
              (activeSet.has(s.id) && activeSet.has(t.id))
            const isActive =
              activeId != null && (s.id === activeId || t.id === activeId)
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={style.color}
                strokeWidth={(isActive ? 1.6 : 1) / transform.k}
                strokeOpacity={activeSet ? (connected ? (isActive ? 0.9 : 0.25) : 0.05) : link.kind === 'cited' ? 0.55 : 0.35}
              />
            )
          })}

          {nodes.map((node) => {
            const style = nodeStyle[node.kind]
            const dimmed = activeSet ? !activeSet.has(node.id) : false
            const isSelected = node.id === selectedId
            const isHovered = node.id === hoveredId
            const r =
              style.radius * (isHovered || isSelected ? 1.35 : 1)
            return (
              <g
                key={node.id}
                opacity={dimmed ? 0.28 : 1}
                onPointerEnter={() => setHoveredId(node.id)}
                onPointerLeave={() =>
                  setHoveredId((cur) => (cur === node.id ? null : cur))
                }
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={style.color}
                  stroke={isSelected ? 'var(--medra-ink-900)' : 'var(--medra-paper-0)'}
                  strokeWidth={(isSelected ? 2 : 1) / transform.k}
                  style={{ cursor: 'pointer' }}
                  onPointerDown={(e) => onNodePointerDown(e, node)}
                />
                {showLabel(node.id) && (
                  <text
                    x={node.x}
                    y={node.y + r + 9 / transform.k}
                    textAnchor="middle"
                    fill="var(--medra-ink-600)"
                    style={{
                      fontSize: `${10 / transform.k}px`,
                      pointerEvents: 'none',
                    }}
                  >
                    {truncate(nodeData.get(node.id)?.title ?? '', 26)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute left-3 top-3 flex flex-col overflow-hidden rounded-md border border-edge bg-raised shadow-xs">
        <ZoomButton label="Zoom in" onClick={() => zoomBy(1.3)}>
          <Plus className="size-4" strokeWidth={1.75} />
        </ZoomButton>
        <div className="h-px bg-edge" />
        <ZoomButton label="Zoom out" onClick={() => zoomBy(1 / 1.3)}>
          <Minus className="size-4" strokeWidth={1.75} />
        </ZoomButton>
        <div className="h-px bg-edge" />
        <ZoomButton
          label="Fit to view"
          onClick={() => {
            userMovedRef.current = false
            fitToView()
          }}
        >
          <Maximize2 className="size-4" strokeWidth={1.75} />
        </ZoomButton>
      </div>
    </div>
  )
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center text-secondary transition-colors hover:bg-sunken hover:text-primary',
      )}
    >
      {children}
    </button>
  )
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

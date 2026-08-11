'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KnowledgeGraph, KnowledgeNodeKind } from '@/data/types'

export interface SimNode {
  id: string
  kind: KnowledgeNodeKind
  x: number
  y: number
  vx: number
  vy: number
  /** Pinned position while dragging; null when free. */
  fx: number | null
  fy: number | null
}

export interface SimLink {
  source: number
  target: number
  kind: 'cited' | 'semantic'
  /** Rest length — cited links sit tighter than loose semantic matches. */
  distance: number
}

const CHARGE = -190
const LINK_STRENGTH = 0.5
const GRAVITY = 0.055
const VELOCITY_DECAY = 0.62
const ALPHA_DECAY = 0.02
const ALPHA_MIN = 0.0015

/** One integration tick of a lightweight spring/charge layout (d3-force
 *  shape, naive O(n²) — fine for the ~60 nodes we render). */
function tick(nodes: SimNode[], links: SimLink[], alpha: number) {
  // Many-body repulsion.
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      let dx = b.x - a.x
      let dy = b.y - a.y
      let l = dx * dx + dy * dy
      if (l === 0) {
        dx = (Math.random() - 0.5) * 0.1
        dy = (Math.random() - 0.5) * 0.1
        l = dx * dx + dy * dy
      }
      const w = (CHARGE * alpha) / l
      a.vx += dx * w
      a.vy += dy * w
      b.vx -= dx * w
      b.vy -= dy * w
    }
  }

  // Link springs.
  for (const link of links) {
    const s = nodes[link.source]
    const t = nodes[link.target]
    let dx = t.x - s.x
    let dy = t.y - s.y
    let d = Math.sqrt(dx * dx + dy * dy) || 1
    const k = ((d - link.distance) / d) * alpha * LINK_STRENGTH
    dx *= k
    dy *= k
    t.vx -= dx * 0.5
    t.vy -= dy * 0.5
    s.vx += dx * 0.5
    s.vy += dy * 0.5
  }

  // Gravity toward the origin keeps disconnected clusters from drifting off.
  for (const n of nodes) {
    n.vx -= n.x * GRAVITY * alpha
    n.vy -= n.y * GRAVITY * alpha
  }

  // Integrate.
  for (const n of nodes) {
    if (n.fx != null) {
      n.x = n.fx
      n.vx = 0
    } else {
      n.vx *= VELOCITY_DECAY
      n.x += n.vx
    }
    if (n.fy != null) {
      n.y = n.fy
      n.vy = 0
    } else {
      n.vy *= VELOCITY_DECAY
      n.y += n.vy
    }
  }
}

export interface ForceSimulation {
  nodes: SimNode[]
  links: SimLink[]
  /** Bumped every animation frame so consumers re-render. */
  version: number
  /** Re-heat the simulation (e.g. after a drag). */
  reheat: (alpha?: number) => void
}

export function useForceSimulation(graph: KnowledgeGraph): ForceSimulation {
  const [version, setVersion] = useState(0)
  const alphaRef = useRef(1)
  const rafRef = useRef<number | null>(null)

  const { nodes, links } = useMemo(() => {
    const index = new Map<string, number>()
    const nodes: SimNode[] = graph.nodes.map((n, i) => {
      index.set(n.id, i)
      // Phyllotaxis seed — evenly spread, no initial overlap.
      const r = 14 * Math.sqrt(i)
      const angle = i * 2.399963229728653
      return {
        id: n.id,
        kind: n.kind,
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      }
    })
    const links: SimLink[] = []
    for (const e of graph.edges) {
      const s = index.get(e.source)
      const t = index.get(e.target)
      if (s == null || t == null) continue
      links.push({
        source: s,
        target: t,
        kind: e.kind,
        distance: e.kind === 'cited' ? 46 : 74,
      })
    }
    return { nodes, links }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph])

  useEffect(() => {
    alphaRef.current = 1
    // Warm start so the graph appears mostly formed on first paint.
    for (let i = 0; i < 90; i++) tick(nodes, links, alphaRef.current)

    const loop = () => {
      let alpha = alphaRef.current
      alpha += (0 - alpha) * ALPHA_DECAY
      alphaRef.current = alpha
      tick(nodes, links, alpha)
      setVersion((v) => v + 1)
      if (alpha > ALPHA_MIN) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links])

  const reheat = (alpha = 0.35) => {
    alphaRef.current = Math.max(alphaRef.current, alpha)
    if (rafRef.current == null) {
      const loop = () => {
        let a = alphaRef.current
        a += (0 - a) * ALPHA_DECAY
        alphaRef.current = a
        tick(nodes, links, a)
        setVersion((v) => v + 1)
        if (a > ALPHA_MIN) {
          rafRef.current = requestAnimationFrame(loop)
        } else {
          rafRef.current = null
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
  }

  return { nodes, links, version, reheat }
}

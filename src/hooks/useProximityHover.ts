import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'

/**
 * Proximity hover for vertical nav lists, ported from fluid-functionalism.
 * Tracks the cursor across the whole container and reports the item nearest
 * to it — so the highlight stays live in the gaps between rows instead of
 * flickering off. Consumers render a single floating background against the
 * published rects and spring it between items.
 */

export interface ItemRect {
  top: number
  height: number
  left: number
  width: number
}

interface UseProximityHoverReturn {
  activeIndex: number | null
  setActiveIndex: Dispatch<SetStateAction<number | null>>
  itemRects: ItemRect[]
  /** Increments on every fresh mouse-enter; key the hover overlay on it so
   *  re-entering fades in at the new position instead of sliding from the
   *  rect of the previous hover session. */
  sessionRef: RefObject<number>
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void
    onMouseEnter: () => void
    onMouseLeave: () => void
  }
  registerItem: (index: number, element: HTMLElement | null) => void
}

/**
 * How many frames the coalesced remeasure retries while the registered items
 * still have no layout box — an element can be in the DOM one frame before it
 * is laid out, and publishing zeroed rects would pin overlays to the top.
 */
const measurementAttempts = 3

export function useProximityHover<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
): UseProximityHoverReturn {
  const itemsRef = useRef(new Map<number, HTMLElement>())
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [itemRects, setItemRects] = useState<ItemRect[]>([])
  const itemRectsRef = useRef<ItemRect[]>([])
  const sessionRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const remeasureRafIdRef = useRef<number | null>(null)

  /**
   * Publishes a rect for every registered item. Returns false when the
   * measurement could not be completed (no container, or an item without a
   * layout box) — nothing is published in that case, so the last complete
   * measurement stands instead of being overwritten with zeroes.
   */
  const runMeasurement = useCallback(() => {
    const container = containerRef.current
    if (!container) return false
    const rects: ItemRect[] = []
    let everyItemHasLayout = true
    itemsRef.current.forEach((element, index) => {
      const hasLayoutBox =
        element.offsetParent !== null ||
        element.offsetWidth > 0 ||
        element.offsetHeight > 0
      if (!hasLayoutBox) {
        everyItemHasLayout = false
        return
      }
      // offset* instead of getBoundingClientRect so measurements are
      // unaffected by CSS transforms on ancestors. They are layout values
      // relative to the offsetParent, matching the coordinate space used by
      // `position: absolute` overlays inside the container.
      rects[index] = {
        top: element.offsetTop,
        height: element.offsetHeight,
        left: element.offsetLeft,
        width: element.offsetWidth,
      }
    })
    if (!everyItemHasLayout) return false
    // Skip the state update when nothing moved so redundant remeasures
    // (e.g. from ResizeObserver) don't churn re-renders.
    const prev = itemRectsRef.current
    let changed = prev.length !== rects.length
    for (let i = 0; !changed && i < rects.length; i++) {
      const p = prev[i]
      const r = rects[i]
      if (p === r) continue
      changed =
        !p ||
        !r ||
        p.top !== r.top ||
        p.left !== r.left ||
        p.width !== r.width ||
        p.height !== r.height
    }
    if (changed) {
      itemRectsRef.current = rects
      setItemRects(rects)
    }
    return true
  }, [containerRef])

  /** Coalesces every trigger (item registration, container resize) into one
   *  remeasure on the next frame, retrying while items have no layout box. */
  const scheduleMeasurement = useCallback(
    (attemptsLeft: number) => {
      if (remeasureRafIdRef.current !== null) {
        cancelAnimationFrame(remeasureRafIdRef.current)
      }
      remeasureRafIdRef.current = requestAnimationFrame(() => {
        remeasureRafIdRef.current = null
        if (!runMeasurement() && attemptsLeft > 1) {
          scheduleMeasurement(attemptsLeft - 1)
        }
      })
    },
    [runMeasurement],
  )

  const registerItem = useCallback(
    (index: number, element: HTMLElement | null) => {
      if (element) {
        itemsRef.current.set(index, element)
      } else {
        itemsRef.current.delete(index)
      }
      scheduleMeasurement(measurementAttempts)
    },
    [scheduleMeasurement],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const mouseY = e.clientY

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        const container = containerRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()

        let closestIndex: number | null = null
        let closestDistance = Infinity
        let containingIndex: number | null = null

        const rects = itemRectsRef.current
        // Convert content-relative rects to viewport coords using live scroll.
        const scrollOffset = container.scrollTop
        const borderOffset = container.clientTop
        // Item rects are layout values (offset*); the bounding rect reflects
        // any cumulative ancestor transform: scale. Map layout coords into
        // the visual viewport space the cursor lives in.
        const scale =
          container.offsetHeight > 0
            ? containerRect.height / container.offsetHeight
            : 1

        for (let index = 0; index < rects.length; index++) {
          const r = rects[index]
          if (!r) continue

          const itemStart =
            containerRect.top + (borderOffset + r.top - scrollOffset) * scale
          const itemSize = r.height * scale
          const itemEnd = itemStart + itemSize

          if (mouseY >= itemStart && mouseY <= itemEnd) {
            containingIndex = index
          }

          const distance = Math.abs(mouseY - (itemStart + itemSize / 2))
          if (distance < closestDistance) {
            closestDistance = distance
            closestIndex = index
          }
        }

        setActiveIndex(containingIndex ?? closestIndex)
      })
    },
    [containerRef],
  )

  const handleMouseEnter = useCallback(() => {
    sessionRef.current += 1
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    setActiveIndex(null)
  }, [])

  // Remeasure when the container resizes — a reflow moves items even though
  // the registered set is unchanged (e.g. the sidebar collapse animation).
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => scheduleMeasurement(measurementAttempts))
    ro.observe(container)
    return () => ro.disconnect()
  }, [containerRef, scheduleMeasurement])

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      if (remeasureRafIdRef.current !== null) {
        cancelAnimationFrame(remeasureRafIdRef.current)
      }
    }
  }, [])

  return {
    activeIndex,
    setActiveIndex,
    itemRects,
    sessionRef,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    registerItem,
  }
}

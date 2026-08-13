'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronUp, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import {
  SquaresFour,
  Chats,
  Flask,
  Play,
  ChartScatter,
  MapPin,
  BookOpen,
  Package,
  TrayArrowDown,
  ShoppingCart,
  Factory,
  Wrench,
  type Icon,
} from '@phosphor-icons/react'
import { Avatar, IconButton, Kicker, MedraMark, MedraWordmark } from '@/design-system'
import { ProximityPill } from '@/components/nav/ProximityPill'
import {
  navSections,
  type NavItem,
  type NavPath,
  type NavSection,
} from '@/data/navigation'
import { currentUser, organization } from '@/data/campaigns'
import { useProximityHover, type ItemRect } from '@/hooks/useProximityHover'
import { isPathActive } from '@/lib/routing'
import { cn } from '@/lib/cn'
import { SIDEBAR_COLLAPSED_COOKIE } from './sidebar-cookie'

/**
 * Collapse choreography: labels fade out quickly while the width
 * animates closed; on expand they fade in across the full width
 * transition (350ms), finishing in perfect sync with it. Icons sit
 * at a fixed left offset in both states so nothing shifts.
 */
const WIDTH_TRANSITION = 'duration-350 ease-smooth'

/** Dual-weight Phosphor icons per destination — the active route swaps
 *  to the `fill` weight. Exhaustive over the nav paths by type. */
const navIcons: Record<NavPath, Icon> = {
  '/': SquaresFour,
  '/campaigns': Chats,
  '/examples': Flask,
  '/runs': Play,
  '/iteration': ChartScatter,
  '/locations': MapPin,
  '/catalog': BookOpen,
  '/inventory': Package,
  '/receiving': TrayArrowDown,
  '/orders': ShoppingCart,
  '/suppliers': Factory,
  '/tickets': Wrench,
}

const fadeClasses = (collapsed: boolean) =>
  cn(
    'transition-opacity ease-smooth',
    collapsed
      ? 'opacity-0 duration-200'
      : 'opacity-100 duration-350',
  )

function SidebarNavItem({
  item,
  index,
  collapsed,
  isProximityActive,
  registerItem,
}: {
  item: NavItem
  index: number
  collapsed: boolean
  isProximityActive: boolean
  registerItem: (index: number, element: HTMLElement | null) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const pathname = usePathname()
  const isActive = isPathActive(pathname, item.path)
  const ItemIcon = navIcons[item.path]

  useEffect(() => {
    registerItem(index, ref.current)
    return () => registerItem(index, null)
  }, [index, registerItem])

  return (
    <Link
      ref={ref}
      href={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'relative flex items-center gap-2.5 overflow-hidden py-2 pl-3.5 text-sm font-medium whitespace-nowrap transition-colors',
        isActive || isProximityActive
          ? 'text-on-inverse'
          : 'text-on-inverse-muted',
      )}
    >
      {/* Active pill: full-width when expanded, a 32px square centered
          on the icon axis when collapsed. Width animates in sync with
          the sidebar so it never snaps. Hover is handled by the shared
          floating pill in SidebarSection. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 rounded-md transition-[width,left,background-color]',
          WIDTH_TRANSITION,
          collapsed ? 'left-1.5 w-8' : 'left-0 w-full',
          isActive ? 'bg-sidebar-raised' : 'bg-transparent',
        )}
      />
      {/* Twitter-style selected state: the icon swaps to its filled
          weight and the label gains weight on the active route. */}
      <ItemIcon
        className="relative size-4 shrink-0"
        weight={isActive ? 'fill' : 'regular'}
      />
      <span
        className={cn(
          'relative',
          fadeClasses(collapsed),
          isActive && 'font-semibold',
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

function SidebarSection({
  section,
  collapsed,
}: {
  section: NavSection
  collapsed: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef)

  const activeRouteIndex = section.items.findIndex((item) =>
    isPathActive(pathname, item.path),
  )

  const hoverRect = activeIndex !== null ? (itemRects[activeIndex] ?? null) : null
  const activeRouteRect =
    activeRouteIndex >= 0 ? (itemRects[activeRouteIndex] ?? null) : null

  // Mirror the per-item pill geometry: full-width when expanded, a 32px
  // square on the icon axis when collapsed (left-1.5 / w-8).
  const toPill = (rect: ItemRect) => ({
    top: rect.top,
    height: rect.height,
    left: collapsed ? rect.left + 6 : rect.left,
    width: collapsed ? 32 : rect.width,
  })

  return (
    <div className="flex flex-col gap-0.5">
      {section.label && (
        <div className="relative flex h-9 items-end px-3 pb-1.5">
          <Kicker
            tone="inverse"
            className={cn('whitespace-nowrap', fadeClasses(collapsed))}
          >
            {section.label}
          </Kicker>
          {/* Divider shown in the rail state, occupying the same block */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-x-2 bottom-3 border-t border-edge-inverse transition-opacity duration-200 ease-smooth',
              collapsed ? 'opacity-100 delay-150' : 'opacity-0',
            )}
          />
        </div>
      )}
      <div
        ref={containerRef}
        className="relative flex flex-col gap-0.5"
        onMouseEnter={handlers.onMouseEnter}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
      >
        {/* Proximity hover: one floating pill springs between rows, staying
            lit on the nearest item even in the gaps. */}
        <ProximityPill
          hoverRect={hoverRect && toPill(hoverRect)}
          originRect={activeRouteRect && toPill(activeRouteRect)}
          sessionKey={sessionRef.current}
          className="bg-sidebar-raised/60"
        />
        {section.items.map((item, index) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            index={index}
            collapsed={collapsed}
            isProximityActive={activeIndex === index}
            registerItem={registerItem}
          />
        ))}
      </div>
    </div>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // The two menu modes (inline card vs popover) have different geometry,
  // so never carry an open menu across a collapse/expand toggle.
  useEffect(() => {
    setOpen(false)
  }, [collapsed])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const inlineOpen = open && !collapsed
  const popoverOpen = open && collapsed

  return (
    <div ref={containerRef} className="shrink-0 p-2">
      {/* Collapsed rail: the menu floats beside the sidebar as a popover,
          bottom-aligned with the trigger, instead of expanding the 60px
          rail. Fixed positioning escapes the aside's overflow-hidden. */}
      {popoverOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="fixed bottom-2 left-[calc(var(--layout-sidebar-width-collapsed)+8px)] z-50 w-60 rounded-md border border-edge-inverse bg-sidebar-raised shadow-lg"
        >
          <div className="border-b border-edge-inverse px-3 pt-2.5 pb-2">
            <p className="truncate text-sm font-medium text-on-inverse">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-on-inverse-muted">
              {currentUser.role} · {organization.name}
            </p>
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-on-inverse-muted transition-colors duration-150 ease-smooth hover:text-on-inverse"
          >
            <LogOut className="size-3.5 shrink-0" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      )}
      {/* One card that grows upward when opened: the trigger row stays
          anchored at the bottom, so the extra height expands up. */}
      <div className="overflow-hidden rounded-md bg-sidebar-raised/40 transition-colors duration-200 ease-smooth hover:bg-sidebar-raised/60">
        {/* Same choreography as the sidebar collapse: the height animates
            with the 350ms width easing while the content fades out quickly
            and fades back in across the full transition. Content is
            bottom-anchored so it never slides — the card edge just sweeps
            up to reveal it in place. */}
        <div
          className={cn(
            'grid transition-[grid-template-rows]',
            WIDTH_TRANSITION,
            inlineOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="flex min-h-0 flex-col justify-end overflow-hidden">
            <div
              role="menu"
              aria-label="Account menu"
              className={fadeClasses(!inlineOpen)}
            >
              <div className={cn('px-3 pt-2.5 pb-2', fadeClasses(collapsed))}>
                <p className="truncate text-sm font-medium text-on-inverse">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-on-inverse-muted">
                  {currentUser.role} · {organization.name}
                </p>
              </div>
              <button
                role="menuitem"
                type="button"
                tabIndex={inlineOpen ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm whitespace-nowrap text-on-inverse-muted transition-colors duration-150 ease-smooth hover:text-on-inverse"
              >
                <LogOut className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className={fadeClasses(collapsed)}>Sign out</span>
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          title={collapsed ? `${currentUser.name} — ${organization.name}` : undefined}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-2.5 overflow-hidden py-1.5 pr-2 pl-1.5 text-left"
        >
          {/* Avatar center sits on the same 30px axis as the nav icons */}
          <Avatar name={currentUser.name} tone="accent" shape="circle" className="shrink-0" />
          <span className={cn('min-w-0 flex-1', fadeClasses(collapsed))}>
            <span className="block truncate text-sm font-medium text-on-inverse">
              {currentUser.name}
            </span>
            <span className="block truncate text-xs text-on-inverse-muted">
              {organization.name} · {organization.plan}
            </span>
          </span>
          <span className={cn('shrink-0', fadeClasses(collapsed))}>
            <ChevronUp
              className={cn(
                'size-3.5 text-on-inverse-muted transition-transform duration-200 ease-smooth',
                open && 'rotate-180',
              )}
              strokeWidth={1.75}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

export function Sidebar({
  initialCollapsed = false,
}: {
  initialCollapsed?: boolean
}) {
  const [collapsed, setCollapsedState] = useState(initialCollapsed)

  // Persist to a cookie so the server renders the next full page load
  // in the same state (see AppShell).
  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <aside
      className={cn(
        'scheme-dark flex h-full shrink-0 flex-col overflow-hidden bg-sidebar transition-[width]',
        WIDTH_TRANSITION,
        collapsed
          ? 'w-(--layout-sidebar-width-collapsed)'
          : 'w-(--layout-sidebar-width)',
      )}
      aria-label="Primary navigation"
    >
      <div className="relative flex h-(--layout-topbar-height) shrink-0 items-center">
        {/* In the rail state, hovering the mark swaps in the expand toggle.
            It sits before the logo link in the DOM so peer-hover can fade
            the lockup, and above it (z-10) so it wins the pointer. */}
        {collapsed && (
          <div className="peer absolute top-1/2 left-[30px] z-10 size-7 -translate-x-1/2 -translate-y-1/2">
            <IconButton
              label="Expand sidebar"
              variant="inverse-ghost"
              size="sm"
              onClick={() => setCollapsed(false)}
              className="absolute inset-0 opacity-0 transition-opacity duration-200 ease-smooth hover:opacity-100"
              icon={<PanelLeftOpen className="size-4" strokeWidth={1.75} />}
            />
          </div>
        )}
        {/* The full lockup is one link, so mark and wordmark hover-fade as
            a unit. The mark stays centered on the same 30px axis as the
            nav icons, so it never moves during collapse; the wordmark
            keeps its own fade for the collapse choreography. */}
        <Link
          href="/"
          aria-label="Go to dashboard"
          className={cn(
            'absolute inset-y-0 left-0 w-[88px] text-on-inverse transition-opacity duration-200 ease-smooth',
            collapsed ? 'peer-hover:opacity-0' : 'hover:opacity-70',
          )}
        >
          <MedraMark className="absolute top-1/2 left-[30px] h-[18px] w-auto -translate-x-1/2 -translate-y-1/2" />
          <MedraWordmark
            className={cn(
              'absolute top-1/2 left-11 mt-px h-[16.7px] w-auto -translate-y-1/2',
              fadeClasses(collapsed),
            )}
          />
        </Link>
        <IconButton
          label="Collapse sidebar"
          variant="inverse-ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
          className={cn(
            'mr-2 ml-auto',
            fadeClasses(collapsed),
            collapsed && 'pointer-events-none',
          )}
          icon={<PanelLeftClose className="size-4" strokeWidth={1.75} />}
        />
      </div>
      <nav className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-4">
        {navSections.map((section, index) => (
          <SidebarSection
            key={section.label ?? index}
            section={section}
            collapsed={collapsed}
          />
        ))}
      </nav>
      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}

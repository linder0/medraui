'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, MessagesSquare } from 'lucide-react'
import {
  Rows,
  TestTube,
  ListChecks,
  BookOpen,
  Chats,
  type Icon,
} from '@phosphor-icons/react'
import { Avatar, Button, Kicker, Progress } from '@/design-system'
import { ContextPanel } from '@/components/layout/ContextPanel'
import { useExperimentalist } from '@/components/experimentalist/ExperimentalistContext'
import { ProximityPill } from '@/components/nav/ProximityPill'
import {
  campaignSections,
  type CampaignSectionSegment,
} from '@/data/navigation'
import type { Campaign } from '@/data/types'
import { useProximityHover } from '@/hooks/useProximityHover'
import { isPathActive } from '@/lib/routing'
import { cn } from '@/lib/cn'

interface CampaignTab {
  label: string
  segment: string
  icon: Icon
  count?: number
}

const sectionIcons: Record<CampaignSectionSegment, Icon> = {
  assays: TestTube,
  plan: ListChecks,
  knowledge: BookOpen,
  chats: Chats,
}

/** Overview plus the shared campaign sections — one source of truth
 *  with the /campaigns/[campaignId]/[section] route. */
function tabsFor(campaign: Campaign): CampaignTab[] {
  return [
    { label: 'Overview', segment: '', icon: Rows },
    ...campaignSections.map((section) => ({
      label: section.label,
      segment: section.segment,
      icon: sectionIcons[section.segment],
      count: section.segment === 'assays' ? campaign.assayCount : undefined,
    })),
  ]
}

function CampaignNavItem({
  tab,
  to,
  index,
  isProximityActive,
  registerItem,
}: {
  tab: CampaignTab
  to: string
  index: number
  isProximityActive: boolean
  registerItem: (index: number, element: HTMLElement | null) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const pathname = usePathname()
  const isActive = isPathActive(pathname, to, { exact: tab.segment === '' })

  useEffect(() => {
    registerItem(index, ref.current)
    return () => registerItem(index, null)
  }, [index, registerItem])

  return (
    <Link
      ref={ref}
      href={to}
      className={cn(
        'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sunken text-primary'
          : isProximityActive
            ? 'text-primary'
            : 'text-secondary',
      )}
    >
      {/* Twitter-style selected state: the icon swaps to its filled
          weight and the label gains weight on the active route. */}
      <tab.icon
        className="size-4 shrink-0"
        weight={isActive ? 'fill' : 'regular'}
      />
      <span className={cn('flex-1', isActive && 'font-semibold')}>
        {tab.label}
      </span>
      {tab.count !== undefined && (
        <span className="text-xs text-tertiary">{tab.count}</span>
      )}
    </Link>
  )
}

function CampaignNav({ campaign }: { campaign: Campaign }) {
  const containerRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef)

  const tabs = tabsFor(campaign)
  const base = `/campaigns/${campaign.id}`
  const hrefFor = (tab: CampaignTab) =>
    tab.segment === '' ? base : `${base}/${tab.segment}`
  const activeRouteIndex = tabs.findIndex((tab) =>
    isPathActive(pathname, hrefFor(tab), { exact: tab.segment === '' }),
  )

  const hoverRect = activeIndex !== null ? (itemRects[activeIndex] ?? null) : null
  const activeRouteRect =
    activeRouteIndex >= 0 ? (itemRects[activeRouteIndex] ?? null) : null

  return (
    <nav
      ref={containerRef}
      className="relative flex flex-col gap-0.5"
      aria-label="Campaign sections"
      onMouseEnter={handlers.onMouseEnter}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    >
      {/* Proximity hover: one floating pill springs between rows, staying
          lit on the nearest item even in the gaps. */}
      <ProximityPill
        hoverRect={hoverRect}
        originRect={activeRouteRect}
        sessionKey={sessionRef.current}
        className="bg-sunken/60"
      />
      {tabs.map((tab, index) => (
        <CampaignNavItem
          key={tab.label}
          tab={tab}
          to={hrefFor(tab)}
          index={index}
          isProximityActive={activeIndex === index}
          registerItem={registerItem}
        />
      ))}
    </nav>
  )
}

export function CampaignPanel({ campaign }: { campaign: Campaign }) {
  const { openExperimentalist } = useExperimentalist()
  const completedGoals = campaign.goals.filter((g) => g.status === 'completed').length
  const activeGoals = campaign.goals.filter((g) => g.status === 'active').length

  return (
    <ContextPanel
      header={
        <button className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sunken">
          <Avatar name={campaign.name} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-primary">
              {campaign.name}
            </span>
            <span className="block text-xs text-tertiary">
              Updated {campaign.updatedAgo}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} />
        </button>
      }
      footer={
        <div className="rounded-lg border border-edge bg-raised p-3 shadow-xs">
          <p className="text-sm font-semibold text-primary">AI Experimentalist</p>
          <p className="mt-1 text-xs leading-relaxed text-secondary">
            Use chats to propose goals, discuss run results, and update the
            campaign plan with human approval.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            onClick={openExperimentalist}
            leadingIcon={<MessagesSquare className="size-3.5" strokeWidth={1.75} />}
          >
            Open chats
          </Button>
        </div>
      }
    >
      <CampaignNav campaign={campaign} />

      <div className="mt-6 px-2.5">
        <Kicker>Progress</Kicker>
        <div className="mt-2.5 flex items-center gap-3">
          <Progress value={campaign.progressPercent} className="flex-1" />
          <span className="text-xs font-medium text-secondary">
            {campaign.progressPercent}%
          </span>
        </div>
        <p className="mt-2 text-xs text-tertiary">
          {completedGoals} completed · {activeGoals} active goals
        </p>
      </div>
    </ContextPanel>
  )
}

'use client'

import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Maximize2 } from 'lucide-react'
import { Badge, Button, Kicker, Modal } from '@/design-system'
import { cn } from '@/lib/cn'
import type { PlanVariant } from '@/data/types'

/** Wireframe pipeline diagram: one column per stage, stacked nodes for
 *  steps that run in parallel, thin connectors between columns.
 *  Compact by default; `size="lg"` renders the expanded-modal version. */
function VariantDiagram({
  variant,
  size = 'sm',
  onExpand,
}: {
  variant: PlanVariant
  size?: 'sm' | 'lg'
  onExpand?: () => void
}) {
  const large = size === 'lg'
  return (
    <div
      className={cn(
        'relative rounded-md border border-edge bg-sunken',
        large ? 'p-5' : 'p-3',
      )}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <Badge tone="neutral">Auto</Badge>
        {onExpand && (
          <button
            type="button"
            aria-label="Expand diagram"
            onClick={onExpand}
            className="flex size-6 items-center justify-center rounded-sm text-tertiary transition-colors hover:bg-raised hover:text-secondary"
          >
            <Maximize2 className="size-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div className="flex items-center overflow-x-auto pt-1 pr-16 pb-1">
        {variant.stages.map((stage, index) => (
          <Fragment key={stage.id}>
            {index > 0 && (
              <div
                className={cn(
                  'h-px shrink-0 bg-edge-strong',
                  large ? 'w-8' : 'w-5',
                )}
                aria-hidden
              />
            )}
            <div className={cn('flex shrink-0 flex-col', large ? 'gap-2.5' : 'gap-1.5')}>
              {stage.steps.map((step) => (
                <div
                  key={step}
                  className={cn(
                    'rounded-sm border border-edge bg-raised whitespace-nowrap shadow-xs',
                    large
                      ? 'px-3 py-2.5 text-sm text-secondary'
                      : 'px-2 py-1.5 text-2xs text-tertiary',
                  )}
                >
                  {step}
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function PlanVariantsExplorer({
  variants,
}: {
  variants: PlanVariant[]
}) {
  const [activeId, setActiveId] = useState(variants[0]?.id ?? '')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [diagramExpanded, setDiagramExpanded] = useState(false)

  const active = variants.find((variant) => variant.id === activeId)
  if (!active) return null

  const isDraft = draftId === active.id

  return (
    <div className="flex flex-col gap-2">
      <Kicker>Plan variants</Kicker>

      <div
        role="tablist"
        aria-label="Plan variants"
        className="flex rounded-lg border border-edge bg-sunken p-1"
      >
        {variants.map((variant) => {
          const selected = variant.id === activeId
          return (
            <button
              key={variant.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(variant.id)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ease-smooth',
                selected
                  ? 'bg-raised font-semibold text-primary shadow-xs'
                  : 'font-medium text-secondary hover:text-primary',
              )}
            >
              {variant.axis}
              {draftId === variant.id && (
                <Check
                  className="ml-1.5 inline size-3.5 align-[-2px] text-action"
                  strokeWidth={2.5}
                />
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="rounded-lg border border-edge bg-raised shadow-xs"
        >
          <div className="flex flex-col gap-3 p-5">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-primary">
                {active.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-secondary">
                {active.summary}
              </p>
            </div>

            <VariantDiagram
              variant={active}
              onExpand={() => setDiagramExpanded(true)}
            />

            <div>
              <h4 className="text-sm font-semibold text-primary">Goals</h4>
              <p className="mt-1 text-sm leading-relaxed text-secondary">
                {active.goals}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-edge px-5 py-3">
            <p className="text-xs text-tertiary">
              {isDraft
                ? 'This variant is your campaign draft.'
                : 'Setting a variant replaces the current campaign draft.'}
            </p>
            <Button
              variant={isDraft ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setDraftId(active.id)}
              disabled={isDraft}
              leadingIcon={
                isDraft ? (
                  <Check className="size-3.5" strokeWidth={2} />
                ) : undefined
              }
            >
              {isDraft ? 'Campaign draft' : 'Set as campaign draft'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Modal
        open={diagramExpanded}
        onClose={() => setDiagramExpanded(false)}
        label={`${active.title} pipeline diagram`}
        size="lg"
      >
        <div className="flex flex-col gap-4 p-6">
          <div>
            <Kicker>{active.axis}</Kicker>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-primary">
              {active.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-secondary">
              {active.summary}
            </p>
          </div>
          <VariantDiagram variant={active} size="lg" />
        </div>
      </Modal>
    </div>
  )
}

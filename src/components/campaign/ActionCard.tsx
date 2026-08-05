import type { ReactNode } from 'react'
import { Card, Kicker } from '@/design-system'
import { cn } from '@/lib/cn'

export interface ActionCardProps {
  /** Uppercase eyebrow, e.g. 'Recommended' or 'Manual'. */
  kicker: string
  kickerIcon?: ReactNode
  title: string
  description: string
  action: ReactNode
  /** Recommended cards get a subtle emphasized treatment. */
  emphasized?: boolean
}

export function ActionCard({
  kicker,
  kickerIcon,
  title,
  description,
  action,
  emphasized = false,
}: ActionCardProps) {
  return (
    <Card
      variant={emphasized ? 'raised' : 'outlined'}
      className={cn(
        'flex flex-col items-start gap-3',
        emphasized && 'border-edge-strong bg-panel',
      )}
    >
      <Kicker icon={kickerIcon} tone={emphasized ? 'default' : 'muted'}>
        {kicker}
      </Kicker>
      <div>
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-secondary">
          {description}
        </p>
      </div>
      <div className="mt-auto pt-1">{action}</div>
    </Card>
  )
}

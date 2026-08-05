import { Badge, type BadgeTone } from '@/design-system'
import type { CampaignStatus } from '@/data/types'

const statusTone: Record<CampaignStatus, BadgeTone> = {
  planned: 'neutral',
  active: 'info',
  paused: 'warning',
  completed: 'success',
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge tone={statusTone[status]} variant="outline">
      {status}
    </Badge>
  )
}

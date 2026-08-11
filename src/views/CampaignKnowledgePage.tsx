import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  FileText,
  FlaskConical,
  MessagesSquare,
  Search,
  Upload,
} from 'lucide-react'
import { Button, Input, Kicker } from '@/design-system'
import { KnowledgeGraphPanel } from '@/components/campaign/knowledge/KnowledgeGraphPanel'
import { ExperimentalistTrigger } from '@/components/experimentalist/ExperimentalistTrigger'
import { countByKind, getKnowledgeGraph } from '@/data/knowledge'
import type { Campaign } from '@/data/types'

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-edge bg-raised px-5 py-4.5 shadow-xs">
      <span className="shrink-0 text-secondary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-primary">{value}</p>
        <Kicker>{label}</Kicker>
      </div>
    </div>
  )
}

export function CampaignKnowledge({ campaign }: { campaign: Campaign }) {
  const graph = getKnowledgeGraph(campaign.id)
  const counts = countByKind(graph)

  return (
    <>
      <header>
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to overview
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Knowledge
            </h1>
            <p className="mt-1 text-sm text-secondary">{campaign.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              leadingIcon={<Search className="size-4" strokeWidth={1.75} />}
              placeholder="Search campaign knowledge..."
              className="w-64"
            />
            <Button
              leadingIcon={<Upload className="size-4" strokeWidth={1.75} />}
            >
              Upload documents
            </Button>
            <ExperimentalistTrigger
              variant="primary"
              leadingIcon={
                <MessagesSquare className="size-4" strokeWidth={1.75} />
              }
            >
              AI Experimentalist
            </ExperimentalistTrigger>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="size-5" strokeWidth={1.75} />}
          label="Documents"
          value={counts.chunk}
        />
        <StatCard
          icon={<BookOpen className="size-5" strokeWidth={1.75} />}
          label="Sources"
          value={counts.source}
        />
        <StatCard
          icon={<Brain className="size-5" strokeWidth={1.75} />}
          label="Memories"
          value={counts.memory}
        />
        <StatCard
          icon={<FlaskConical className="size-5" strokeWidth={1.75} />}
          label="Research"
          value={counts.result}
        />
      </div>

      <KnowledgeGraphPanel graph={graph} />
    </>
  )
}

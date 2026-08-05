import { Construction } from 'lucide-react'
import { EmptyState } from '@/design-system'
import { PageContainer } from '@/components/layout/PageContainer'

/** Generic stub for routes that exist in navigation but aren't built yet. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight text-primary">
        {title}
      </h1>
      <EmptyState
        className="mt-6"
        icon={<Construction className="size-6" strokeWidth={1.5} />}
        title={`${title} is on the roadmap`}
        description="This section is stubbed with the shared page scaffold so the team can iterate on it independently."
      />
    </PageContainer>
  )
}

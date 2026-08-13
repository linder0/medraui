import { ExperimentalistProvider } from '@/components/experimentalist/ExperimentalistContext'
import { ExperimentalistOverlay } from '@/components/experimentalist/ExperimentalistOverlay'
import { campaigns } from '@/data/campaigns'
import { KnowledgeWorkspace } from '@/views/KnowledgeWorkspace'

/**
 * Medra is the knowledge workspace: an Obsidian-style vault (tree, tabbed
 * notes, research graph) with the AI Experimentalist alongside. The first
 * campaign's knowledge base seeds the vault.
 */
export default function Page() {
  const vault = campaigns[0]!

  return (
    <ExperimentalistProvider campaign={vault}>
      <div className="relative h-full">
        <KnowledgeWorkspace campaign={vault} />

        {/* Full-screen chat — covers the workspace, like a focused mode. */}
        <ExperimentalistOverlay />
      </div>
    </ExperimentalistProvider>
  )
}

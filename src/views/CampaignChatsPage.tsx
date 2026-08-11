'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessagesSquare } from 'lucide-react'
import { Button, EmptyState } from '@/design-system'
import { useExperimentalist } from '@/components/experimentalist/ExperimentalistContext'
import type { Campaign } from '@/data/types'

/**
 * The Chats tab *is* the AI Experimentalist: landing here opens the chat
 * overlay immediately. This page only shows through as the underlay after
 * the user closes the overlay, offering a way back in.
 */
export function CampaignChats({ campaign }: { campaign: Campaign }) {
  const { openExperimentalist } = useExperimentalist()

  useEffect(() => {
    openExperimentalist()
  }, [openExperimentalist])

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
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-primary">
          Chats
        </h1>
      </header>
      <EmptyState
        icon={<MessagesSquare className="size-6" strokeWidth={1.5} />}
        title="Chats live in the AI Experimentalist"
        description={`Conversations for ${campaign.name} open in the full-screen Experimentalist view.`}
        action={
          <Button
            variant="primary"
            onClick={openExperimentalist}
            leadingIcon={<MessagesSquare className="size-4" strokeWidth={1.75} />}
          >
            Open chats
          </Button>
        }
      />
    </>
  )
}

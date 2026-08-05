'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowUp,
  FolderPlus,
  Minimize2,
  MoreHorizontal,
  PanelRight,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react'
import { Chats } from '@phosphor-icons/react'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  IconButton,
  Input,
  Kicker,
  type Column,
} from '@/design-system'
import { CampaignStatusBadge } from '@/components/campaign/CampaignStatusBadge'
import { getChatsForCampaign } from '@/data/campaigns'
import type { Campaign, CampaignFile, Chat } from '@/data/types'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'
import { useExperimentalist } from './ExperimentalistContext'
import { ChatConversation } from './ChatConversation'

const knowledgeColumns: Column<CampaignFile>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (file) => (
      <span className="truncate font-medium text-primary">{file.name}</span>
    ),
  },
  {
    key: 'indexed',
    header: 'Indexed',
    align: 'right',
    widthClassName: 'w-24',
    render: (file) =>
      file.indexed ? (
        <Badge tone="success">Indexed</Badge>
      ) : (
        <Badge tone="neutral">Pending</Badge>
      ),
  },
]

function ChatListItem({
  chat,
  active,
  onSelect,
}: {
  chat: Chat
  active: boolean
  onSelect: () => void
}) {
  const preview =
    chat.messages.at(-1)?.content ?? 'No messages yet.'
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-md border p-3 text-left transition-colors',
        active
          ? 'border-edge-strong bg-raised shadow-xs'
          : 'border-transparent hover:bg-sunken',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-primary">
          {chat.title}
        </span>
        <MoreHorizontal className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} />
      </div>
      <Kicker className="mt-1">Conversation</Kicker>
      <p className="mt-1.5 line-clamp-1 text-xs text-secondary">{preview}</p>
      <p className="mt-1.5 text-2xs text-tertiary">
        {chat.author} · {chat.updatedAgo}
      </p>
    </button>
  )
}

function ChatListColumn({
  campaign,
  chats,
  selectedId,
  onSelect,
}: {
  campaign: Campaign
  chats: Chat[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const { close } = useExperimentalist()
  const chatLabel = chats.length === 1 ? '1 chat' : `${chats.length} chats`

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-edge bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-edge p-3">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to campaign
        </button>
        <div className="flex items-center gap-1">
          <IconButton
            label="Chat options"
            size="sm"
            icon={<MoreHorizontal className="size-4" strokeWidth={1.75} />}
          />
          <IconButton
            label="New chat"
            size="sm"
            icon={<Plus className="size-4" strokeWidth={1.75} />}
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-b border-edge p-3">
        <Avatar name={campaign.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {campaign.name}
          </p>
          <p className="text-xs text-tertiary">Updated {campaign.updatedAgo}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <span className="text-2xs text-tertiary">{chatLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3">
        <Input
          leadingIcon={<Search className="size-4" strokeWidth={1.75} />}
          placeholder="Search chats..."
          className="flex-1"
        />
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
        >
          New
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 pb-3">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={chat.id === selectedId}
            onSelect={() => onSelect(chat.id)}
          />
        ))}
      </div>
    </aside>
  )
}

function KnowledgeColumn({ campaign }: { campaign: Campaign }) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-edge bg-panel">
      <div className="flex items-center justify-end border-b border-edge p-3">
        <IconButton
          label="Toggle scope panel"
          size="sm"
          icon={<PanelRight className="size-4" strokeWidth={1.75} />}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
        <div>
          <Kicker>Conversation scope</Kicker>
          <div className="mt-2 rounded-md border border-edge bg-raised p-3 shadow-xs">
            <Kicker>Conversation</Kicker>
            <p className="mt-1 text-sm font-medium text-primary">
              {campaign.name}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <Kicker>Knowledge base</Kicker>
          <p className="mt-1 text-sm font-semibold text-primary">
            Knowledge base
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <IconButton
              label="Up one level"
              variant="secondary"
              size="sm"
              icon={<ArrowUp className="size-4" strokeWidth={1.75} />}
            />
            <Input
              leadingIcon={<Search className="size-4" strokeWidth={1.75} />}
              placeholder="Search files..."
              className="flex-1"
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1"
              leadingIcon={<FolderPlus className="size-3.5" strokeWidth={1.75} />}
            >
              New folder
            </Button>
            <Button
              size="sm"
              className="flex-1"
              leadingIcon={<Upload className="size-3.5" strokeWidth={1.75} />}
            >
              Upload
            </Button>
            <IconButton
              label="Refresh files"
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="size-4" strokeWidth={1.75} />}
            />
          </div>

          <DataTable
            className="mt-4"
            columns={knowledgeColumns}
            rows={campaign.files}
            rowKey={(file) => file.id}
            emptyState={
              <p className="px-1 py-4 text-sm text-tertiary">
                No files indexed yet.
              </p>
            }
          />
        </div>
      </div>
    </aside>
  )
}

export function ExperimentalistOverlay() {
  const { campaign, open, close } = useExperimentalist()
  const chats = getChatsForCampaign(campaign.id)
  const [selectedId, setSelectedId] = useState(chats[0]?.id ?? '')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const selectedChat =
    chats.find((chat) => chat.id === selectedId) ?? chats[0]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: spring.moderate.exit }}
          transition={spring.moderate}
          className="absolute inset-0 z-40 flex flex-col bg-app"
          role="dialog"
          aria-modal="true"
          aria-label={`AI Experimentalist for ${campaign.name}`}
        >
          <div className="flex min-h-0 flex-1">
            <ChatListColumn
              campaign={campaign}
              chats={chats}
              selectedId={selectedChat?.id ?? ''}
              onSelect={setSelectedId}
            />

            <section className="flex min-w-0 flex-1 flex-col">
              <div className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-edge px-4">
                <div className="flex items-center gap-2">
                  <Chats className="size-4 text-tertiary" weight="regular" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-primary">
                      {selectedChat?.title ?? 'Untitled chat'}
                    </p>
                    <Kicker>Conversation</Kicker>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconButton
                    label="Conversation options"
                    size="sm"
                    icon={<MoreHorizontal className="size-4" strokeWidth={1.75} />}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
                  >
                    New chat
                  </Button>
                  <Button
                    size="sm"
                    onClick={close}
                    leadingIcon={
                      <Minimize2 className="size-3.5" strokeWidth={1.75} />
                    }
                  >
                    Minimize
                  </Button>
                </div>
              </div>

              {selectedChat && (
                <ChatConversation
                  key={selectedChat.id}
                  campaign={campaign}
                  initialMessages={selectedChat.messages}
                />
              )}
            </section>

            <KnowledgeColumn campaign={campaign} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

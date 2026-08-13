'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
  ArrowLeft,
  ArrowUp,
  Folder,
  FolderPlus,
  Minimize2,
  MoreHorizontal,
  PanelRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  IconButton,
  Input,
  Kicker,
  Modal,
  type Column,
} from '@/design-system'
import { getChatsForCampaign } from '@/data/campaigns'
import type { Campaign, CampaignFile, Chat, ChatMessage } from '@/data/types'
import { cn } from '@/lib/cn'
import { useExperimentalist } from './ExperimentalistContext'
import { ChatConversation } from './ChatConversation'
import { DropdownMenu } from './DropdownMenu'

let chatSeq = 0
function makeEmptyChat(): Chat {
  chatSeq += 1
  return {
    id: `chat-local-${chatSeq}`,
    title: 'Untitled chat',
    updatedAgo: 'Just now',
    author: 'Dev User',
    messages: [],
  }
}

/** Derive a chat title from its first user message, e.g. after the first
 *  send an 'Untitled chat' becomes 'Explore alternative designs'. */
function deriveTitle(content: string): string {
  const line = content.trim().split('\n')[0] ?? ''
  return line.length > 48 ? `${line.slice(0, 48).trimEnd()}…` : line
}

let fileSeq = 0
function nextFileId() {
  fileSeq += 1
  return `file-local-${fileSeq}`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileTypeOf(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()! : ''
  return ext ? ext.toUpperCase() : 'FILE'
}

const knowledgeColumns: Column<CampaignFile>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (file) => (
      <span className="flex items-center gap-1.5 truncate font-medium text-primary">
        {file.isFolder && (
          <Folder className="size-3.5 shrink-0 text-tertiary" strokeWidth={1.75} />
        )}
        {file.name}
      </span>
    ),
  },
  {
    key: 'indexed',
    header: 'Indexed',
    align: 'right',
    widthClassName: 'w-24',
    render: (file) =>
      file.isFolder ? (
        <Badge tone="neutral">Folder</Badge>
      ) : file.indexed ? (
        <Badge tone="success">Indexed</Badge>
      ) : (
        <Badge tone="neutral">Pending</Badge>
      ),
  },
]

/** Single-field prompt dialog shared by "rename chat" and "new folder". */
function NamePromptModal({
  open,
  title,
  placeholder,
  submitLabel,
  initialValue = '',
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  placeholder: string
  submitLabel: string
  initialValue?: string
  onClose: () => void
  onSubmit: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} label={title} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <h2 className="text-md font-semibold text-primary">{title}</h2>
        <Input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ChatListItem({
  chat,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  chat: Chat
  active: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
}) {
  const preview = chat.messages.at(-1)?.content ?? 'No messages yet.'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'w-full cursor-pointer rounded-md border p-3 text-left transition-colors',
        active
          ? 'border-edge-strong bg-raised shadow-xs'
          : 'border-transparent hover:bg-sunken',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-primary">
          {chat.title}
        </span>
        <DropdownMenu
          trigger={
            <IconButton
              label="Chat actions"
              size="sm"
              className="-my-1 -mr-1"
              icon={
                <MoreHorizontal className="size-4" strokeWidth={1.75} />
              }
            />
          }
          items={[
            {
              label: 'Rename chat',
              icon: <Pencil className="size-3.5" strokeWidth={1.75} />,
              onSelect: onRename,
            },
            {
              label: 'Delete chat',
              icon: <Trash2 className="size-3.5" strokeWidth={1.75} />,
              destructive: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>
      <p className="mt-1.5 line-clamp-1 text-xs text-secondary">{preview}</p>
      <p className="mt-1.5 text-2xs text-tertiary">
        {chat.author} · {chat.updatedAgo}
      </p>
    </div>
  )
}

function ChatListColumn({
  campaign,
  chats,
  selectedId,
  onSelect,
  onNewChat,
  onRenameChat,
  onDeleteChat,
}: {
  campaign: Campaign
  chats: Chat[]
  selectedId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onRenameChat: (id: string) => void
  onDeleteChat: (id: string) => void
}) {
  const { close } = useExperimentalist()
  const [query, setQuery] = useState('')

  const normalized = query.trim().toLowerCase()
  const visibleChats = normalized
    ? chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(normalized) ||
          chat.messages.some((message) =>
            message.content.toLowerCase().includes(normalized),
          ),
      )
    : chats

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-edge bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-edge p-3">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to workspace
        </button>
        <div className="flex items-center gap-1">
          <DropdownMenu
            trigger={
              <IconButton
                label="Chat options"
                size="sm"
                icon={<MoreHorizontal className="size-4" strokeWidth={1.75} />}
              />
            }
            items={[
              {
                label: 'Rename current chat',
                icon: <Pencil className="size-3.5" strokeWidth={1.75} />,
                onSelect: () => onRenameChat(selectedId),
              },
              {
                label: 'Delete current chat',
                icon: <Trash2 className="size-3.5" strokeWidth={1.75} />,
                destructive: true,
                onSelect: () => onDeleteChat(selectedId),
              },
            ]}
          />
          <IconButton
            label="New chat"
            size="sm"
            onClick={onNewChat}
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
        </div>
      </div>

      <div className="flex items-center gap-2 p-3">
        <Input
          size="sm"
          leadingIcon={<Search className="size-3.5" strokeWidth={1.75} />}
          placeholder="Search chats..."
          className="flex-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={onNewChat}
          leadingIcon={<Plus className="size-3.5" strokeWidth={1.75} />}
        >
          New
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 pb-3">
        {visibleChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={chat.id === selectedId}
            onSelect={() => onSelect(chat.id)}
            onRename={() => onRenameChat(chat.id)}
            onDelete={() => onDeleteChat(chat.id)}
          />
        ))}
        {visibleChats.length === 0 && (
          <p className="px-1 py-3 text-sm text-tertiary">
            No chats match “{query.trim()}”.
          </p>
        )}
      </div>
    </aside>
  )
}

function KnowledgeColumn({
  campaign,
  files,
  refreshing,
  onUpload,
  onCreateFolder,
  onRefresh,
}: {
  campaign: Campaign
  files: CampaignFile[]
  refreshing: boolean
  onUpload: (files: FileList) => void
  onCreateFolder: (name: string) => void
  onRefresh: () => void
}) {
  const [query, setQuery] = useState('')
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const normalized = query.trim().toLowerCase()
  const visibleFiles = normalized
    ? files.filter((file) => file.name.toLowerCase().includes(normalized))
    : files

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-edge bg-panel">
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
              disabled
              icon={<ArrowUp className="size-4" strokeWidth={1.75} />}
            />
            <Input
              size="sm"
              leadingIcon={<Search className="size-3.5" strokeWidth={1.75} />}
              placeholder="Search files..."
              className="flex-1"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setFolderModalOpen(true)}
              leadingIcon={<FolderPlus className="size-3.5" strokeWidth={1.75} />}
            >
              New folder
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => uploadInputRef.current?.click()}
              leadingIcon={<Upload className="size-3.5" strokeWidth={1.75} />}
            >
              Upload
            </Button>
            <IconButton
              label="Refresh files"
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              icon={
                <RefreshCw
                  className={cn('size-4', refreshing && 'animate-spin')}
                  strokeWidth={1.75}
                />
              }
            />
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files?.length) onUpload(event.target.files)
                event.target.value = ''
              }}
            />
          </div>

          <DataTable
            className="mt-4"
            columns={knowledgeColumns}
            rows={visibleFiles}
            rowKey={(file) => file.id}
            emptyState={
              <p className="px-1 py-4 text-sm text-tertiary">
                {normalized
                  ? `No files match “${query.trim()}”.`
                  : 'No files indexed yet.'}
              </p>
            }
          />
        </div>
      </div>

      <NamePromptModal
        open={folderModalOpen}
        title="New folder"
        placeholder="Folder name"
        submitLabel="Create folder"
        onClose={() => setFolderModalOpen(false)}
        onSubmit={onCreateFolder}
      />
    </aside>
  )
}

export function ExperimentalistOverlay() {
  const { campaign, open, close } = useExperimentalist()
  const [chats, setChats] = useState<Chat[]>(() => {
    const seeded = getChatsForCampaign(campaign.id)
    return seeded.length > 0 ? seeded : [makeEmptyChat()]
  })
  const [selectedId, setSelectedId] = useState(() => chats[0]?.id ?? '')
  const [knowledgeOpen, setKnowledgeOpen] = useState(true)
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null)
  const [files, setFiles] = useState<CampaignFile[]>(campaign.files)
  const [refreshing, setRefreshing] = useState(false)

  const createChat = useCallback(() => {
    const chat = makeEmptyChat()
    setChats((prev) => [chat, ...prev])
    setSelectedId(chat.id)
  }, [])

  // Selection self-heals: when the selected chat is deleted, rendering
  // falls back to the first remaining chat.
  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const remaining = prev.filter((chat) => chat.id !== chatId)
      // The overlay always shows a conversation, so deleting the last chat
      // swaps in a fresh empty one.
      return remaining.length > 0 ? remaining : [makeEmptyChat()]
    })
  }, [])

  const renameChat = useCallback((chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title, updatedAgo: 'Just now' } : chat,
      ),
    )
  }, [])

  const updateChatMessages = useCallback(
    (chatId: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat
          const messages = updater(chat.messages)
          const firstUserMessage = messages.find((m) => m.role === 'user')
          return {
            ...chat,
            messages,
            updatedAgo: 'Just now',
            title:
              chat.title === 'Untitled chat' && firstUserMessage
                ? deriveTitle(firstUserMessage.content)
                : chat.title,
          }
        }),
      )
    },
    [],
  )

  const uploadFiles = useCallback((fileList: FileList) => {
    const uploads: CampaignFile[] = Array.from(fileList).map((file) => ({
      id: nextFileId(),
      name: file.name,
      type: fileTypeOf(file.name),
      size: formatSize(file.size),
      indexed: false,
    }))
    setFiles((prev) => [...prev, ...uploads])
  }, [])

  const createFolder = useCallback((name: string) => {
    setFiles((prev) => [
      { id: nextFileId(), name, type: 'FOLDER', size: '—', indexed: false, isFolder: true },
      ...prev,
    ])
  }, [])

  const refreshFiles = useCallback(() => {
    setRefreshing(true)
    // Mock indexing pass: pending uploads flip to Indexed after a beat.
    window.setTimeout(() => {
      setFiles((prev) =>
        prev.map((file) =>
          file.isFolder || file.indexed ? file : { ...file, indexed: true },
        ),
      )
      setRefreshing(false)
    }, 900)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const selectedChat =
    chats.find((chat) => chat.id === selectedId) ?? chats[0]!
  const renamingChat = chats.find((chat) => chat.id === renamingChatId)

  const chatMenuItems = [
    {
      label: 'Rename chat',
      icon: <Pencil className="size-3.5" strokeWidth={1.75} />,
      onSelect: () => setRenamingChatId(selectedChat.id),
    },
    {
      label: 'Delete chat',
      icon: <Trash2 className="size-3.5" strokeWidth={1.75} />,
      destructive: true,
      onSelect: () => deleteChat(selectedChat.id),
    },
  ]

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col bg-app"
      role="dialog"
      aria-modal="true"
      aria-label={`AI Experimentalist for ${campaign.name}`}
    >
      <div className="flex min-h-0 flex-1">
        <ChatListColumn
          campaign={campaign}
          chats={chats}
          selectedId={selectedChat.id}
          onSelect={setSelectedId}
          onNewChat={createChat}
          onRenameChat={setRenamingChatId}
          onDeleteChat={deleteChat}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-edge px-4">
            <div className="flex items-center gap-2">
              <div className="leading-tight">
                <p className="text-sm font-semibold text-primary">
                  {selectedChat.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <DropdownMenu
                trigger={
                  <IconButton
                    label="Conversation options"
                    size="sm"
                    icon={
                      <MoreHorizontal className="size-4" strokeWidth={1.75} />
                    }
                  />
                }
                items={chatMenuItems}
              />
              <IconButton
                label="Toggle scope panel"
                size="sm"
                onClick={() => setKnowledgeOpen((value) => !value)}
                icon={<PanelRight className="size-4" strokeWidth={1.75} />}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={createChat}
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

          <div className="flex min-h-0 flex-1">
            <section className="flex min-w-0 flex-1 flex-col">
              <ChatConversation
                key={selectedChat.id}
                campaign={campaign}
                messages={selectedChat.messages}
                onMessagesChange={(updater) =>
                  updateChatMessages(selectedChat.id, updater)
                }
              />
            </section>

            {knowledgeOpen && (
              <KnowledgeColumn
                campaign={campaign}
                files={files}
                refreshing={refreshing}
                onUpload={uploadFiles}
                onCreateFolder={createFolder}
                onRefresh={refreshFiles}
              />
            )}
          </div>
        </div>
      </div>

      <NamePromptModal
        open={renamingChat != null}
        title="Rename chat"
        placeholder="Chat title"
        submitLabel="Rename"
        initialValue={renamingChat?.title ?? ''}
        onClose={() => setRenamingChatId(null)}
        onSubmit={(title) => {
          if (renamingChatId) renameChat(renamingChatId, title)
        }}
      />
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Check, ChevronDown, Paperclip, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Kicker } from '@/design-system'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'
import type { Campaign, ChatMessage } from '@/data/types'
import { ExperimentalistOrb } from './ExperimentalistOrb'
import { PlanVariantsExplorer } from './PlanVariantsExplorer'
import { DropdownMenu } from './DropdownMenu'
import { composeReply } from './agentScript'

const SUGGESTIONS = [
  'Where do my goals stand?',
  'What should I focus on next?',
]

const VARIANTS_SUGGESTION = 'Explore alternative designs'

let messageSeq = 0
function nextId() {
  messageSeq += 1
  return `local-${messageSeq}`
}

function ApprovalToggle() {
  const [auto, setAuto] = useState(true)
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="font-medium text-secondary">Require approval</span>
      <button
        type="button"
        role="switch"
        aria-checked={auto}
        aria-label="Toggle auto-approval"
        onClick={() => setAuto((value) => !value)}
        className={cn(
          'relative h-4.5 w-8 shrink-0 rounded-full transition-colors duration-150 ease-smooth',
          auto ? 'bg-action' : 'bg-edge-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-3.5 rounded-full bg-white shadow-xs transition-[left] duration-150 ease-smooth',
            auto ? 'left-[15px]' : 'left-0.5',
          )}
        />
      </button>
      <span className="font-medium text-secondary">Auto</span>
    </div>
  )
}

function Attachments({
  names,
  isUser,
}: {
  names: string[]
  isUser: boolean
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {names.map((name) => (
        <span
          key={name}
          className={cn(
            'inline-flex max-w-56 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs',
            isUser ? 'bg-white/15 text-on-action' : 'bg-sunken text-secondary',
          )}
        >
          <Paperclip className="size-3 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{name}</span>
        </span>
      ))}
    </div>
  )
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-primary">{children}</strong>
        ),
        h1: ({ children }) => (
          <h3 className="mt-5 mb-2 text-base font-semibold text-primary first:mt-0">
            {children}
          </h3>
        ),
        h2: ({ children }) => (
          <h3 className="mt-5 mb-2 text-base font-semibold text-primary first:mt-0">
            {children}
          </h3>
        ),
        h3: ({ children }) => (
          <h4 className="mt-4 mb-1.5 text-sm font-semibold text-primary first:mt-0">
            {children}
          </h4>
        ),
        ul: ({ children }) => (
          <ul className="my-2.5 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2.5 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children }) => (
          <code className="rounded-xs bg-sunken px-1 py-0.5 font-mono text-[0.85em]">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="my-2.5 overflow-x-auto rounded-md border border-edge bg-sunken p-3 text-xs first:mt-0 last:mb-0 [&_code]:bg-transparent [&_code]:p-0">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2.5 border-l-2 border-edge-strong pl-3 text-secondary first:mt-0 last:mb-0">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-accent underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-4 border-edge" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.moderate}
        className="flex justify-end"
      >
        <div className="max-w-[78%] whitespace-pre-line rounded-lg bg-action px-3.5 py-2.5 text-sm leading-relaxed text-on-action">
          {message.content}
          {message.attachments && message.attachments.length > 0 && (
            <Attachments names={message.attachments} isUser />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.moderate}
      className="text-sm leading-relaxed text-primary"
    >
      <AssistantMarkdown content={message.content} />
      {message.attachments && message.attachments.length > 0 && (
        <Attachments names={message.attachments} isUser={false} />
      )}
    </motion.div>
  )
}

export function ChatConversation({
  campaign,
  messages,
  onMessagesChange,
}: {
  campaign: Campaign
  messages: ChatMessage[]
  /** Messages live with their chat in the parent so history survives
   *  switching chats; updates are functional so a pending assistant reply
   *  still lands in the right chat. */
  onMessagesChange: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void
}) {
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [focus, setFocus] = useState('Campaign')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, thinking])

  function send(text: string) {
    const content = text.trim()
    if (!content && attachments.length === 0) return
    setDraft('')
    const sentAttachments = attachments
    setAttachments([])
    onMessagesChange((prev) => [
      ...prev,
      {
        id: nextId(),
        role: 'user',
        content: content || `Attached ${sentAttachments.length} file${sentAttachments.length === 1 ? '' : 's'}.`,
        ...(sentAttachments.length > 0 ? { attachments: sentAttachments } : {}),
      },
    ])
    setThinking(true)
    const scripted = composeReply(campaign, content)
    const reply: ChatMessage = {
      id: nextId(),
      role: 'assistant',
      content: scripted.content,
      ...(scripted.attachment ? { attachment: scripted.attachment } : {}),
    }
    // Longer replies "think" a bit longer so the pacing feels like a model.
    const delay = Math.min(2200, 700 + scripted.content.length * 2)
    window.setTimeout(() => {
      onMessagesChange((prev) => [...prev, reply])
      setThinking(false)
    }, delay)
  }

  const isEmpty = messages.length === 0
  const goalCount = campaign.goals.length
  const objectiveLabel = campaign.objective ? 'Objective' : 'No objective'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <ExperimentalistOrb className="size-12" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-primary">
              {campaign.name}
            </h2>
            <p className="mt-2 max-w-md text-md text-secondary">
              {objectiveLabel} and {goalCount} goals loaded. What do you want to
              work on?
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-4">
                  <MessageBubble message={message} />
                  {message.attachment === 'plan-variants' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={spring.moderate}
                    >
                      <PlanVariantsExplorer
                        variants={campaign.planVariants}
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </AnimatePresence>
            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-sm text-tertiary"
              >
                <ExperimentalistOrb className="size-6" />
                <span className="italic">Thinking…</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 px-6 pb-6">
        <div className="mx-auto max-w-3xl">
          {isEmpty && (
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ...SUGGESTIONS,
                ...(campaign.planVariants.length > 0
                  ? [VARIANTS_SUGGESTION]
                  : []),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-edge-strong bg-raised px-3 py-1.5 text-xs font-medium text-secondary shadow-xs transition-colors hover:border-primary hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="mb-2 flex items-center justify-between gap-3">
            <DropdownMenu
              direction="up"
              align="start"
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-secondary transition-colors hover:bg-sunken hover:text-primary"
                >
                  <Kicker>Focus</Kicker>
                  <span className="max-w-48 truncate font-medium text-primary">
                    {focus}
                  </span>
                  <span className="text-tertiary">Change</span>
                  <ChevronDown className="size-3.5 text-tertiary" strokeWidth={1.75} />
                </button>
              }
              items={[
                'Campaign',
                ...campaign.goals.map((goal) => `${goal.code} — ${goal.title}`),
              ].map((option) => ({
                label: option,
                icon:
                  option === focus ? (
                    <Check className="size-3.5 text-action" strokeWidth={2} />
                  ) : (
                    <span className="size-3.5" aria-hidden />
                  ),
                onSelect: () => setFocus(option),
              }))}
            />
            <ApprovalToggle />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              send(draft)
            }}
            className="rounded-lg border border-edge-strong bg-raised p-2 shadow-sm focus-within:border-primary focus-within:outline-1 focus-within:outline-primary"
          >
            {attachments.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5 px-1 pt-1">
                {attachments.map((name) => (
                  <span
                    key={name}
                    className="inline-flex max-w-56 items-center gap-1 rounded-sm border border-edge bg-sunken px-1.5 py-0.5 text-xs text-secondary"
                  >
                    <Paperclip className="size-3 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((item) => item !== name),
                        )
                      }
                      className="text-tertiary transition-colors hover:text-primary"
                    >
                      <X className="size-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                type="button"
                aria-label="Attach file"
                onClick={() => attachInputRef.current?.click()}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-sunken hover:text-secondary"
              >
                <Paperclip className="size-4" strokeWidth={1.75} />
              </button>
              <input
                ref={attachInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const names = Array.from(event.target.files ?? []).map(
                    (file) => file.name,
                  )
                  if (names.length > 0) {
                    setAttachments((prev) => [
                      ...prev,
                      ...names.filter((name) => !prev.includes(name)),
                    ])
                  }
                  event.target.value = ''
                }}
              />
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send(draft)
                  }
                }}
                rows={1}
                placeholder="Ask about goals, next steps, or anything else…"
                className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm text-primary outline-none placeholder:text-tertiary"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() && attachments.length === 0}
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-action text-on-action shadow-xs transition duration-150 ease-smooth hover:bg-action-hover active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowUp className="size-4" strokeWidth={2} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

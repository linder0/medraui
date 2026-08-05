'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, ChevronDown, Paperclip } from 'lucide-react'
import { Kicker } from '@/design-system'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/cn'
import type { Campaign, ChatMessage } from '@/data/types'
import { ExperimentalistOrb } from './ExperimentalistOrb'

const SUGGESTIONS = [
  'Where do my goals stand?',
  'What should I focus on next?',
]

/** Canned Experimentalist replies — placeholder until a real model is wired
 *  in. Rotates so repeated sends don't echo the same line. */
const REPLIES = [
  'Got it. I\u2019ll pull the campaign context and knowledge base, then propose a first set of goals for you to approve.',
  'Here\u2019s how I\u2019d sequence this: confirm the objective, draft 2\u20133 measurable goals, then outline the assays each goal needs. Sound right?',
  'I can turn that into a concrete plan. Want me to draft goals now, or review the indexed files first?',
]

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

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.moderate}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && <ExperimentalistOrb className="mt-0.5 size-6" />}
      <div
        className={cn(
          'max-w-[78%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-action text-on-action'
            : 'border border-edge bg-raised text-primary shadow-xs',
        )}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

export function ChatConversation({
  campaign,
  initialMessages,
}: {
  campaign: Campaign
  initialMessages: ChatMessage[]
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyIndex = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, thinking])

  function send(text: string) {
    const content = text.trim()
    if (!content) return
    setDraft('')
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', content },
    ])
    setThinking(true)
    const reply = REPLIES[replyIndex.current % REPLIES.length]!
    replyIndex.current += 1
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: reply },
      ])
      setThinking(false)
    }, 750)
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
                <MessageBubble key={message.id} message={message} />
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
              {SUGGESTIONS.map((suggestion) => (
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
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-secondary transition-colors hover:bg-sunken hover:text-primary"
            >
              <Kicker>Focus</Kicker>
              <span className="font-medium text-primary">Campaign</span>
              <span className="text-tertiary">Change</span>
              <ChevronDown className="size-3.5 text-tertiary" strokeWidth={1.75} />
            </button>
            <ApprovalToggle />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              send(draft)
            }}
            className="flex items-end gap-2 rounded-lg border border-edge-strong bg-raised p-2 shadow-sm focus-within:border-primary focus-within:outline-1 focus-within:outline-primary"
          >
            <button
              type="button"
              aria-label="Attach file"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-tertiary transition-colors hover:bg-sunken hover:text-secondary"
            >
              <Paperclip className="size-4" strokeWidth={1.75} />
            </button>
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
              disabled={!draft.trim()}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-action text-on-action shadow-xs transition duration-150 ease-smooth hover:bg-action-hover active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowUp className="size-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

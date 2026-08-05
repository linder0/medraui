'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Campaign } from '@/data/types'

interface ExperimentalistContextValue {
  campaign: Campaign
  open: boolean
  openExperimentalist: () => void
  close: () => void
}

const ExperimentalistContext = createContext<ExperimentalistContextValue | null>(
  null,
)

/**
 * Holds the open/closed state for the AI Experimentalist overlay so any
 * trigger inside a campaign (overview action card, context panel) can open
 * it, and the overlay itself can read the campaign it belongs to.
 */
export function ExperimentalistProvider({
  campaign,
  children,
}: {
  campaign: Campaign
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  const openExperimentalist = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ campaign, open, openExperimentalist, close }),
    [campaign, open, openExperimentalist, close],
  )

  return (
    <ExperimentalistContext.Provider value={value}>
      {children}
    </ExperimentalistContext.Provider>
  )
}

export function useExperimentalist(): ExperimentalistContextValue {
  const value = useContext(ExperimentalistContext)
  if (!value) {
    throw new Error(
      'useExperimentalist must be used within an ExperimentalistProvider',
    )
  }
  return value
}

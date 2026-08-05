'use client'

import { Button, type ButtonProps } from '@/design-system'
import { useExperimentalist } from './ExperimentalistContext'

/**
 * Any button that should open the AI Experimentalist overlay. Thin wrapper
 * around the design-system Button so server components can drop it in without
 * touching client state directly.
 */
export function ExperimentalistTrigger(props: ButtonProps) {
  const { openExperimentalist } = useExperimentalist()
  return <Button onClick={openExperimentalist} {...props} />
}

import { MedraMark } from '@/design-system'
import { cn } from '@/lib/cn'

/**
 * The presence that stands in for the AI Experimentalist — the Medra "M"
 * mark. Sized by the caller.
 */
export function ExperimentalistOrb({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
    >
      <MedraMark className="relative w-full text-primary" />
    </span>
  )
}

import { MedraMark } from '@/design-system'
import { cn } from '@/lib/cn'

/**
 * The presence that stands in for the AI Experimentalist — the Medra "M"
 * mark with a soft breathing glow behind it, a la Claude's asterisk.
 * Sized by the caller.
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
      <span className="absolute inset-0 animate-ping rounded-full bg-[var(--medra-glow-peach)] opacity-40 [animation-duration:2.4s]" />
      <MedraMark className="relative w-full text-primary" />
    </span>
  )
}

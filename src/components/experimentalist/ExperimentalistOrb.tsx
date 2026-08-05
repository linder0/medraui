import { cn } from '@/lib/cn'

/**
 * The warm little presence that stands in for the AI Experimentalist —
 * a soft peach orb with a slow breathing glow. Sized by the caller.
 */
export function ExperimentalistOrb({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full',
        className,
      )}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[var(--medra-glow-peach)] opacity-40 [animation-duration:2.4s]" />
      <span className="relative size-full rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--medra-glow-peach),var(--medra-glow-rose))] shadow-sm" />
    </span>
  )
}

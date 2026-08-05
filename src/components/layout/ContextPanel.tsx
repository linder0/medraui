import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Secondary panel that sits between the sidebar and page content
 * (e.g. campaign navigation). Header / body / footer are slots so
 * any feature can compose its own panel.
 */
export function ContextPanel({
  header,
  children,
  footer,
  className,
}: {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <aside
      className={cn(
        'flex h-full w-(--layout-context-panel-width) shrink-0 flex-col border-r border-edge bg-panel',
        className,
      )}
    >
      {header && <div className="shrink-0 border-b border-edge p-3">{header}</div>}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3">{children}</div>
      {footer && <div className="shrink-0 p-3">{footer}</div>}
    </aside>
  )
}

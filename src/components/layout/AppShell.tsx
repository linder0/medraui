import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

/**
 * Top-level frame: dark sidebar + routed content.
 * Pages render inside the scrollable content region as children.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

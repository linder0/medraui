import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { Sidebar } from './Sidebar'
import { SIDEBAR_COLLAPSED_COOKIE } from './sidebar-cookie'

/**
 * Top-level frame: dark sidebar + routed content.
 * Pages render inside the scrollable content region as children.
 * The sidebar's collapsed state is read from a cookie so a refresh
 * server-renders the correct state with no flash.
 */
export async function AppShell({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const sidebarCollapsed =
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === 'true'

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar initialCollapsed={sidebarCollapsed} />
      <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

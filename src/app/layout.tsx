import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import '@/index.css'

export const metadata: Metadata = {
  title: 'Medra — Physical AI Scientist Platform',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

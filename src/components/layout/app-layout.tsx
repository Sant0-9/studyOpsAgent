'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 bg-card">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto md:ml-60">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-80 bg-card">
        <Sidebar />
      </div>
      <main className="md:pl-60">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

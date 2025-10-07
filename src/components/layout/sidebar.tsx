'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Settings,
  FileText,
  Clock,
  Bug,
  Brain,
  BarChart3,
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-sky-500',
  },
  {
    label: 'Assignments',
    icon: BookOpen,
    href: '/assignments',
    color: 'text-violet-500',
  },
  {
    label: 'Study Sessions',
    icon: Clock,
    href: '/study',
    color: 'text-pink-700',
  },
  {
    label: 'Materials',
    icon: FileText,
    href: '/materials',
    color: 'text-orange-700',
  },
  {
    label: 'Error Log',
    icon: Bug,
    href: '/errors',
    color: 'text-red-700',
  },
  {
    label: 'Concepts',
    icon: Brain,
    href: '/concepts',
    color: 'text-emerald-500',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-yellow-700',
  },
  {
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar',
    color: 'text-blue-600',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-700',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg" />
            </div>
            <h1 className="text-xl font-bold">StudyOps</h1>
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition',
                pathname === route.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

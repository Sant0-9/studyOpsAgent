import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'StudyOps Agent | Your AI-Powered Study Companion',
    template: '%s | StudyOps Agent',
  },
  description:
    'A comprehensive study and assignment management platform designed to help students track assignments, manage study sessions, analyze errors, and master concepts through intelligent tracking and AI assistance.',
  keywords: [
    'study management',
    'assignment tracker',
    'student productivity',
    'study planner',
    'education',
  ],
  authors: [{ name: 'StudyOps Team' }],
  creator: 'StudyOps Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://studyops.app',
    siteName: 'StudyOps Agent',
    title: 'StudyOps Agent | Your AI-Powered Study Companion',
    description:
      'Track assignments, manage study sessions, and master concepts with intelligent tracking.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyOps Agent',
    description: 'Your AI-Powered Study Companion for Academic Excellence',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

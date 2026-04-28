import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = { 
  title: 'EduFlow LMS - Modern Learning Management System',
  description: 'A comprehensive learning management system for students, teachers, and administrators with modern UI/UX design',
  keywords: 'learning management system, LMS, education, online learning, student management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <DashboardLayout userRole="admin" userName="Admin User">
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: 'admin' | 'teacher' | 'student'
}

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: number
}

const Sidebar = ({ isOpen, onClose, userRole = 'admin' }: SidebarProps) => {
  const pathname = usePathname()

  const getNavItems = (): NavItem[] => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    ]

    switch (userRole) {
      case 'admin':
        return [
          ...baseItems,
          { href: '/admin/users', label: 'Users', icon: '👥', badge: 12 },
          { href: '/admin/courses', label: 'Courses', icon: '📚', badge: 8 },
          { href: '/admin/create-user', label: 'Create User', icon: '➕' },
          { href: '/admin/announce', label: 'Announcements', icon: '📢' },
        ]
      case 'teacher':
        return [
          ...baseItems,
          { href: '/teacher/courses', label: 'My Courses', icon: '📖' },
          { href: '/teacher/assignments', label: 'Assignments', icon: '📝' },
          { href: '/teacher/profile', label: 'Profile', icon: '👤' },
        ]
      case 'student':
        return [
          ...baseItems,
          { href: '/student/courses', label: 'My Courses', icon: '📖' },
          { href: '/student/assignments', label: 'Assignments', icon: '📝' },
          { href: '/student/grades', label: 'Grades', icon: '📈' },
          { href: '/student/profile', label: 'Profile', icon: '👤' },
        ]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/admin' || pathname === '/teacher' || pathname === '/student'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          'md:translate-x-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LMS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EduFlow</h1>
              <p className="text-xs text-gray-500">Learning System</p>
            </div>
          </Link>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:bg-primary-50 hover:text-primary-700',
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Settings & Logout */}
          <div className="px-4 space-y-1">
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
            <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full">
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">{userRole}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
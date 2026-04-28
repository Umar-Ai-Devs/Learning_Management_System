'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card } from '@/components/ui'
import Button from '@/components/ui/Button'
import api from '@/lib/api'

interface DashboardStats {
  users: {
    total_students: number
    total_teachers: number
    total_admins: number
    active_users: number
  }
  courses: {
    total_courses: number
    active_courses: number
  }
  enrollments: {
    total_enrollments: number
    active_enrollments: number
  }
  assignments: {
    total_assignments: number
    upcoming_assignments: number
  }
  submissions: {
    total_submissions: number
    graded_submissions: number
    pending_grading: number
  }
}

interface RecentUser {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface RecentCourse {
  id: number
  title: string
  code: string
  teacher_name: string
  created_at: string
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'indigo'
  trend?: {
    value: number
    label: string
  }
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    error: 'bg-error-50 text-error-600 border-error-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  }

  const iconBg = {
    primary: 'bg-primary-100',
    success: 'bg-success-100',
    warning: 'bg-warning-100',
    error: 'bg-error-100',
    indigo: 'bg-indigo-100',
  }

  return (
    <Card className={`${colors[color]} border-2 p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.value > 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

const RecentActivityCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {children}
    </div>
  </Card>
)

const ActivityItem = ({ name, email, role, created_at }: RecentUser) => {
  const roleColors = {
    student: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <span className="text-primary-600 font-medium text-sm">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-sm text-gray-500 truncate">{email}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    </div>
  )
}

const CourseItem = ({ title, code, teacher_name, created_at }: RecentCourse) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
      <span className="text-warning-600 text-sm">📚</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
      <p className="text-sm text-gray-500 truncate">{code}</p>
      <p className="text-xs text-gray-400">by {teacher_name}</p>
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard')
        const data = response.data
        
        setStats(data.statistics)
        setRecentUsers(data.recent_activities?.recent_students || [])
        setRecentCourses(data.recent_activities?.recent_courses || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute role="admin">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute role="admin">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and recent activity</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Students"
                value={stats.users.total_students}
                icon="🎓"
                color="primary"
                trend={{ value: 12, label: 'vs last month' }}
              />
              <StatCard
                title="Total Teachers"
                value={stats.users.total_teachers}
                icon="👨‍🏫"
                color="success"
                trend={{ value: 8, label: 'vs last month' }}
              />
              <StatCard
                title="Active Users"
                value={stats.users.active_users}
                icon="✅"
                color="warning"
                trend={{ value: 15, label: 'online now' }}
              />
              <StatCard
                title="Total Admins"
                value={stats.users.total_admins}
                icon="🛡️"
                color="indigo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Courses"
                value={stats.courses.total_courses}
                icon="📚"
                color="primary"
                trend={{ value: 5, label: 'new this week' }}
              />
              <StatCard
                title="Active Enrollments"
                value={stats.enrollments.active_enrollments}
                icon="📋"
                color="success"
                trend={{ value: 23, label: 'active now' }}
              />
              <StatCard
                title="Upcoming Assignments"
                value={stats.assignments.upcoming_assignments}
                icon="📝"
                color="warning"
                trend={{ value: -5, label: 'due this week' }}
              />
              <StatCard
                title="Pending Grading"
                value={stats.submissions.pending_grading}
                icon="⏳"
                color="error"
                trend={{ value: 18, label: 'needs attention' }}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecentActivityCard title="Recent Students">
                {recentUsers.filter(user => user.role === 'student').slice(0, 5).map((user) => (
                  <ActivityItem key={user.id} {...user} />
                ))}
                {recentUsers.filter(user => user.role === 'student').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent students</p>
                )}
              </RecentActivityCard>

              <RecentActivityCard title="Recent Teachers">
                {recentUsers.filter(user => user.role === 'teacher').slice(0, 5).map((user) => (
                  <ActivityItem key={user.id} {...user} />
                ))}
                {recentUsers.filter(user => user.role === 'teacher').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent teachers</p>
                )}
              </RecentActivityCard>

              <RecentActivityCard title="Recent Courses">
                {recentCourses.slice(0, 5).map((course) => (
                  <CourseItem key={course.id} {...course} />
                ))}
                {recentCourses.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent courses</p>
                )}
              </RecentActivityCard>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start">
                  <span className="mr-2">➕</span>
                  Create User
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="mr-2">📚</span>
                  Add Course
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="mr-2">📝</span>
                  Create Assignment
                </Button>
                <Button variant="outline" className="justify-start">
                  <span className="mr-2">📢</span>
                  Send Announcement
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, StatCard, Card } from '@/components/ui';
import api from '@/lib/api';

interface DashStats {
  users: { total_students: number; total_teachers: number; total_admins: number; active_users: number };
  courses: { total_courses: number; active_courses: number };
  enrollments: { total_enrollments: number; active_enrollments: number };
  assignments: { total_assignments: number; upcoming_assignments: number };
  submissions: { total_submissions: number; graded_submissions: number; pending_grading: number };
}
interface RecentUser { id: number; name: string; email: string; created_at: string; }
interface RecentCourse { id: number; title: string; code: string; created_at: string; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recent, setRecent] = useState<{ recent_students: RecentUser[]; recent_teachers: RecentUser[]; recent_courses: RecentCourse[] } | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setStats(r.data.statistics); setRecent(r.data.recent_activities); });
  }, []);

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="Admin Dashboard" subtitle="System overview and recent activity" />
      {stats && (
        <>
          <div className="stat-grid">
            <StatCard label="Total Students" value={stats.users.total_students} icon="🎓" color="#6366f1" />
            <StatCard label="Total Teachers" value={stats.users.total_teachers} icon="👨‍🏫" color="#10b981" />
            <StatCard label="Active Users" value={stats.users.active_users} icon="✅" color="#f59e0b" />
            <StatCard label="Total Admins" value={stats.users.total_admins} icon="🛡" color="#ec4899" />
          </div>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <StatCard label="Total Courses" value={stats.courses.total_courses} icon="📚" color="#8b5cf6" />
            <StatCard label="Active Enrollments" value={stats.enrollments.active_enrollments} icon="📋" color="#06b6d4" />
            <StatCard label="Upcoming Assignments" value={stats.assignments.upcoming_assignments} icon="📝" color="#f59e0b" />
            <StatCard label="Pending Grading" value={stats.submissions.pending_grading} icon="⏳" color="#ef4444" />
          </div>

          {recent && (
            <div className="stat-grid" style={{ marginTop: 24 }}>
              <Card>
                <h3 style={s.sh}>Recent Students</h3>
                {recent.recent_students.map(u => (
                  <div key={u.id} style={s.recentRow}>
                    <div style={s.recentAvatar}>{u.name[0]}</div>
                    <div>
                      <div style={s.recentName}>{u.name}</div>
                      <div style={s.recentSub}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <h3 style={s.sh}>Recent Teachers</h3>
                {recent.recent_teachers.map(u => (
                  <div key={u.id} style={s.recentRow}>
                    <div style={{ ...s.recentAvatar, background: '#d1fae5', color: '#10b981' }}>{u.name[0]}</div>
                    <div>
                      <div style={s.recentName}>{u.name}</div>
                      <div style={s.recentSub}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <h3 style={s.sh}>Recent Courses</h3>
                {recent.recent_courses.map(c => (
                  <div key={c.id} style={s.recentRow}>
                    <div style={{ ...s.recentAvatar, background: '#fef3c7', color: '#f59e0b' }}>📚</div>
                    <div>
                      <div style={s.recentName}>{c.title}</div>
                      <div style={s.recentSub}>{c.code}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </>
      )}
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  sh: { margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#64748b' },
  recentRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  recentAvatar: { width: 36, height: 36, borderRadius: 10, background: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  recentName: { fontSize: 13, color: '#0f172a', fontWeight: 500 },
  recentSub: { fontSize: 11, color: '#64748b' },
};

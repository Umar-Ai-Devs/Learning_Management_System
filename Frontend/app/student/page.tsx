'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, StatCard, Card } from '@/components/ui';
import api from '@/lib/api';

export default function StudentDashboard() {
  const [data, setData] = useState<{ message: string; user: Record<string, unknown> } | null>(null);
  const [grades, setGrades] = useState<{ gpa: number; total_courses: number; grades: unknown[] } | null>(null);

  useEffect(() => {
    api.get('/student/dashboard').then(r => setData(r.data));
    api.get('/student/grades').then(r => setGrades(r.data));
  }, []);

  const user = data?.user;

  return (
    <ProtectedRoute role="student">
      <PageHeader title={data?.message || 'Student Dashboard'} subtitle="Your academic overview" />
      {grades && (
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="GPA" value={grades.gpa.toFixed(2)} icon="⭐" color="#f59e0b" />
          <StatCard label="Enrolled Courses" value={grades.total_courses} icon="📚" color="#6366f1" />
          <StatCard label="Graded Courses" value={(grades.grades as Array<{ grade: string | null }>).filter(g => g.grade).length} icon="✅" color="#10b981" />
        </div>
      )}
      {user && (
        <Card style={{ maxWidth: '100%' }}>
          <h3 style={s.sh}>My Info</h3>
          {(['name','email','roll_number','semester','department','phone'] as const).map(k =>
            user[k] != null && (
              <div key={k} style={s.row}>
                <span style={s.key}>{k.replace(/_/g,' ')}</span>
                <span style={s.val}>{String(user[k])}</span>
              </div>
            )
          )}
        </Card>
      )}
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  sh: { margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#64748b' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, flexWrap: 'wrap', gap: 8 },
  key: { color: '#64748b', textTransform: 'capitalize', minWidth: '100px' },
  val: { color: '#0f172a', fontWeight: 500 },
};

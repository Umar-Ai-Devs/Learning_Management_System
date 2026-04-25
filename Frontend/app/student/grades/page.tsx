'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, StatCard } from '@/components/ui';
import api from '@/lib/api';

interface Grade { course_id: number; course_title: string; course_code: string; grade: string | null; status: string; }

const gradeColor: Record<string, string> = { A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#f97316', F: '#ef4444' };

export default function StudentGrades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/student/grades').then(r => { setGrades(r.data.grades); setGpa(r.data.gpa); setTotal(r.data.total_courses); });
  }, []);

  const graded = grades.filter(g => g.grade);

  return (
    <ProtectedRoute role="student">
      <PageHeader title="My Grades" subtitle="Academic performance overview" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="GPA" value={gpa.toFixed(2)} icon="⭐" color="#f59e0b" />
        <StatCard label="Total Courses" value={total} icon="📚" color="#6366f1" />
        <StatCard label="Graded Courses" value={graded.length} icon="✅" color="#10b981" />
      </div>

      <Table headers={['Course', 'Code', 'Grade', 'Status']}>
        {grades.map(g => (
          <tr key={g.course_id}>
            <Td><span style={{ color: '#0f172a', fontWeight: 500 }}>{g.course_title}</span></Td>
            <Td><Badge label={g.course_code} color="#8b5cf6" /></Td>
            <Td>
              {g.grade
                ? <span style={{ fontSize: 22, fontWeight: 700, color: gradeColor[g.grade] || '#0f172a' }}>{g.grade}</span>
                : <span style={{ color: '#94a3b8', fontSize: 13 }}>Not graded</span>}
            </Td>
            <Td><Badge label={g.status} color={g.status === 'active' ? '#10b981' : g.status === 'dropped' ? '#ef4444' : '#6366f1'} /></Td>
          </tr>
        ))}
      </Table>
    </ProtectedRoute>
  );
}

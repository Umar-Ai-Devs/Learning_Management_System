'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge } from '@/components/ui';
import api from '@/lib/api';

interface Course { id: number; title: string; code: string; credits: number; is_active: boolean; enrollment_count: number; active_enrollments: number; assignment_count: number; teacher_name?: string; }

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data.courses)); }, []);

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="All Courses" subtitle={`${courses.length} courses in system`} />
      <Table headers={['Course', 'Code', 'Credits', 'Teacher', 'Enrollments', 'Assignments', 'Status']}>
        {courses.map(c => (
          <tr key={c.id}>
            <Td><span style={{ color: '#0f172a', fontWeight: 500 }}>{c.title}</span></Td>
            <Td><Badge label={c.code} color="#8b5cf6" /></Td>
            <Td>{c.credits}</Td>
            <Td>{c.teacher_name || '-'}</Td>
            <Td>
              <span style={{ color: '#e2e8f0' }}>{c.active_enrollments}</span>
              <span style={{ color: '#475569', fontSize: 11 }}> / {c.enrollment_count} total</span>
            </Td>
            <Td>{c.assignment_count}</Td>
            <Td><Badge label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? '#10b981' : '#ef4444'} /></Td>
          </tr>
        ))}
      </Table>
    </ProtectedRoute>
  );
}

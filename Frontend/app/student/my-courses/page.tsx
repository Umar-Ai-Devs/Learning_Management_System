'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge } from '@/components/ui';
import api from '@/lib/api';

interface Course { id: number; title: string; code: string; credits: number; teacher_name?: string; }

export default function StudentMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => { api.get('/student/my-courses').then(r => setCourses(r.data.courses)); }, []);

  return (
    <ProtectedRoute role="student">
      <PageHeader title="My Enrolled Courses" subtitle={`${courses.length} active enrollments`} />
      <Table headers={['Course', 'Code', 'Credits', 'Teacher']}>
        {courses.map(c => (
          <tr key={c.id}>
            <Td><span style={{ color: '#e2e8f0', fontWeight: 500 }}>{c.title}</span></Td>
            <Td><Badge label={c.code} color="#8b5cf6" /></Td>
            <Td>{c.credits} cr</Td>
            <Td>{c.teacher_name || '-'}</Td>
          </tr>
        ))}
        {courses.length === 0 && (
          <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: 32, fontSize: 13 }}>No enrolled courses yet. Go to All Courses to enroll.</td></tr>
        )}
      </Table>
    </ProtectedRoute>
  );
}

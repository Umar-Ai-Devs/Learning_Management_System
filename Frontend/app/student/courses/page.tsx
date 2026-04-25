'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, Alert } from '@/components/ui';
import api from '@/lib/api';

interface Course { id: number; title: string; code: string; credits: number; is_enrolled: boolean; teacher_name?: string; description?: string; }

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/student/courses').then(r => setCourses(r.data.courses));
  useEffect(() => { load(); }, []);

  const enroll = async (id: number) => {
    setMsg(''); setErr('');
    try { const r = await api.post(`/student/courses/enroll/${id}`); setMsg(r.data.message); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const drop = async (id: number) => {
    if (!confirm('Drop this course?')) return;
    setMsg(''); setErr('');
    try { const r = await api.delete(`/student/courses/drop/${id}`); setMsg(r.data.message); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const enrolled = courses.filter(c => c.is_enrolled);
  const available = courses.filter(c => !c.is_enrolled);

  return (
    <ProtectedRoute role="student">
      <PageHeader title="All Courses" subtitle={`${enrolled.length} enrolled · ${available.length} available`} />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />
      <Table headers={['Course', 'Code', 'Credits', 'Teacher', 'Status', 'Action']}>
        {courses.map(c => (
          <tr key={c.id}>
            <Td>
              <div style={{ color: '#0f172a', fontWeight: 500 }}>{c.title}</div>
              {c.description && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{c.description.slice(0, 50)}</div>}
            </Td>
            <Td><Badge label={c.code} color="#8b5cf6" /></Td>
            <Td>{c.credits} cr</Td>
            <Td>{c.teacher_name || '-'}</Td>
            <Td><Badge label={c.is_enrolled ? 'Enrolled' : 'Available'} color={c.is_enrolled ? '#10b981' : '#475569'} /></Td>
            <Td>
              {c.is_enrolled
                ? <Btn variant="danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => drop(c.id)}>Drop</Btn>
                : <Btn style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => enroll(c.id)}>Enroll</Btn>}
            </Td>
          </tr>
        ))}
      </Table>
    </ProtectedRoute>
  );
}

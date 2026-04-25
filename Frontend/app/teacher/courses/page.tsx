'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, Alert, Modal, Input, Card } from '@/components/ui';
import api from '@/lib/api';

interface Course { id: number; title: string; code: string; credits: number; description: string; is_active: boolean; teacher_name?: string; }
interface StudentRow { student_id: number; name: string; email: string; roll_number: string; semester: number; department: string; grade: string | null; enrollment_date: string; }

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ title: '', code: '', description: '', credits: '3' });
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editData, setEditData] = useState<Partial<Course>>({});
  const [studentsModal, setStudentsModal] = useState<{ course: Course; students: StudentRow[] } | null>(null);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = () => api.get('/teacher/courses').then(r => setCourses(r.data.courses));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      await api.post('/teacher/courses', { ...form, credits: +form.credits });
      setMsg('Course created'); setForm({ title: '', code: '', description: '', credits: '3' }); setShowCreate(false); load();
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const handleUpdate = async () => {
    if (!editCourse) return;
    try { await api.put(`/teacher/courses/${editCourse.id}`, editData); setMsg('Course updated'); setEditCourse(null); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/teacher/courses/${id}`); setMsg('Course deleted'); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const openStudents = async (course: Course) => {
    const r = await api.get(`/teacher/courses/${course.id}/students`);
    setStudentsModal({ course, students: r.data.students });
  };

  const saveGrade = async (courseId: number, studentId: number) => {
    const grade = grades[studentId];
    if (!grade) return;
    try {
      await api.put(`/teacher/courses/${courseId}/students/${studentId}/grade`, { grade });
      setMsg('Grade saved');
      openStudents(studentsModal!.course);
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  return (
    <ProtectedRoute role="teacher">
      <PageHeader
        title="My Courses"
        subtitle={`${courses.length} courses`}
        action={<Btn onClick={() => setShowCreate(true)}>+ New Course</Btn>}
      />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      <Table headers={['Course', 'Code', 'Credits', 'Status', 'Actions']}>
        {courses.map(c => (
          <tr key={c.id}>
            <Td>
              <div style={{ color: '#0f172a', fontWeight: 500 }}>{c.title}</div>
              {c.description && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{c.description.slice(0, 60)}{c.description.length > 60 ? '...' : ''}</div>}
            </Td>
            <Td><Badge label={c.code} color="#8b5cf6" /></Td>
            <Td>{c.credits} cr</Td>
            <Td><Badge label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? '#10b981' : '#ef4444'} /></Td>
            <Td>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openStudents(c)}>Students</Btn>
                <Btn variant="warning" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => { setEditCourse(c); setEditData({ title: c.title, description: c.description, credits: c.credits }); }}>Edit</Btn>
                <Btn variant="danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(c.id)}>Delete</Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Course">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Course Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Introduction to Programming" />
          <Input label="Course Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="CS-101" />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief course description" />
          <Input label="Credits" type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} />
          <Btn type="submit" style={{ marginTop: 8, justifyContent: 'center' }}>Create Course</Btn>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editCourse} onClose={() => setEditCourse(null)} title="Edit Course">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title" value={editData.title ?? ''} onChange={e => setEditData({ ...editData, title: e.target.value })} />
          <Input label="Description" value={editData.description ?? ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
          <Input label="Credits" type="number" value={editData.credits ?? ''} onChange={e => setEditData({ ...editData, credits: +e.target.value })} />
          <Btn onClick={handleUpdate} style={{ marginTop: 8, justifyContent: 'center' }}>Save Changes</Btn>
        </div>
      </Modal>

      {/* Students Modal */}
      <Modal open={!!studentsModal} onClose={() => setStudentsModal(null)} title={`Students — ${studentsModal?.course.title}`}>
        {studentsModal && (
          studentsModal.students.length === 0
            ? <p style={{ color: '#64748b', fontSize: 13 }}>No students enrolled yet.</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {studentsModal.students.map(st => (
                  <div key={st.student_id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{st.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{st.roll_number} · {st.department}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {st.grade && <Badge label={st.grade} color="#10b981" />}
                      <select
                        value={grades[st.student_id] ?? ''}
                        onChange={e => setGrades(g => ({ ...g, [st.student_id]: e.target.value }))}
                        style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: '#0f172a', outline: 'none' }}
                      >
                        <option value="">Grade</option>
                        {['A','B','C','D','F'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <Btn variant="success" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => saveGrade(studentsModal.course.id, st.student_id)}>Save</Btn>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}

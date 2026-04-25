'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, Alert, Modal, Input, Select, Textarea } from '@/components/ui';
import api from '@/lib/api';

interface Assignment { id: number; title: string; description: string; due_date: string; total_points: number; course_id: number; }
interface Course { id: number; title: string; }
interface Submission {
  id: number; student_id: number; student_name: string | null;
  submission_text: string; grade: number | null; feedback: string | null;
  submitted_at: string; assignment_title?: string;
  has_file?: boolean; file_name?: string; file_type?: string; download_url?: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', total_points: '100', course_id: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [subsModal, setSubsModal] = useState<{ assignment: Assignment; submissions: Submission[] } | null>(null);
  const [gradeData, setGradeData] = useState<Record<number, { grade: string; feedback: string }>>({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadAll = () => {
    api.get('/teacher/assignments').then(r => setAssignments(r.data.assignments));
    api.get('/teacher/courses').then(r => setCourses(r.data.courses));
  };
  useEffect(() => { loadAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      await api.post(`/teacher/courses/${form.course_id}/assignments`, { title: form.title, description: form.description, due_date: form.due_date, total_points: +form.total_points });
      setMsg('Assignment created'); setForm({ title: '', description: '', due_date: '', total_points: '100', course_id: '' }); setShowCreate(false); loadAll();
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const openSubmissions = async (a: Assignment) => {
    const r = await api.get(`/teacher/assignments/${a.id}/submissions`);
    setSubsModal({ assignment: a, submissions: r.data.submissions });
  };

  const handleGrade = async (submissionId: number) => {
    const d = gradeData[submissionId];
    if (!d?.grade) return;
    try {
      await api.put(`/teacher/submissions/${submissionId}/grade`, { grade: +d.grade, feedback: d.feedback || '' });
      setMsg('Graded!');
      if (subsModal) openSubmissions(subsModal.assignment);
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const viewFile = (submissionId: number, fileName: string, fileType?: string) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/teacher/submissions/${submissionId}/view`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objUrl = URL.createObjectURL(blob);
        if (fileType === 'application/pdf') {
          window.open(objUrl, '_blank');
        } else {
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(objUrl);
        }
      });
  };

  const isOverdue = (d: string) => new Date(d) < new Date();

  return (
    <ProtectedRoute role="teacher">
      <PageHeader
        title="Assignments"
        subtitle={`${assignments.length} assignments`}
        action={<Btn onClick={() => setShowCreate(true)}>+ New Assignment</Btn>}
      />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      <Table headers={['Title', 'Course', 'Due Date', 'Points', 'Actions']}>
        {assignments.map(a => (
          <tr key={a.id}>
            <Td>
              <div style={{ color: '#0f172a', fontWeight: 500 }}>{a.title}</div>
              {a.description && <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{a.description.slice(0, 50)}...</div>}
            </Td>
            <Td>{courses.find(c => c.id === a.course_id)?.title || `Course #${a.course_id}`}</Td>
            <Td>
              <span style={{ color: isOverdue(a.due_date) ? '#dc2626' : '#0f172a', fontSize: 13 }}>
                {new Date(a.due_date).toLocaleDateString()}
              </span>
              {isOverdue(a.due_date) && <span style={{ marginLeft: 6 }}><Badge label="Overdue" color="#ef4444" /></span>}
            </Td>
            <Td>{a.total_points} pts</Td>
            <Td>
              <Btn variant="ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => openSubmissions(a)}>
                View Submissions
              </Btn>
            </Td>
          </tr>
        ))}
      </Table>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Course" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} required>
            <option value="">Select a course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Assignment title" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Assignment instructions..." rows={3} />
          <Input label="Due Date & Time" type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
          <Input label="Total Points" type="number" value={form.total_points} onChange={e => setForm({ ...form, total_points: e.target.value })} />
          <Btn type="submit" style={{ marginTop: 8, justifyContent: 'center' }}>Create Assignment</Btn>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal open={!!subsModal} onClose={() => setSubsModal(null)} title={`Submissions — ${subsModal?.assignment.title}`}>
        {subsModal && (
          subsModal.submissions.length === 0
            ? <p style={{ color: '#64748b', fontSize: 13 }}>No submissions yet.</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {subsModal.submissions.map(sub => (
                  <div key={sub.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sub.student_name || `Student #${sub.student_id}`}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {sub.grade != null && <Badge label={`${sub.grade} pts`} color="#10b981" />}
                        <span style={{ fontSize: 11, color: '#64748b' }}>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>
                    {sub.submission_text && <p style={{ fontSize: 12, color: '#475569', margin: '0 0 8px', background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>{sub.submission_text}</p>}
                    {sub.has_file && sub.file_name && (
                      <div style={{ marginBottom: 8 }}>
                        <Btn variant="ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => viewFile(sub.id, sub.file_name!, sub.file_type)}>
                          📎 {sub.file_name}
                        </Btn>
                      </div>
                    )}
                    {sub.feedback && <p style={{ fontSize: 12, color: '#16a34a', margin: '0 0 12px' }}>Feedback: {sub.feedback}</p>}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Score (0-100)"
                        value={gradeData[sub.id]?.grade ?? ''}
                        onChange={e => setGradeData(g => ({ ...g, [sub.id]: { ...g[sub.id], grade: e.target.value } }))}
                        style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#0f172a', outline: 'none', width: 120 }}
                      />
                      <input
                        placeholder="Feedback (optional)"
                        value={gradeData[sub.id]?.feedback ?? ''}
                        onChange={e => setGradeData(g => ({ ...g, [sub.id]: { ...g[sub.id], feedback: e.target.value } }))}
                        style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#0f172a', outline: 'none', flex: 1 }}
                      />
                      <Btn variant="success" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleGrade(sub.id)}>Grade</Btn>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}

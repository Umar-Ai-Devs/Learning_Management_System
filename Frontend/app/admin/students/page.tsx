'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, SearchBar, Alert, Modal, Input } from '@/components/ui';
import api from '@/lib/api';

interface Student {
  id: number; name: string; email: string; roll_number: string; semester: number;
  department: string; is_active: boolean; total_courses: number; average_grade: number | null;
  total_submissions: number; graded_submissions: number;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [detailStudent, setDetailStudent] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = (q = '') => api.get(`/admin/students${q ? `?search=${q}` : ''}`).then(r => setStudents(r.data.students));
  useEffect(() => { load(); }, []);

  const openDetail = async (id: number) => {
    const r = await api.get(`/admin/students/${id}`);
    setDetailStudent(r.data);
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    try {
      await api.put(`/admin/students/${editStudent.id}`, editData);
      setMsg('Student updated'); setEditStudent(null); load();
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this student?')) return;
    try { await api.delete(`/admin/students/${id}`); setMsg('Student deleted'); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="Students" subtitle={`${students.length} students enrolled`} />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />
      <SearchBar value={search} onChange={setSearch} onSearch={() => load(search)} placeholder="Search by name, email or roll number..." />

      <Table headers={['Student', 'Roll No', 'Dept', 'Sem', 'Courses', 'Avg Grade', 'Status', 'Actions']}>
        {students.map(st => (
          <tr key={st.id}>
            <Td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{st.name[0]}</div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 500, fontSize: 13 }}>{st.name}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{st.email}</div>
                </div>
              </div>
            </Td>
            <Td>{st.roll_number || '-'}</Td>
            <Td>{st.department || '-'}</Td>
            <Td>{st.semester || '-'}</Td>
            <Td>{st.total_courses}</Td>
            <Td>{st.average_grade != null ? st.average_grade.toFixed(2) : '-'}</Td>
            <Td><Badge label={st.is_active ? 'Active' : 'Inactive'} color={st.is_active ? '#10b981' : '#ef4444'} /></Td>
            <Td>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openDetail(st.id)}>View</Btn>
                <Btn variant="warning" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => { setEditStudent(st); setEditData({ name: st.name, email: st.email, roll_number: st.roll_number, semester: st.semester, department: st.department }); }}>Edit</Btn>
                <Btn variant="danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(st.id)}>Del</Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      {/* Edit Modal */}
      <Modal open={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Name" value={editData.name ?? ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
          <Input label="Email" type="email" value={editData.email ?? ''} onChange={e => setEditData({ ...editData, email: e.target.value })} />
          <Input label="Roll Number" value={editData.roll_number ?? ''} onChange={e => setEditData({ ...editData, roll_number: e.target.value })} />
          <Input label="Semester" type="number" value={editData.semester ?? ''} onChange={e => setEditData({ ...editData, semester: +e.target.value })} />
          <Input label="Department" value={editData.department ?? ''} onChange={e => setEditData({ ...editData, department: e.target.value })} />
          <Btn onClick={handleUpdate} style={{ marginTop: 8 }}>Save Changes</Btn>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailStudent} onClose={() => setDetailStudent(null)} title="Student Details">
        {detailStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={ds.section}>
              <h4 style={ds.sh}>Basic Info</h4>
              {(['name','email','roll_number','semester','department','phone','address'] as const).map(k => (
                detailStudent[k] != null && <div key={k} style={ds.row}><span style={ds.key}>{k.replace(/_/g,' ')}</span><span style={ds.val}>{String(detailStudent[k])}</span></div>
              ))}
            </div>
            {Array.isArray(detailStudent.enrollments) && detailStudent.enrollments.length > 0 && (
              <div style={ds.section}>
                <h4 style={ds.sh}>Enrollments ({(detailStudent.enrollments as unknown[]).length})</h4>
                {(detailStudent.enrollments as Array<{ course_title: string; grade: string | null; status: string }>).map((e, i) => (
                  <div key={i} style={ds.row}><span style={ds.key}>{e.course_title}</span><span style={ds.val}>{e.grade || e.status}</span></div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}

const ds: Record<string, React.CSSProperties> = {
  section: { background: '#f8fafc', borderRadius: 10, padding: 16 },
  sh: { margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  key: { color: '#64748b', textTransform: 'capitalize' },
  val: { color: '#0f172a', fontWeight: 500 },
};

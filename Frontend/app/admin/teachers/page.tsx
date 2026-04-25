'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, SearchBar, Alert, Modal, Input } from '@/components/ui';
import api from '@/lib/api';

interface Teacher {
  id: number; name: string; email: string; qualification: string; specialization: string;
  is_active: boolean; total_courses: number; total_students_taught: number; pending_grading: number;
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [editData, setEditData] = useState<Partial<Teacher>>({});
  const [detailTeacher, setDetailTeacher] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = (q = '') => api.get(`/admin/teachers${q ? `?search=${q}` : ''}`).then(r => setTeachers(r.data.teachers));
  useEffect(() => { load(); }, []);

  const openDetail = async (id: number) => {
    const r = await api.get(`/admin/teachers/${id}`);
    setDetailTeacher(r.data);
  };

  const handleUpdate = async () => {
    if (!editTeacher) return;
    try {
      await api.put(`/admin/teachers/${editTeacher.id}`, editData);
      setMsg('Teacher updated'); setEditTeacher(null); load();
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this teacher?')) return;
    try { await api.delete(`/admin/teachers/${id}`); setMsg('Teacher deleted'); load(); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="Teachers" subtitle={`${teachers.length} teachers registered`} />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />
      <SearchBar value={search} onChange={setSearch} onSearch={() => load(search)} placeholder="Search by name or email..." />

      <Table headers={['Teacher', 'Qualification', 'Specialization', 'Courses', 'Students', 'Pending', 'Status', 'Actions']}>
        {teachers.map(t => (
          <tr key={t.id}>
            <Td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{t.name[0]}</div>
                <div>
                  <div style={{ color: '#0f172a', fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{t.email}</div>
                </div>
              </div>
            </Td>
            <Td>{t.qualification || '-'}</Td>
            <Td>{t.specialization || '-'}</Td>
            <Td>{t.total_courses}</Td>
            <Td>{t.total_students_taught}</Td>
            <Td>{t.pending_grading > 0 ? <Badge label={String(t.pending_grading)} color="#ef4444" /> : <span style={{ color: '#475569' }}>0</span>}</Td>
            <Td><Badge label={t.is_active ? 'Active' : 'Inactive'} color={t.is_active ? '#10b981' : '#ef4444'} /></Td>
            <Td>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openDetail(t.id)}>View</Btn>
                <Btn variant="warning" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => { setEditTeacher(t); setEditData({ name: t.name, email: t.email, qualification: t.qualification, specialization: t.specialization }); }}>Edit</Btn>
                <Btn variant="danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(t.id)}>Del</Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      <Modal open={!!editTeacher} onClose={() => setEditTeacher(null)} title="Edit Teacher">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Name" value={editData.name ?? ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
          <Input label="Email" type="email" value={editData.email ?? ''} onChange={e => setEditData({ ...editData, email: e.target.value })} />
          <Input label="Qualification" value={editData.qualification ?? ''} onChange={e => setEditData({ ...editData, qualification: e.target.value })} />
          <Input label="Specialization" value={editData.specialization ?? ''} onChange={e => setEditData({ ...editData, specialization: e.target.value })} />
          <Btn onClick={handleUpdate} style={{ marginTop: 8 }}>Save Changes</Btn>
        </div>
      </Modal>

      <Modal open={!!detailTeacher} onClose={() => setDetailTeacher(null)} title="Teacher Details">
        {detailTeacher && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={ds.section}>
              <h4 style={ds.sh}>Basic Info</h4>
              {(['name','email','qualification','specialization'] as const).map(k => (
                detailTeacher[k] != null && <div key={k} style={ds.row}><span style={ds.key}>{k.replace(/_/g,' ')}</span><span style={ds.val}>{String(detailTeacher[k])}</span></div>
              ))}
            </div>
            {Array.isArray(detailTeacher.courses) && (detailTeacher.courses as unknown[]).length > 0 && (
              <div style={ds.section}>
                <h4 style={ds.sh}>Courses ({(detailTeacher.courses as unknown[]).length})</h4>
                {(detailTeacher.courses as Array<{ title: string; enrollment_count: number; is_active: boolean }>).map((c, i) => (
                  <div key={i} style={ds.row}>
                    <span style={ds.key}>{c.title}</span>
                    <span style={ds.val}>{c.enrollment_count} students</span>
                  </div>
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
  sh: { margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  key: { color: '#64748b', textTransform: 'capitalize' },
  val: { color: '#0f172a', fontWeight: 500 },
};

'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, StatCard, Card, Alert, Btn } from '@/components/ui';
import api from '@/lib/api';

export default function TeacherDashboard() {
  const [data, setData] = useState<{ message: string; user: Record<string, unknown> } | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api.get('/teacher/dashboard').then(r => setData(r.data)); }, []);

  const deactivate = async () => {
    if (!confirm('Deactivate your account?')) return;
    try { const r = await api.post('/teacher/deactivate'); setMsg(r.data.message); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const activate = async () => {
    try { const r = await api.post('/teacher/activate'); setMsg(r.data.message); }
    catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const user = data?.user;

  return (
    <ProtectedRoute role="teacher">
      <PageHeader title={data?.message || 'Teacher Dashboard'} subtitle="Manage your courses and students" />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />
      {user && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
          <Card>
            <h3 style={s.sh}>Profile Info</h3>
            {(['name','email','qualification','specialization'] as const).map(k =>
              user[k] != null && (
                <div key={k} style={s.row}>
                  <span style={s.key}>{k.replace(/_/g,' ')}</span>
                  <span style={s.val}>{String(user[k])}</span>
                </div>
              )
            )}
            <div style={s.row}>
              <span style={s.key}>Status</span>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: user.is_active ? '#f0fdf4' : '#fef2f2', color: user.is_active ? '#16a34a' : '#dc2626', border: `1px solid ${user.is_active ? '#bbf7d0' : '#fecaca'}` }}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </Card>
          <Card>
            <h3 style={s.sh}>Account Actions</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Manage your account status. Contact admin to reactivate if deactivated.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn variant="success" onClick={activate}>✓ Activate Account</Btn>
              <Btn variant="danger" onClick={deactivate}>⊘ Deactivate Account</Btn>
            </div>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  sh: { margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#64748b' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  key: { color: '#64748b', textTransform: 'capitalize' },
  val: { color: '#0f172a', fontWeight: 500 },
};

'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Card, Input, Btn, Alert } from '@/components/ui';
import api from '@/lib/api';

interface Profile { name: string; email: string; qualification: string; specialization: string; is_active: boolean; joining_date: string | null; }

export default function TeacherProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/teacher/profile').then(r => {
      setProfile(r.data);
      setProfileForm({ name: r.data.name, email: r.data.email });
    });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const r = await api.put('/teacher/profile', profileForm);
      setProfile(r.data.user); setMsg('Profile updated successfully');
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      await api.post('/auth/change-password', pwForm);
      setMsg('Password changed successfully'); setPwForm({ old_password: '', new_password: '' });
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
  };

  if (!profile) return <ProtectedRoute role="teacher"><p style={{ color: '#64748b' }}>Loading...</p></ProtectedRoute>;

  return (
    <ProtectedRoute role="teacher">
      <PageHeader title="My Profile" subtitle="Manage your account information" />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 860 }}>
        <Card>
          <h3 style={s.sh}>Current Info</h3>
          {[['Name', profile.name], ['Email', profile.email], ['Qualification', profile.qualification || '-'], ['Specialization', profile.specialization || '-'], ['Joined', profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : '-']].map(([k, v]) => (
            <div key={k} style={s.row}>
              <span style={s.key}>{k}</span>
              <span style={s.val}>{v}</span>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <h3 style={s.sh}>Update Profile</h3>
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Name" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
              <Input label="Email" type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
              <Btn type="submit" style={{ justifyContent: 'center' }}>Update Profile</Btn>
            </form>
          </Card>

          <Card>
            <h3 style={s.sh}>Change Password</h3>
            <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Current Password" type="password" value={pwForm.old_password} onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} required />
              <Input label="New Password" type="password" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} required placeholder="Min 6 characters" />
              <Btn type="submit" variant="ghost" style={{ justifyContent: 'center' }}>Change Password</Btn>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  sh: { margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#64748b' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  key: { color: '#64748b' },
  val: { color: '#0f172a', fontWeight: 500 },
};

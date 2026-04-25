'use client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Card, Input, Select, Btn, Alert } from '@/components/ui';
import api from '@/lib/api';

const blank = { name: '', email: '', password: '', role: 'student', roll_number: '', semester: '', department: '', phone: '', address: '', qualification: '', specialization: '' };

export default function CreateUser() {
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true);
    try {
      const res = await api.post('/admin/users/create', form);
      setMsg(res.data.message); setForm(blank);
    } catch (e: unknown) { setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="Create User" subtitle="Add a new student, teacher, or admin" />
      <Card style={{ maxWidth: 520 }}>
        <Alert msg={msg} type="success" />
        <Alert msg={err} type="error" />
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="John Doe" />
          <Input label="Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 6 characters" />
          <Select label="Role" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </Select>

          {form.role === 'student' && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <p style={{ margin: 0, fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 }}>Student Details</p>
              <Input label="Roll Number" value={form.roll_number} onChange={e => set('roll_number', e.target.value)} placeholder="e.g. CS-2024-001" />
              <Input label="Semester" type="number" value={form.semester} onChange={e => set('semester', e.target.value)} placeholder="1-8" />
              <Input label="Department" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" />
              <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 8900" />
              <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="City, Country" />
            </>
          )}

          {form.role === 'teacher' && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <p style={{ margin: 0, fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: 1 }}>Teacher Details</p>
              <Input label="Qualification" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="PhD, MSc, etc." />
              <Input label="Specialization" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="Machine Learning, etc." />
            </>
          )}

          <Btn type="submit" style={{ marginTop: 8, padding: '12px', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating...' : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
          </Btn>
        </form>
      </Card>
    </ProtectedRoute>
  );
}

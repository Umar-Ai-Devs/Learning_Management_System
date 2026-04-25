'use client';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Card, Input, Select, Textarea, Btn, Alert } from '@/components/ui';
import api from '@/lib/api';

export default function AdminAnnounce() {
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; audience: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr(''); setLoading(true); setResult(null);
    try {
      const r = await api.post('/admin/announce', form);
      setMsg(r.data.message);
      setResult({ count: r.data.count, audience: r.data.audience });
      setForm({ title: '', message: '', audience: 'all' });
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="Send Announcement" subtitle="Broadcast a message to users" />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      {result && (
        <div style={s.resultBox}>
          <div style={s.resultIcon}>📢</div>
          <div>
            <div style={s.resultTitle}>Announcement Sent!</div>
            <div style={s.resultSub}>Delivered to <strong>{result.count}</strong> {result.audience === 'all' ? 'users' : result.audience}</div>
          </div>
        </div>
      )}

      <Card style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Announcement Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            placeholder="e.g. System Maintenance Notice"
          />
          <Textarea
            label="Message"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            required
            placeholder="Write your announcement message here..."
            rows={5}
          />
          <Select
            label="Audience"
            value={form.audience}
            onChange={e => setForm({ ...form, audience: e.target.value })}
          >
            <option value="all">All Users</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
          </Select>

          <div style={s.audiencePreview}>
            <span style={s.audienceIcon}>
              {form.audience === 'all' ? '👥' : form.audience === 'students' ? '🎓' : '👨‍🏫'}
            </span>
            <span style={s.audienceText}>
              This announcement will be sent to{' '}
              <strong>{form.audience === 'all' ? 'all active users' : `all active ${form.audience}`}</strong>
            </span>
          </div>

          <Btn type="submit" style={{ justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Sending...' : '📢 Send Announcement'}
          </Btn>
        </form>
      </Card>
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  resultBox:   { display: 'flex', alignItems: 'center', gap: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 },
  resultIcon:  { fontSize: 32 },
  resultTitle: { fontSize: 15, fontWeight: 700, color: '#15803d' },
  resultSub:   { fontSize: 13, color: '#16a34a', marginTop: 2 },
  audiencePreview: { display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' },
  audienceIcon: { fontSize: 20 },
  audienceText: { fontSize: 13, color: '#475569' },
};

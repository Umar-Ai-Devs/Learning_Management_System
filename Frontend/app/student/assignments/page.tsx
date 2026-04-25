'use client';
import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Alert, Badge, Btn, Textarea } from '@/components/ui';
import api from '@/lib/api';

interface Assignment {
  id: number; title: string; description: string; due_date: string;
  total_points: number; is_submitted: boolean; is_overdue: boolean;
  course_id: number; course_title?: string;
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [open, setOpen] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loadErr, setLoadErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr('');
    try {
      const r = await api.get('/student/assignments');
      setAssignments(r.data.assignments ?? []);
    } catch (e: unknown) {
      const errMsg = (e as { response?: { data?: { error?: string }; status?: number } });
      const status = errMsg?.response?.status;
      const text = errMsg?.response?.data?.error || 'Failed to load assignments';
      if (status === 403) {
        setLoadErr('Access denied — make sure you are logged in as a student.');
      } else {
        setLoadErr(text);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (id: number) => {
    setMsg(''); setErr('');
    const text = texts[id];
    const file = files[id];
    if (!text?.trim() && !file) { setErr('Submission text or file is required'); return; }
    setUploading(id);
    try {
      const formData = new FormData();
      if (text?.trim()) formData.append('submission_text', text);
      if (file) formData.append('file', file);
      const r = await api.post(`/student/assignments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg(r.data.message);
      setTexts(t => ({ ...t, [id]: '' }));
      setFiles(f => ({ ...f, [id]: null }));
      setOpen(null);
      load();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Submission failed');
    } finally {
      setUploading(null);
    }
  };

  const pending = assignments.filter(a => !a.is_submitted);
  const submitted = assignments.filter(a => a.is_submitted);

  return (
    <ProtectedRoute role="student">
      <PageHeader
        title="Assignments"
        subtitle={loading ? 'Loading...' : `${pending.length} pending · ${submitted.length} submitted`}
        action={<Btn variant="ghost" onClick={load} style={{ fontSize: 12 }}>↻ Refresh</Btn>}
      />

      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      {/* Loading spinner */}
      {loading && (
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <span style={{ color: '#64748b', fontSize: 13 }}>Loading assignments...</span>
        </div>
      )}

      {/* API error */}
      {!loading && loadErr && (
        <div style={s.errBox}>
          <span>⚠ {loadErr}</span>
          <Btn variant="ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={load}>Retry</Btn>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadErr && assignments.length === 0 && (
        <div style={s.emptyBox}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>No assignments yet</p>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
            Assignments appear here once you are enrolled in a course that has assignments posted by the teacher.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Btn onClick={() => window.location.href = '/student/courses'}>Go to All Courses</Btn>
            <Btn variant="ghost" onClick={load}>↻ Refresh</Btn>
          </div>
        </div>
      )}

      {/* Pending assignments */}
      {!loading && pending.length > 0 && (
        <>
          <h3 style={s.sectionTitle}>Pending ({pending.length})</h3>
          <div style={s.grid}>
            {pending.map(a => (
              <div key={a.id} style={{ ...s.card, borderColor: a.is_overdue ? '#fecaca' : '#e2e8f0' }}>
                <div style={s.cardTop}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cardTitle}>{a.title}</div>
                    {a.course_title && <div style={s.courseTag}>📖 {a.course_title}</div>}
                  </div>
                  {a.is_overdue ? <Badge label="Overdue" color="#ef4444" /> : <Badge label="Pending" color="#f59e0b" />}
                </div>
                {a.description && <p style={s.cardDesc}>{a.description}</p>}
                <div style={s.cardMeta}>
                  <span>📅 {new Date(a.due_date).toLocaleDateString()}</span>
                  <span>🏆 {a.total_points} pts</span>
                </div>

                {open === a.id ? (
                  <div style={s.submitArea}>
                    <Textarea
                      label="Submission Text (optional if uploading file)"
                      placeholder="Write your answer here..."
                      value={texts[a.id] ?? ''}
                      onChange={e => setTexts(t => ({ ...t, [a.id]: e.target.value }))}
                      rows={3}
                    />
                    <div style={s.fileArea}>
                      <label style={{ cursor: 'pointer', flex: 1 }}>
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
                          onChange={e => setFiles(f => ({ ...f, [a.id]: e.target.files?.[0] ?? null }))}
                        />
                        <span style={s.fileBtn}>📎 {files[a.id] ? files[a.id]!.name : 'Attach File'}</span>
                      </label>
                      {files[a.id] && (
                        <button style={s.removeFile} onClick={() => setFiles(f => ({ ...f, [a.id]: null }))}>×</button>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>PDF, DOC, DOCX, TXT, PNG, JPG, ZIP</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn onClick={() => submit(a.id)} style={{ flex: 1, justifyContent: 'center' }} disabled={uploading === a.id}>
                        {uploading === a.id ? 'Submitting...' : 'Submit'}
                      </Btn>
                      <Btn variant="ghost" onClick={() => setOpen(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <Btn style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => setOpen(a.id)}>
                    Write Submission
                  </Btn>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Submitted assignments */}
      {!loading && submitted.length > 0 && (
        <>
          <h3 style={{ ...s.sectionTitle, marginTop: 32 }}>Submitted ({submitted.length})</h3>
          <div style={s.grid}>
            {submitted.map(a => (
              <div key={a.id} style={{ ...s.card, borderColor: '#bbf7d0' }}>
                <div style={s.cardTop}>
                  <div style={{ flex: 1 }}>
                    <div style={s.cardTitle}>{a.title}</div>
                    {a.course_title && <div style={s.courseTag}>📖 {a.course_title}</div>}
                  </div>
                  <Badge label="Submitted ✓" color="#10b981" />
                </div>
                <div style={s.cardMeta}>
                  <span>📅 {new Date(a.due_date).toLocaleDateString()}</span>
                  <span>🏆 {a.total_points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 16px' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card:         { background: '#ffffff', border: '1px solid', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  cardTitle:    { fontSize: 14, fontWeight: 600, color: '#0f172a' },
  courseTag:    { fontSize: 11, color: '#6366f1', marginTop: 2 },
  cardDesc:     { fontSize: 13, color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 },
  cardMeta:     { display: 'flex', gap: 16, fontSize: 12, color: '#64748b', marginBottom: 4 },
  submitArea:   { marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  fileArea:     { display: 'flex', alignItems: 'center', gap: 8 },
  fileBtn:      { display: 'block', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#475569', textAlign: 'center' as const },
  removeFile:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#dc2626', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingBox:   { display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0' },
  spinner:      { width: 24, height: 24, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errBox:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 16 },
  emptyBox:     { textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
};

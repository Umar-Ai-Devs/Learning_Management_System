'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left decorative panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.leftLogo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={s.leftTitle}>EduFlow LMS</h2>
          <p style={s.leftSub}>A modern platform for students, teachers and administrators to manage learning seamlessly.</p>
          <div style={s.features}>
            {['Manage courses & assignments', 'Track grades & submissions', 'Role-based access control'].map(f => (
              <div key={f} style={s.featureRow}>
                <span style={s.featureDot}>✓</span>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div style={s.right}>
        <div style={s.card}>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={s.errorBox}>
                <span>⚠</span> {error}
              </div>
            )}

            <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={s.spinner} /> Signing in...
                  </span>
                : 'Sign In'}
            </button>
          </form>

          <div style={s.hint}>
            <span style={s.hintIcon}>💡</span>
            <span>Default admin: <strong>admin@lms.com</strong> / <strong>Admin@123456</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:       { display: 'flex', minHeight: '100vh', background: '#f5f7fa' },
  left:       { width: '45%', background: 'linear-gradient(145deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 },
  leftInner:  { maxWidth: 360 },
  leftLogo:   { width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  leftTitle:  { fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px' },
  leftSub:    { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 32px' },
  features:   { display: 'flex', flexDirection: 'column', gap: 12 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 10 },
  featureDot: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0 },
  featureText:{ fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  right:      { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 },
  card:       { background: '#ffffff', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  title:      { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' },
  subtitle:   { fontSize: 14, color: '#64748b', margin: '0 0 32px' },
  form:       { display: 'flex', flexDirection: 'column', gap: 20 },
  field:      { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, color: '#374151' },
  input:      { background: '#fff', border: '1px solid #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#0f172a', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn:        { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 12px rgba(99,102,241,0.35)' },
  errorBox:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 },
  spinner:    { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  hint:       { display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b', border: '1px solid #e2e8f0' },
  hintIcon:   { fontSize: 14 },
};

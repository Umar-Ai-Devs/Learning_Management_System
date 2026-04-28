import { ReactNode, CSSProperties } from 'react';

// ── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="card-responsive" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = '#6366f1' }: { label: string; value: number | string; icon: string; color?: string }) {
  return (
    <div className="stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Table ────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="table-responsive" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9', ...style }}>{children}</td>;
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ label, color = '#6366f1' }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}25` }}>
      {label}
    </span>
  );
}

// ── Input ────────────────────────────────────────────────────
export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <input
        {...props}
        style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0f172a', outline: 'none', width: '100%', boxSizing: 'border-box', ...props.style }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────
export function Select({ label, children, ...props }: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <select
        {...props}
        style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0f172a', outline: 'none', width: '100%', ...props.style }}
      >
        {children}
      </select>
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────
export function Textarea({ label, ...props }: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>}
      <textarea
        {...props}
        style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box', ...props.style }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────
type BtnVariant = 'primary' | 'danger' | 'warning' | 'ghost' | 'success';
const btnStyles: Record<BtnVariant, CSSProperties> = {
  primary: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' },
  danger:  { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  warning: { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' },
  ghost:   { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' },
  success: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
};

export function Btn({ variant = 'primary', children, style, className, ...props }: { variant?: BtnVariant; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`btn-responsive ${className || ''}`}
      style={{ ...btnStyles[variant], borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', ...style }}
    >
      {children}
    </button>
  );
}

// ── Alert ────────────────────────────────────────────────────
export function Alert({ msg, type = 'success' }: { msg: string; type?: 'success' | 'error' }) {
  if (!msg) return null;
  const c = type === 'success'
    ? { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' }
    : { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: c.color, marginBottom: 16, fontWeight: 500 }}>
      {type === 'success' ? '✓ ' : '⚠ '}{msg}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="modal-content" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Search Bar ───────────────────────────────────────────────
export function SearchBar({ value, onChange, onSearch, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; onSearch: () => void; placeholder?: string }) {
  return (
    <div className="search-bar" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
          style={{ width: '100%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px 10px 36px', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <Btn onClick={onSearch} className="btn-responsive">Search</Btn>
    </div>
  );
}

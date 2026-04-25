'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const { user, loading } = useAuth();

  const fetchCount = useCallback(() => {
    if (!user) return;
    api.get('/notifications?per_page=1')
      .then(r => setUnread(r.data.unread_count ?? 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    fetchCount();
    const interval = setInterval(fetchCount, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchCount, loading, user]);

  return (
    <button onClick={() => router.push('/notifications')} style={s.btn} title="Notifications">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      {unread > 0 && (
        <span style={s.badge}>{unread > 99 ? '99+' : unread}</span>
      )}
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  btn:   { position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  badge: { position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid #fff' },
};

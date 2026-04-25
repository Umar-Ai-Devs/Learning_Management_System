'use client';
import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Btn, Alert, Badge } from '@/components/ui';
import api from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
  data: Record<string, unknown> | null;
}

const typeIcon: Record<string, string> = {
  assignment: '📝',
  grade: '⭐',
  announcement: '📢',
  system: '🔔',
};

const typeColor: Record<string, string> = {
  assignment: '#6366f1',
  grade: '#f59e0b',
  announcement: '#10b981',
  system: '#64748b',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api.get('/notifications?per_page=50').then(r => {
      setNotifications(r.data.notifications);
      setUnreadCount(r.data.unread_count);
      setTotal(r.data.total);
    });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id: number) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setMsg('All notifications marked as read');
    load();
  };

  const deleteNotif = async (id: number) => {
    await api.delete(`/notifications/${id}`);
    load();
  };

  return (
    <ProtectedRoute>
      <PageHeader
        title="Notifications"
        subtitle={`${total} total · ${unreadCount} unread`}
        action={
          unreadCount > 0
            ? <Btn variant="ghost" onClick={markAllRead}>Mark all as read</Btn>
            : undefined
        }
      />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />

      {notifications.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔔</div>
          <p style={s.emptyText}>No notifications yet</p>
        </div>
      ) : (
        <div style={s.list}>
          {notifications.map(n => (
            <div key={n.id} style={{ ...s.card, background: n.is_read ? '#ffffff' : '#f0f4ff', borderLeft: `4px solid ${typeColor[n.type] || '#6366f1'}` }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.icon, background: `${typeColor[n.type] || '#6366f1'}15` }}>
                  {typeIcon[n.type] || '🔔'}
                </div>
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <span style={{ ...s.title, fontWeight: n.is_read ? 500 : 700 }}>{n.title}</span>
                  <div style={s.cardActions}>
                    <Badge label={n.type} color={typeColor[n.type] || '#6366f1'} />
                    {!n.is_read && (
                      <Btn variant="ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => markRead(n.id)}>
                        Mark read
                      </Btn>
                    )}
                    <button onClick={() => deleteNotif(n.id)} style={s.deleteBtn} title="Delete">×</button>
                  </div>
                </div>
                <p style={s.message}>{n.message}</p>
                <span style={s.time}>{n.time_ago}</span>
              </div>
              {!n.is_read && <div style={s.unreadDot} />}
            </div>
          ))}
        </div>
      )}
    </ProtectedRoute>
  );
}

const s: Record<string, React.CSSProperties> = {
  list:        { display: 'flex', flexDirection: 'column', gap: 10 },
  card:        { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', transition: 'box-shadow 0.15s' },
  cardLeft:    { flexShrink: 0 },
  icon:        { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  cardBody:    { flex: 1, minWidth: 0 },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  title:       { fontSize: 14, color: '#0f172a', flex: 1 },
  cardActions: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  message:     { fontSize: 13, color: '#475569', margin: '0 0 6px', lineHeight: 1.5 },
  time:        { fontSize: 11, color: '#94a3b8' },
  unreadDot:   { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#6366f1' },
  deleteBtn:   { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', color: '#dc2626', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  empty:       { textAlign: 'center', padding: '60px 0' },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: '#94a3b8', fontSize: 15 },
};

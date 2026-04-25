'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, Table, Td, Badge, Btn, SearchBar, Alert, Modal, Input, Select } from '@/components/ui';
import api from '@/lib/api';

interface User { id: number; name: string; email: string; role: string; is_active: boolean; created_at: string; }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = (q = '', r = '') => {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (r) params.set('role', r);
    api.get(`/admin/users?${params}`).then(res => setUsers(res.data.users));
  };

  useEffect(() => { load(); }, []);

  const roleColor: Record<string, string> = { admin: '#f59e0b', teacher: '#10b981', student: '#6366f1' };

  return (
    <ProtectedRoute role="admin">
      <PageHeader title="All Users" subtitle={`${users.length} users total`} />
      <Alert msg={msg} type="success" />
      <Alert msg={err} type="error" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={setSearch} onSearch={() => load(search, roleFilter)} placeholder="Search by name or email..." />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); load(search, e.target.value); }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f1f5f9', outline: 'none' }}
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Table headers={['User', 'Email', 'Role', 'Status', 'Joined']}>
        {users.map(u => (
          <tr key={u.id}>
            <Td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${roleColor[u.role] || '#6366f1'}15`, color: roleColor[u.role] || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{u.name[0]}</div>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{u.name}</span>
              </div>
            </Td>
            <Td>{u.email}</Td>
            <Td><Badge label={u.role} color={roleColor[u.role] || '#6366f1'} /></Td>
            <Td><Badge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? '#10b981' : '#ef4444'} /></Td>
            <Td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</Td>
          </tr>
        ))}
      </Table>
    </ProtectedRoute>
  );
}

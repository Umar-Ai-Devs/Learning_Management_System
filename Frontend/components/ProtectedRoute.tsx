'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';

export default function ProtectedRoute({ children, role }: { children: ReactNode; role?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (role && user.role !== role) router.push(`/${user.role}`);
    }
  }, [user, loading, role, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

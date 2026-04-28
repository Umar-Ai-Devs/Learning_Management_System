'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ReactNode, useState } from 'react';
import NotificationBell from './NotificationBell';

const navConfig: Record<string, { icon: string; label: string; href: string }[]> = {
  admin: [
    { icon: '⊞', label: 'Dashboard',    href: '/admin' },
    { icon: '◈', label: 'All Users',    href: '/admin/users' },
    { icon: '◉', label: 'Students',     href: '/admin/students' },
    { icon: '◎', label: 'Teachers',     href: '/admin/teachers' },
    { icon: '▣', label: 'Courses',      href: '/admin/courses' },
    { icon: '✦', label: 'Create User',  href: '/admin/create-user' },
    { icon: '📢', label: 'Announce',    href: '/admin/announce' },
    { icon: '🔔', label: 'Notifications', href: '/notifications' },
  ],
  teacher: [
    { icon: '⊞', label: 'Dashboard',    href: '/teacher' },
    { icon: '▣', label: 'My Courses',   href: '/teacher/courses' },
    { icon: '◈', label: 'Assignments',  href: '/teacher/assignments' },
    { icon: '◉', label: 'Profile',      href: '/teacher/profile' },
    { icon: '🔔', label: 'Notifications', href: '/notifications' },
  ],
  student: [
    { icon: '⊞', label: 'Dashboard',   href: '/student' },
    { icon: '▣', label: 'All Courses', href: '/student/courses' },
    { icon: '◉', label: 'My Courses',  href: '/student/my-courses' },
    { icon: '◈', label: 'Assignments', href: '/student/assignments' },
    { icon: '◎', label: 'Submissions', href: '/student/submissions' },
    { icon: '✦', label: 'Grades',      href: '/student/grades' },
    { icon: '⊕', label: 'Profile',     href: '/student/profile' },
    { icon: '🔔', label: 'Notifications', href: '/notifications' },
  ],
};

const roleColors: Record<string, string> = {
  admin:   '#f59e0b',
  teacher: '#10b981',
  student: '#6366f1',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const links = navConfig[user.role] || [];
  const accent = roleColors[user.role] || '#6366f1';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={s.shell}>
      {/* Mobile menu button */}
      <button onClick={toggleSidebar} style={s.menuBtn}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, transform: sidebarOpen ? 'translateX(0)' : undefined }}>
        {/* Close button for mobile */}
        <button onClick={closeSidebar} style={s.closeBtn} className="hide-desktop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={{ ...s.logoIcon, background: `${accent}15`, border: `1px solid ${accent}30` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.logoText}>EduFlow</span>
        </div>

        {/* Role badge */}
        <div style={{ ...s.roleBadge, background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>
          {user.role.toUpperCase()}
        </div>

        {/* Nav links */}
        <nav style={s.nav}>
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={closeSidebar}>
                <div style={{
                  ...s.navItem,
                  background: active ? `${accent}12` : 'transparent',
                  borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
                  color: active ? '#0f172a' : '#64748b',
                }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', color: active ? accent : '#94a3b8' }}>{link.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={s.userArea}>
          <div style={s.avatar} onClick={() => { router.push(`/${user.role}/profile`); closeSidebar(); }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user.name}</span>
            <span style={s.userEmail}>{user.email}</span>
          </div>
          <button onClick={logout} style={s.logoutBtn} title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div style={s.overlay} onClick={closeSidebar} />}

      {/* Main area */}
      <div style={s.mainWrap}>
        {/* Top bar */}
        <header style={s.topbar}>
          <div style={s.topbarLeft}>
            <span style={s.pageTitle}>
              {links.find(l => l.href === pathname)?.label || 'Dashboard'}
            </span>
          </div>
          <div style={s.topbarRight}>
            <NotificationBell />
            <div style={s.topAvatar} onClick={() => router.push(`/${user.role}/profile`)}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={s.content}>{children}</main>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell:      { display: 'flex', minHeight: '100vh', background: '#f5f7fa' },
  menuBtn:    { position: 'fixed', top: 12, left: 12, zIndex: 200, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  closeBtn:   { position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sidebar:    { width: 240, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 90 },
  logoArea:   { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 24px' },
  logoIcon:   { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: 17, fontWeight: 700, color: '#0f172a' },
  roleBadge:  { margin: '0 16px 20px', padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'center' },
  nav:        { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px', overflowY: 'auto' },
  navItem:    { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', marginLeft: -3 },
  userArea:   { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 0', borderTop: '1px solid #f1f5f9', marginTop: 'auto' },
  avatar:     { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 },
  userInfo:   { flex: 1, overflow: 'hidden' },
  userName:   { display: 'block', fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail:  { display: 'block', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn:  { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', flexShrink: 0 },
  mainWrap:   { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: 'calc(100% - 240px)' },
  topbar:     { background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 36px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  pageTitle:  { fontSize: 15, fontWeight: 600, color: '#0f172a' },
  topbarRight:{ display: 'flex', alignItems: 'center', gap: 10 },
  topAvatar:  { width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' },
  content:    { padding: '32px 36px', flex: 1 },
};

// Responsive styles as inline style tag
export const responsiveStyles = `
  @media (max-width: 767px) {
    aside {
      transform: translateX(-100%) !important;
      width: 260px !important;
    }
    aside[data-open="true"] {
      transform: translateX(0) !important;
    }
    .main-wrap {
      margin-left: 0 !important;
      width: 100% !important;
    }
    .content {
      padding: 16px !important;
      padding-top: 72px !important;
    }
    .topbar {
      padding: 0 16px !important;
      padding-left: 56px !important;
    }
    .menu-btn {
      display: flex !important;
    }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    aside {
      width: 200px !important;
    }
    .main-wrap {
      margin-left: 200px !important;
      width: calc(100% - 200px) !important;
    }
    .content {
      padding: 24px !important;
    }
    .topbar {
      padding: 0 24px !important;
    }
  }
  @media (min-width: 1024px) {
    .menu-btn {
      display: none !important;
    }
  }
`;

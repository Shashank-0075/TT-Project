import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const PublicLayout = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'MAINTENANCE') return '/maintenance/dashboard';
    if (user.role === 'STAFF') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-50)' }}>
      <header
        style={{
          height: '68px',
          borderBottom: '1px solid var(--slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div className="brand-logo" style={{ width: '38px', height: '38px', fontSize: '16px' }}>CF</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--slate-900)', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
              CampusFix
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              Smart Complaint &amp; Maintenance
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <Link to={getDashboardLink()} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Go to Portal</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--slate-200)',
          padding: '28px 36px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--slate-500)',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
          CampusFix &mdash; Smart College Complaint and Maintenance Management System
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--slate-400)' }}>
          B.Tech Computer Science and Engineering Major Project &bull; Spring Boot + React + MySQL
        </div>
      </footer>
    </div>
  );
};

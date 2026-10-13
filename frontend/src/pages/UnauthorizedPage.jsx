import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'MAINTENANCE') return '/maintenance/dashboard';
    return '/student/dashboard';
  };

  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <ShieldAlert size={32} />
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
        Access Denied (403)
      </h1>
      <p style={{ color: 'var(--slate-600)', fontSize: '14px', marginBottom: '24px' }}>
        You do not have administrative or authorized permissions to view this page.
      </p>
      <Link to={getDashboard()} className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Your Dashboard
      </Link>
    </div>
  );
};

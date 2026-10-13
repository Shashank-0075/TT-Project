import React from 'react';
import { Menu, LogOut, User as UserIcon, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title, toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'MAINTENANCE': return 'Maintenance Tech';
      case 'STUDENT': return 'Enrolled Student';
      case 'STAFF': return 'Faculty / Staff';
      case 'STUDENT_STAFF': return 'Student & Staff';
      default: return role;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleMobileSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none', padding: '8px' }}
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="top-header-title">{title}</h2>
        </div>
      </div>

      <div className="top-header-actions">
        {/* System Online Badge */}
        <div className="system-status-indicator" title="Campus Network & SLA Schedulers Operational">
          <span className="system-status-pulse" />
          <span>System Online</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* User Profile Pill */}
            <div
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 10px 4px 4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              title="View Profile Settings"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                {getInitials(user.fullName)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginRight: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.2 }}>
                  {user.fullName || 'User'}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                color: 'var(--danger-dot)',
                borderColor: 'var(--slate-300)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: inline-flex !important;
          }
          .system-status-indicator {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

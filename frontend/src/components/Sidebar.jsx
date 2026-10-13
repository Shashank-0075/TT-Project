import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  History,
  Users,
  Layers,
  MapPin,
  AlertOctagon,
  Wrench,
  CheckCircle2,
  Settings,
  User,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  LogOut,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getPortalLabel = () => {
    switch (role) {
      case 'STUDENT': return 'Student Portal';
      case 'STAFF': return 'Faculty & Staff Portal';
      case 'MAINTENANCE': return 'Maintenance Hub';
      case 'ADMIN': return 'Admin Console';
      default: return 'Campus Portal';
    }
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">CF</div>
        <div className="brand-text">
          <h1>CampusFix</h1>
          <p>{getPortalLabel()}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* ================= STUDENT ================= */}
        {role === 'STUDENT' && (
          <>
            <div className="nav-section-title">Overview</div>
            <NavLink to="/student/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <LayoutDashboard size={18} />
              <span>Student Dashboard</span>
            </NavLink>

            <div className="nav-section-title">Complaints</div>
            <NavLink to="/student/submit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <PlusCircle size={18} />
              <span>Report Issue</span>
            </NavLink>
            <NavLink to="/student/my-complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <FileText size={18} />
              <span>My Complaints</span>
            </NavLink>
            <NavLink to="/student/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <History size={18} />
              <span>Activity History</span>
            </NavLink>
          </>
        )}

        {/* ================= STAFF ================= */}
        {role === 'STAFF' && (
          <>
            <div className="nav-section-title">Overview</div>
            <NavLink to="/staff/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Briefcase size={18} />
              <span>Staff Dashboard</span>
            </NavLink>

            <div className="nav-section-title">Requests</div>
            <NavLink to="/student/submit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <PlusCircle size={18} />
              <span>Submit Request</span>
            </NavLink>
            <NavLink to="/student/my-complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <FileText size={18} />
              <span>My Requests</span>
            </NavLink>
            <NavLink to="/student/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <History size={18} />
              <span>Activity History</span>
            </NavLink>
          </>
        )}

        {/* ================= LEGACY / COMBINED STUDENT_STAFF ================= */}
        {role === 'STUDENT_STAFF' && (
          <>
            <div className="nav-section-title">Dashboards</div>
            <NavLink to="/student/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <GraduationCap size={18} />
              <span>Student View</span>
            </NavLink>
            <NavLink to="/staff/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Briefcase size={18} />
              <span>Faculty / Staff View</span>
            </NavLink>

            <div className="nav-section-title">Complaints</div>
            <NavLink to="/student/submit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <PlusCircle size={18} />
              <span>Report Issue</span>
            </NavLink>
            <NavLink to="/student/my-complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <FileText size={18} />
              <span>My Complaints</span>
            </NavLink>
            <NavLink to="/student/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <History size={18} />
              <span>Activity History</span>
            </NavLink>
          </>
        )}

        {/* ================= MAINTENANCE ================= */}
        {role === 'MAINTENANCE' && (
          <>
            <div className="nav-section-title">Operations</div>
            <NavLink to="/maintenance/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <LayoutDashboard size={18} />
              <span>Work Center</span>
            </NavLink>
            <NavLink to="/maintenance/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Wrench size={18} />
              <span>Open Complaints</span>
            </NavLink>
            <NavLink to="/maintenance/resolutions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <CheckCircle2 size={18} />
              <span>Resolution History</span>
            </NavLink>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {role === 'ADMIN' && (
          <>
            <div className="nav-section-title">Institutional Overview</div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <LayoutDashboard size={18} />
              <span>Analytics Dashboard</span>
            </NavLink>
            <NavLink to="/admin/complaints" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <ClipboardList size={18} />
              <span>All Complaints</span>
            </NavLink>
            <NavLink to="/admin/escalated" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <AlertOctagon size={18} />
              <span>Escalated Complaints</span>
            </NavLink>

            <div className="nav-section-title">Configuration</div>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Layers size={18} />
              <span>Categories</span>
            </NavLink>
            <NavLink to="/admin/locations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <MapPin size={18} />
              <span>Campus Locations</span>
            </NavLink>
            <NavLink to="/admin/escalation-settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
              <Settings size={18} />
              <span>Escalation Rules</span>
            </NavLink>
          </>
        )}

        <div className="nav-section-title">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <User size={18} />
          <span>Profile Settings</span>
        </NavLink>
      </nav>

      {/* Bottom User Card */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">
            {getInitials(user.fullName)}
            <span className="online-dot" />
          </div>
          <div className="user-info">
            <div className="user-name">{user.fullName || 'User'}</div>
            <div className="user-role">{user.department || role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-400)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

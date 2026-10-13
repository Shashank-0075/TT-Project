import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  PlusCircle,
  Eye,
  RefreshCw,
  Building,
  GraduationCap,
  Monitor,
  Volume2,
  Cpu,
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashData, compData] = await Promise.all([
        complaintApi.getMyDashboard(),
        complaintApi.getMyComplaints({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' }),
      ]);
      setDashboard(dashData);
      setRecentComplaints(compData.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !dashboard) return <LoadingSpinner text="Loading faculty & staff portal..." fullHeight />;

  return (
    <div>
      {/* Hero Greeting Banner */}
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>
              <Briefcase size={14} /> Faculty &amp; Staff Operations
            </div>
            <h2>Welcome back, {user?.fullName || 'Faculty Member'} 👋</h2>
            <p style={{ color: 'var(--slate-300)' }}>
              Manage departmental infrastructure, lecture hall AV equipment, and laboratory maintenance requests.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading} style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/student/submit" className="btn btn-primary btn-sm" style={{ background: '#ffffff', color: 'var(--slate-900)', fontWeight: 700 }}>
              <PlusCircle size={15} />
              <span>Submit Request</span>
            </Link>
          </div>
        </div>

        {/* Hero Quick Stat Chips */}
        <div className="hero-stats-row">
          <div className="hero-chip">
            <span>Department:</span>
            <strong>{user?.department || 'Academic Department'}</strong>
          </div>
          <div className="hero-chip">
            <span>Pending Review:</span>
            <strong>{dashboard?.pending ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(59, 130, 246, 0.25)', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
            <span>In Repair:</span>
            <strong>{dashboard?.inProgress ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span>Resolved:</span>
            <strong>{dashboard?.resolved ?? 0}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Requests"
          value={dashboard?.total ?? 0}
          icon={FileText}
          variant="primary"
          subtext="Submitted by department"
        />
        <StatCard
          label="Pending Review"
          value={dashboard?.pending ?? 0}
          icon={Clock}
          variant="warning"
          subtext="Awaiting technician"
        />
        <StatCard
          label="In Progress"
          value={dashboard?.inProgress ?? 0}
          icon={Wrench}
          variant="info"
          subtext="Actively under repair"
        />
        <StatCard
          label="Completed"
          value={dashboard?.resolved ?? 0}
          icon={CheckCircle2}
          variant="success"
          subtext="Signed off & resolved"
        />
        <StatCard
          label="Auto-Escalated"
          value={dashboard?.escalated ?? 0}
          icon={AlertOctagon}
          variant="danger"
          subtext="SLA breach escalated"
        />
      </div>

      {/* Academic Problem Shortcuts */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--primary-600)" />
              Faculty Department Quick Requests
            </h3>
            <p className="card-subtitle">Common infrastructure issues across lecture halls, departmental cabins, and labs</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          <Link
            to="/student/submit?category=4"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              background: 'var(--slate-50)',
              transition: 'all 0.2s ease',
              display: 'block',
              textDecoration: 'none',
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Smart Lecture Halls</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Projector bulb burnout, HDMI audio/video failure, smart board calibration.
            </p>
          </Link>

          <Link
            to="/student/submit?category=9"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              background: 'var(--slate-50)',
              transition: 'all 0.2s ease',
              display: 'block',
              textDecoration: 'none',
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Department Labs</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Computer network switch, specialized scientific apparatus, lab power stabilizers.
            </p>
          </Link>

          <Link
            to="/student/submit?category=1"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              background: 'var(--slate-50)',
              transition: 'all 0.2s ease',
              display: 'block',
              textDecoration: 'none',
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Faculty Cabins</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Split air conditioning, lighting fixtures, door lock replacements, office furniture.
            </p>
          </Link>

          <Link
            to="/student/submit?category=10"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              background: 'var(--slate-50)',
              transition: 'all 0.2s ease',
              display: 'block',
              textDecoration: 'none',
            }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--purple-bg)', color: 'var(--purple-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Volume2 size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Seminar Halls &amp; AV</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Podium microphone feedback, auditorium amplifier, conference room acoustics.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--primary-600)" />
              My Department Maintenance Requests
            </h3>
            <p className="card-subtitle">Real-time tracking of staff and faculty maintenance requests</p>
          </div>
          <Link to="/student/my-complaints" className="btn btn-secondary btn-sm">
            <span>View All ({dashboard?.total ?? 0})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={44} color="var(--success-dot)" style={{ margin: '0 auto 12px' }} />
            <div className="empty-state-title">No Active Requests</div>
            <p className="empty-state-desc">Your department currently has no pending maintenance requests.</p>
            <div style={{ marginTop: '16px' }}>
              <Link to="/student/submit" className="btn btn-primary btn-sm">
                <PlusCircle size={15} />
                <span>Submit Work Request</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Request Title</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--slate-500)' }}>#{c.id}</td>
                    <td>
                      <Link to={`/complaints/${c.id}`} style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {c.title}
                      </Link>
                      {c.escalationCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-dot)', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                          <AlertOctagon size={12} />
                          <span>Auto-Escalated ({c.escalationCount}x)</span>
                        </div>
                      )}
                    </td>
                    <td>{c.locationName}</td>
                    <td>
                      <span className="badge badge-priority-low">{c.categoryName}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} escalated={c.escalationCount > 0} escalationCount={c.escalationCount} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{formatDate(c.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/complaints/${c.id}`} className="btn btn-secondary btn-sm" title="View Full Details">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Academic Priority Guidelines */}
      <div className="card" style={{ borderLeft: '4px solid var(--slate-700)', background: 'var(--slate-50)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <ShieldCheck size={22} color="var(--slate-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-900)', marginBottom: '4px' }}>
              Academic Operations Guidelines
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
              Issues impacting teaching continuity, scheduled examinations, or lab practicals are prioritized by maintenance technicians. Unresolved tickets automatically escalate across SLA cycles (Low &rarr; Medium &rarr; High), notifying the Dean and Central Administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StaffDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Home,
  Monitor,
  Droplet,
  BookOpen,
  Eye,
  Info,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const StudentDashboard = () => {
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
      setError('Failed to load student dashboard metrics. Please check server connectivity.');
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

  if (loading && !dashboard) return <LoadingSpinner text="Loading student portal..." fullHeight />;

  return (
    <div>
      {/* Modern Hero Greeting Banner */}
      <div className="dashboard-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>
              <GraduationCap size={14} /> Student Maintenance Portal
            </div>
            <h2>Welcome back, {user?.fullName || 'Student'} 👋</h2>
            <p>
              Report campus infrastructure issues, track repairs across hostels, classrooms, and labs in real time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading} style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/student/submit" className="btn btn-primary btn-sm" style={{ background: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}>
              <PlusCircle size={15} />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>

        {/* Hero Quick Stat Chips */}
        <div className="hero-stats-row">
          <div className="hero-chip">
            <span>Total Submitted:</span>
            <strong>{dashboard?.total ?? 0}</strong>
          </div>
          <div className="hero-chip">
            <span>In Repair:</span>
            <strong>{dashboard?.inProgress ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <span>Auto-Escalated:</span>
            <strong>{dashboard?.escalated ?? 0}</strong>
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
          label="Total Complaints"
          value={dashboard?.total ?? 0}
          icon={FileText}
          variant="primary"
          subtext="Submitted by you"
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
          subtext="Technician active"
        />
        <StatCard
          label="Resolved"
          value={dashboard?.resolved ?? 0}
          icon={CheckCircle2}
          variant="success"
          subtext="Successfully completed"
        />
        <StatCard
          label="Auto-Escalated"
          value={dashboard?.escalated ?? 0}
          icon={AlertOctagon}
          variant="danger"
          subtext="SLA breach escalated"
        />
      </div>

      {/* Quick Problem Categories for Students */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--primary-600)" />
              Quick Student Report Shortcuts
            </h3>
            <p className="card-subtitle">One-click issue categories commonly reported by hostelers and students</p>
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
                <BookOpen size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Classroom &amp; Desks</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Broken benches, lights, ceiling fans, smart board or projector failure.
            </p>
          </Link>

          <Link
            to="/student/submit?category=3"
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
                <Wifi size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Wi-Fi &amp; Computer Labs</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Campus Wi-Fi connectivity, LAN wall ports, lab desktop boot errors, power outlets.
            </p>
          </Link>

          <Link
            to="/student/submit?category=2"
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
                <Home size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Hostel &amp; Residence</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Room tube lights, corridor water taps, washroom sanitation, geysers.
            </p>
          </Link>

          <Link
            to="/student/submit?category=7"
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
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplet size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>Drinking Water &amp; Coolers</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5 }}>
              Water cooler filters, cooler leakage, canteen seating, library sanitation.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--primary-600)" />
              My Submitted Complaints
            </h3>
            <p className="card-subtitle">Real-time status updates of your reported issues</p>
          </div>
          <Link to="/student/my-complaints" className="btn btn-secondary btn-sm">
            <span>View All ({dashboard?.total ?? 0})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={44} color="var(--success-dot)" style={{ margin: '0 auto 12px' }} />
            <div className="empty-state-title">No Complaints Submitted</div>
            <p className="empty-state-desc">You currently have no active complaints. Notice any campus issues? Report them instantly!</p>
            <div style={{ marginTop: '16px' }}>
              <Link to="/student/submit" className="btn btn-primary btn-sm">
                <PlusCircle size={15} />
                <span>Submit Complaint</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Complaint Title</th>
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

      {/* Student Protection Notice */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary-600)', background: 'var(--slate-50)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <Info size={22} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-900)', marginBottom: '4px' }}>
              Student SLA Guarantee: Automatic Priority Escalation
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
              In CampusFix, your reports never get forgotten! If a maintenance technician does not attend to your complaint within the configured deadline, the system automatically escalates its priority (<strong>Low &rarr; Medium &rarr; High</strong>), bringing older unresolved issues to the direct attention of campus administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;

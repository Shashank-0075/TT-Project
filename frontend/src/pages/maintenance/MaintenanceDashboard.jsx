import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Flame,
  ArrowRight,
  RefreshCw,
  FileText,
  Eye,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { maintenanceApi } from '../../api/maintenance';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const MaintenanceDashboard = () => {
  const [data, setData] = useState(null);
  const [urgentComplaints, setUrgentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, urgentRes] = await Promise.all([
        maintenanceApi.getDashboard(),
        maintenanceApi.getComplaints({
          unresolvedOnly: true,
          priority: 'HIGH',
          page: 0,
          size: 6,
          sortBy: 'createdAt',
          sortDir: 'desc',
        }),
      ]);

      const d = dashRes?.totalComplaints !== undefined ? dashRes : (dashRes?.data || {});
      setData(d);

      const uData = urgentRes?.content !== undefined ? urgentRes : (urgentRes?.data || {});
      setUrgentComplaints(uData.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance operations dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !data) {
    return <LoadingSpinner text="Loading maintenance dashboard..." fullHeight />;
  }

  return (
    <div>
      {/* Modern Hero Greeting Banner */}
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 45%, #475569 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>
              <Wrench size={14} /> Operations &amp; Repairs Dispatch
            </div>
            <h2>Maintenance Work Center</h2>
            <p style={{ color: 'var(--slate-200)' }}>
              Shared operational queue: review available campus complaints, start repairs, add progress notes, and close tickets with photo proof.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading} style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link to="/maintenance/complaints" className="btn btn-primary btn-sm" style={{ background: '#ffffff', color: 'var(--slate-900)', fontWeight: 700 }}>
              <Wrench size={15} />
              <span>View Open Queue</span>
            </Link>
          </div>
        </div>

        {/* Hero Quick Stat Chips */}
        <div className="hero-stats-row">
          <div className="hero-chip">
            <span>Pending Pickup:</span>
            <strong>{data?.pending ?? data?.pendingComplaints ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(59, 130, 246, 0.25)', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
            <span>In Progress:</span>
            <strong>{data?.inProgress ?? data?.inProgressComplaints ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <span>Urgent High Priority:</span>
            <strong>{data?.highPriority ?? data?.highPriorityComplaints ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span>Resolved by Team:</span>
            <strong>{data?.resolved ?? data?.resolvedComplaints ?? 0}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Pending Queue"
          value={data?.pending ?? data?.pendingComplaints ?? 0}
          icon={Clock}
          variant="warning"
          subtext="Unassigned tickets"
        />
        <StatCard
          label="Under Repair"
          value={data?.inProgress ?? data?.inProgressComplaints ?? 0}
          icon={Wrench}
          variant="info"
          subtext="Active field work"
        />
        <StatCard
          label="High Priority Urgent"
          value={data?.highPriority ?? data?.highPriorityComplaints ?? 0}
          icon={Flame}
          variant="danger"
          subtext="Immediate dispatch"
        />
        <StatCard
          label="Escalated (Overdue)"
          value={data?.escalated ?? data?.escalatedComplaints ?? 0}
          icon={AlertOctagon}
          variant="danger"
          subtext="SLA exceeded"
        />
        <StatCard
          label="Resolved by Team"
          value={data?.resolved ?? data?.resolvedComplaints ?? 0}
          icon={CheckCircle2}
          variant="success"
          subtext="Closed work orders"
        />
      </div>

      {/* Maintenance Workflow Instructions for Field Staff & Faculty Evaluation */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary-600)', background: 'var(--slate-50)', marginBottom: '28px' }}>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-900)', marginBottom: '10px' }}>
            Standard Operating Procedure (SOP) for Maintenance Staff
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--slate-600)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-priority-low" style={{ fontWeight: 800 }}>1</span>
              <div>
                <strong style={{ color: 'var(--slate-900)' }}>Pick Available Job:</strong> Review open tickets and move status from <code>PENDING</code> to <code>IN PROGRESS</code> to indicate work has commenced.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-priority-low" style={{ fontWeight: 800 }}>2</span>
              <div>
                <strong style={{ color: 'var(--slate-900)' }}>Log Progress:</strong> Add interim diagnostic notes while awaiting replacement parts or completing repairs.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-priority-low" style={{ fontWeight: 800 }}>3</span>
              <div>
                <strong style={{ color: 'var(--slate-900)' }}>Resolve with Proof:</strong> Mark as <code>RESOLVED</code>, describe work performed, and upload a completion verification photo.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Work Orders Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="var(--danger-dot)" />
              Urgent &amp; High Priority Complaints Needing Action
            </h3>
            <p className="card-subtitle">Critical tickets requiring immediate technician attention</p>
          </div>
          <Link to="/maintenance/complaints?priority=HIGH" className="btn btn-secondary btn-sm">
            <span>View All Urgent</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {urgentComplaints.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={44} color="var(--success-dot)" style={{ margin: '0 auto 12px' }} />
            <div className="empty-state-title">All High Priority Complaints Clear</div>
            <p className="empty-state-desc">No high priority or escalated tickets are currently awaiting action.</p>
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
                  <th>Reported</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {urgentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--slate-500)' }}>#{c.id}</td>
                    <td>
                      <Link to={`/complaints/${c.id}`} style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {c.title}
                      </Link>
                      {c.escalationCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger-dot)', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                          <AlertOctagon size={12} />
                          <span>Escalated ({c.escalationCount}x)</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--slate-600)' }}>
                        <MapPin size={13} />
                        <span>{c.locationName}</span>
                      </div>
                    </td>
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
                      <Link to={`/complaints/${c.id}`} className="btn btn-primary btn-sm" title="Open Work Order">
                        <Eye size={14} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Link to="/maintenance/complaints" className="card" style={{ marginBottom: 0, textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14.5px', marginBottom: '2px' }}>
                Open Work Queue &rarr;
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--slate-500)', lineHeight: 1.4, margin: 0 }}>
                Filter pending and in-progress jobs, sort by urgency, and update ticket states.
              </p>
            </div>
          </div>
        </Link>

        <Link to="/maintenance/resolutions" className="card" style={{ marginBottom: 0, textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14.5px', marginBottom: '2px' }}>
                Resolution History &amp; Photo Proofs &rarr;
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--slate-500)', lineHeight: 1.4, margin: 0 }}>
                Review completed maintenance jobs, technician notes, and uploaded completion proof photos.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
export default MaintenanceDashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Flame,
  RefreshCw,
  Play,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  MapPin,
  Layers,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { adminApi } from '../../api/admin';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Resolved: '#10b981',
};

const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

const PALETTE = ['#4f46e5', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#84cc16'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalationResult, setEscalationResult] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getDashboard();
      setData(res.totalComplaints !== undefined ? res : (res.data || res));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRunEscalation = async () => {
    try {
      setEscalating(true);
      setEscalationResult(null);
      const res = await adminApi.triggerEscalationCheck();
      setEscalationResult(res.message || 'Escalation check completed successfully.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run escalation check.');
    } finally {
      setEscalating(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Loading campus analytics..." fullHeight />;
  }

  const escalatedCount = data?.escalated ?? data?.escalatedComplaints ?? 0;

  return (
    <div>
      {/* Modern Hero Greeting Banner */}
      <div className="dashboard-hero" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>
              <Shield size={14} /> Institutional Operations Console
            </div>
            <h2>Campus Maintenance Intelligence</h2>
            <p>
              Real-time cross-campus complaint analytics, infrastructure health monitoring, and automated SLA priority escalation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadDashboard}
              disabled={loading}
              style={{ background: 'rgba(255, 255, 255, 0.9)' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRunEscalation}
              disabled={escalating}
              style={{ background: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}
            >
              <Play size={15} />
              <span>{escalating ? 'Scanning...' : 'Trigger Escalation Scan'}</span>
            </button>
          </div>
        </div>

        {/* Hero Quick Stat Chips */}
        <div className="hero-stats-row">
          <div className="hero-chip">
            <span>Total Logged:</span>
            <strong>{data?.total ?? data?.totalComplaints ?? 0}</strong>
          </div>
          <div className="hero-chip">
            <span>In Progress:</span>
            <strong>{data?.inProgress ?? data?.inProgressComplaints ?? 0}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <span>Active Escalations:</span>
            <strong>{escalatedCount}</strong>
          </div>
          <div className="hero-chip" style={{ background: 'rgba(16, 185, 129, 0.25)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span>Resolved:</span>
            <strong>{data?.resolved ?? data?.resolvedComplaints ?? 0}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {escalationResult && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Escalation Scan Executed:</strong> {escalationResult}
          </div>
          <button
            onClick={() => setEscalationResult(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'currentColor' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Logged"
          value={data?.total ?? data?.totalComplaints ?? 0}
          icon={FileText}
          variant="primary"
          subtext="Campus-wide tickets"
        />
        <StatCard
          label="Pending Queue"
          value={data?.pending ?? data?.pendingComplaints ?? 0}
          icon={Clock}
          variant="warning"
          subtext="Awaiting work start"
        />
        <StatCard
          label="In Progress"
          value={data?.inProgress ?? data?.inProgressComplaints ?? 0}
          icon={Wrench}
          variant="info"
          subtext="Under active repair"
        />
        <StatCard
          label="Resolved"
          value={data?.resolved ?? data?.resolvedComplaints ?? 0}
          icon={CheckCircle2}
          variant="success"
          subtext="Closed with proof"
        />
        <StatCard
          label="Escalated (Active)"
          value={escalatedCount}
          icon={AlertOctagon}
          variant="danger"
          subtext="Exceeded SLA limits"
        />
        <StatCard
          label="High Priority"
          value={data?.highPriority ?? data?.highPriorityComplaints ?? 0}
          icon={Flame}
          variant="danger"
          subtext="Immediate attention"
        />
      </div>

      {/* Escalation Alert Banner if active escalated complaints exist */}
      {escalatedCount > 0 && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--danger-dot)',
            backgroundColor: 'var(--danger-bg)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-dot)', boxShadow: 'var(--shadow-sm)' }}>
                <AlertOctagon size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--danger-text)', fontWeight: 700, fontSize: '15px' }}>
                  Attention: {escalatedCount} Unresolved Complaint(s) Automatically Escalated!
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--danger-text)', opacity: 0.9 }}>
                  These tickets exceeded configured SLA response windows and were automatically elevated to higher priority.
                </p>
              </div>
            </div>
            <Link to="/admin/escalated" className="btn btn-danger btn-sm">
              <span>Inspect Escalated Tickets</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* 6-Month Ingestion Trend */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--primary-600)" />
                Complaint Inflow Trend (6 Months)
              </h3>
              <p className="card-subtitle">Monthly volume of reported infrastructure issues</p>
            </div>
          </div>
          <div>
            {data?.monthlyTrend && data.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Complaints"
                    stroke="var(--primary-600)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--primary-600)' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No monthly data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Status Breakdown Donut */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="var(--primary-600)" />
                Complaints by Status
              </h3>
              <p className="card-subtitle">Current distribution of open vs completed work orders</p>
            </div>
          </div>
          <div>
            {data?.byStatus && data.byStatus.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.byStatus}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.byStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.label] || PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No complaints to display.</p>
            )}
          </div>
        </div>
      </div>

      {/* Priority, Categories & Locations Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Priority Breakdown */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="var(--primary-600)" />
                Priority Distribution
              </h3>
            </div>
          </div>
          <div>
            {data?.byPriority && data.byPriority.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byPriority} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {data.byPriority.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.label] || PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No priority data available.</p>
            )}
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary-600)" />
                Top Problem Categories
              </h3>
            </div>
          </div>
          <div>
            {data?.byCategory && data.byCategory.length > 0 ? (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byCategory.map((cat, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{cat.label}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-priority-low">{cat.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-8">No category data available.</p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--primary-600)" />
                Campus Locations
              </h3>
            </div>
          </div>
          <div>
            {data?.byLocation && data.byLocation.length > 0 ? (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th style={{ textAlign: 'right' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byLocation.map((loc, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{loc.label}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-priority-low">{loc.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-8">No location data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Link to="/admin/complaints" className="card" style={{ marginBottom: 0, textDecoration: 'none', display: 'block' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary-600)', marginBottom: '4px', fontSize: '15px' }}>
            Browse All Complaints &rarr;
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5, margin: 0 }}>
            Inspect full complaint list, apply multi-criteria filters, search keywords, and inspect audit trails.
          </p>
        </Link>
        <Link to="/admin/users" className="card" style={{ marginBottom: 0, textDecoration: 'none', display: 'block' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary-600)', marginBottom: '4px', fontSize: '15px' }}>
            User Administration &rarr;
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5, margin: 0 }}>
            Manage student, faculty, admin, and maintenance accounts, inspect roles, or toggle access.
          </p>
        </Link>
        <Link to="/admin/escalation-settings" className="card" style={{ marginBottom: 0, textDecoration: 'none', display: 'block' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary-600)', marginBottom: '4px', fontSize: '15px' }}>
            SLA Escalation Policy &rarr;
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', lineHeight: 1.5, margin: 0 }}>
            Configure Low &rarr; Medium and Medium &rarr; High day limits, scheduler toggle, and test runs.
          </p>
        </Link>
      </div>
    </div>
  );
};
export default AdminDashboard;

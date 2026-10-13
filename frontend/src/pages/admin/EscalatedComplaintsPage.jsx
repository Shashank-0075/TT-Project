import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  Clock,
  RefreshCw,
  Play,
  Settings,
  Eye,
  Info,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const EscalatedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [page, setPage] = useState(0);

  const fetchEscalated = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getEscalatedComplaints({
        page,
        size: 10,
        sortBy: 'lastEscalatedAt',
        sortDir: 'desc',
      });
      const data = res?.content !== undefined ? res : (res?.data || {});
      setComplaints(data.content || []);
      setPagination({
        page: data.page || 0,
        size: data.size || 10,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch escalated complaints.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEscalated();
  }, [fetchEscalated]);

  const handleRunEscalationNow = async () => {
    try {
      setEscalating(true);
      setActionMessage('');
      const res = await adminApi.triggerEscalationCheck();
      setActionMessage(res.message || 'Escalation scan finished.');
      await fetchEscalated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute escalation scan.');
    } finally {
      setEscalating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Escalated Complaints</h1>
            <span className="badge badge-danger flex items-center gap-1">
              <AlertOctagon size={14} /> Auto-Escalated
            </span>
          </div>
          <p className="page-subtitle">
            Complaints that exceeded normal resolution turnaround time and were automatically promoted to higher priority.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/escalation-settings" className="btn btn-secondary">
            <Settings size={16} />
            <span>Escalation Rules</span>
          </Link>
          <button
            className="btn btn-primary"
            onClick={handleRunEscalationNow}
            disabled={escalating}
          >
            <Play size={16} />
            <span>{escalating ? 'Scanning...' : 'Trigger Scan Now'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {actionMessage && (
        <div className="alert alert-success mb-6 flex justify-between items-center">
          <div>{actionMessage}</div>
          <button className="btn btn-sm btn-ghost" onClick={() => setActionMessage('')}>
            &times;
          </button>
        </div>
      )}

      {/* Feature Explainer Callout Card for Viva/Demo */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--primary-color)', backgroundColor: 'var(--slate-50)' }}>
        <div className="card-body">
          <div className="flex items-start gap-3">
            <Info size={22} className="text-primary mt-1" />
            <div>
              <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--slate-900)' }}>
                How Automatic Priority Escalation Works
              </h4>
              <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                To prevent neglected infrastructure problems, the background scheduled engine checks all unresolved complaints against configured SLA windows.
                When a complaint exceeds the threshold, its priority advances automatically (<strong>LOW &rarr; MEDIUM &rarr; HIGH</strong>),
                an immutable audit entry is logged in the escalation history, and administrative alerts are updated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Escalated Complaints Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">
            Overdue Issues Requiring Attention ({pagination.totalElements} records)
          </h3>
          <button className="btn btn-sm btn-secondary" onClick={fetchEscalated} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Loading escalated complaints..." />
          ) : complaints.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <ShieldAlert size={40} className="text-muted mx-auto mb-2" />
              <p className="text-muted font-medium">No escalated complaints at this time!</p>
              <p className="text-muted text-xs">All complaints are either resolved or within their standard SLA window.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Complaint Title</th>
                    <th>Category &amp; Location</th>
                    <th>Current Priority</th>
                    <th>Escalation Count</th>
                    <th>Last Escalated At</th>
                    <th>Status</th>
                    <th>Submitted By</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono text-muted text-sm">#{c.id}</td>
                      <td>
                        <div className="font-semibold text-dark">
                          <Link to={`/complaints/${c.id}`} className="hover:underline">
                            {c.title}
                          </Link>
                        </div>
                        <div className="text-xs text-muted">
                          Reported: {formatDate(c.createdAt)}
                        </div>
                      </td>
                      <td className="text-sm">
                        <div className="font-medium">{c.categoryName}</div>
                        <div className="text-muted text-xs">{c.locationName}</div>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <span className="badge badge-danger font-semibold">
                          <ArrowUpRight size={12} /> {c.escalationCount} time(s)
                        </span>
                      </td>
                      <td className="text-sm font-mono text-muted">
                        {formatDate(c.lastEscalatedAt)}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="text-sm">
                        <div className="font-medium">{c.submittedByName || 'User'}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link
                          to={`/complaints/${c.id}`}
                          className="btn btn-sm btn-ghost"
                          title="View Complaint and Escalation Logs"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default EscalatedComplaintsPage;

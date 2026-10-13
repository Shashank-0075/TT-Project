import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Clock, ArrowRight } from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const ComplaintHistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory(pageInfo.page);
  }, []);

  const fetchHistory = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintApi.getMyHistory(page, pageInfo.size);
      setHistoryItems(res.content || []);
      setPageInfo({
        page: res.page,
        size: res.size,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
      });
    } catch {
      setError('Failed to fetch activity history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--slate-900)' }}>Complaint Activity History</h1>
        <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
          Detailed chronological record of every status transition and technician update on your complaints
        </p>
      </div>

      <ErrorAlert message={error} />

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading history..." />
        ) : historyItems.length === 0 ? (
          <div className="empty-state">
            <History className="empty-state-icon" />
            <div className="empty-state-title">No history events found</div>
            <div className="empty-state-desc">
              As your complaints are reviewed, worked on, and resolved, each change will be recorded here.
            </div>
          </div>
        ) : (
          <>
            <div className="timeline">
              {historyItems.map((h) => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div>
                        <Link to={`/student/complaint/${h.complaintId}`} style={{ fontWeight: 600, color: 'var(--primary-700)', marginRight: '8px' }}>
                          Complaint #{h.complaintId}: {h.complaintTitle}
                        </Link>
                        <StatusBadge status={h.newStatus} />
                      </div>
                      <span className="timeline-time">
                        {new Date(h.changedAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--slate-700)', marginTop: '8px' }}>
                      <strong>Update:</strong> {h.remarks || 'Status update logged.'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--slate-200)', fontSize: '12px', color: 'var(--slate-500)' }}>
                      <div>
                        Updated by: <strong>{h.changedByName}</strong> ({h.changedByRole})
                      </div>
                      <Link to={`/student/complaint/${h.complaintId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        View Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={pageInfo.page}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              size={pageInfo.size}
              onPageChange={(p) => fetchHistory(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

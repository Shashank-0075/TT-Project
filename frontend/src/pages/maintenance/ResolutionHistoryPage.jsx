import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  RefreshCw,
  Eye,
  Camera,
  MapPin,
  User,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { maintenanceApi } from '../../api/maintenance';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { ImageModal, SecureImage } from '../../components/ImageModal';

export const ResolutionHistoryPage = () => {
  const [resolutions, setResolutions] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Image modal state
  const [modalImage, setModalImage] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const fetchResolutions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await maintenanceApi.getResolutions({
        search: search.trim() || undefined,
        page,
        size: 10,
      });
      const data = res?.content !== undefined ? res : (res?.data || {});
      setResolutions(data.content || []);
      setPagination({
        page: data.page || 0,
        size: data.size || 10,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resolution history.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchResolutions();
  }, [fetchResolutions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchResolutions();
  };

  const handleResetSearch = () => {
    setSearch('');
    setPage(0);
  };

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

  const openImageModal = (imagePath, title) => {
    setModalImage(imagePath);
    setModalTitle(title);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">Maintenance Resolution History</h1>
          <p className="page-subtitle">
            Permanent audit trail of resolved campus complaints, technician notes, and verification photos.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchResolutions} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                className="form-control"
                placeholder="Search by complaint title, remarks, technician name, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              <span>Search</span>
            </button>
            {search && (
              <button type="button" className="btn btn-secondary" onClick={handleResetSearch}>
                <X size={16} />
                <span>Clear</span>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Resolutions List */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">
            Completed Resolutions ({pagination.totalElements} records)
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Fetching resolution logs..." />
          ) : resolutions.length === 0 ? (
            <div className="empty-state py-12 text-center text-muted">
              <CheckCircle2 size={40} className="mx-auto mb-2 opacity-50" />
              <p>No resolution records found matching your search.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Complaint Details</th>
                    <th>Location &amp; Category</th>
                    <th>Technician Remarks</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Proof Photo</th>
                    <th>Resolved By</th>
                    <th>Completion Date</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {resolutions.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-muted text-sm">#{r.id}</td>
                      <td>
                        <div className="font-semibold text-dark">
                          <Link to={`/complaints/${r.complaintId}`} className="hover:underline">
                            {r.complaintTitle}
                          </Link>
                        </div>
                        <div className="text-xs text-muted">
                          Complaint ID: #{r.complaintId}
                        </div>
                      </td>
                      <td className="text-sm">
                        <div className="font-medium text-dark">{r.locationName}</div>
                        <div className="text-muted text-xs">{r.categoryName}</div>
                      </td>
                      <td className="text-sm" style={{ maxWidth: '280px' }}>
                        <p className="mb-0 text-dark line-clamp-2" title={r.remarks}>
                          {r.remarks}
                        </p>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {r.proofImagePath ? (
                          <div
                            className="cursor-pointer inline-block"
                            onClick={() =>
                              openImageModal(
                                r.proofImagePath,
                                `Resolution Proof: #${r.complaintId} - ${r.complaintTitle}`
                              )
                            }
                            title="Click to zoom proof photo"
                          >
                            <SecureImage
                              path={r.proofImagePath}
                              alt="Proof thumbnail"
                              style={{
                                width: '44px',
                                height: '44px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted">None</span>
                        )}
                      </td>
                      <td className="text-sm">
                        <div className="font-medium text-dark">{r.resolvedByName || 'Staff'}</div>
                      </td>
                      <td className="text-sm text-muted">
                        {formatDate(r.resolvedAt)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link
                          to={`/complaints/${r.complaintId}`}
                          className="btn btn-sm btn-ghost"
                          title="View Complaint Full Details"
                        >
                          <Eye size={15} />
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

      {/* Image Preview Modal */}
      <ImageModal
        isOpen={!!modalImage}
        imagePath={modalImage}
        title={modalTitle}
        onClose={() => setModalImage(null)}
      />
    </div>
  );
};
export default ResolutionHistoryPage;

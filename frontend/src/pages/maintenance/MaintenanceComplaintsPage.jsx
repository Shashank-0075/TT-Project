import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  RefreshCw,
  PlayCircle,
  MessageSquare,
  CheckCircle2,
  Eye,
  AlertOctagon,
  Clock,
  Upload,
  X,
  Camera,
} from 'lucide-react';
import { maintenanceApi } from '../../api/maintenance';
import { masterDataApi } from '../../api/masterData';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const MaintenanceComplaintsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');
  const [page, setPage] = useState(0);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressRemarks, setProgressRemarks] = useState('');
  const [progressSubmitting, setProgressSubmitting] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [proofImageFile, setProofImageFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  // Load master data once
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          masterDataApi.getCategories(true),
          masterDataApi.getLocations(true),
        ]);
        setCategories(catRes.data || catRes || []);
        setLocations(locRes.data || locRes || []);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };
    fetchMasterData();
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (categoryId) params.categoryId = categoryId;
      if (locationId) params.locationId = locationId;

      const res = await maintenanceApi.getComplaints(params);
      const data = res?.content !== undefined ? res : (res?.data || {});
      setComplaints(data.content || []);
      setPagination({
        page: data.page || 0,
        size: data.size || 10,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance complaints.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, categoryId, locationId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setLocationId('');
    setPage(0);
  };

  // Quick action: Start Work (PENDING -> IN_PROGRESS)
  const handleStartWork = async (complaint) => {
    try {
      setError('');
      await maintenanceApi.updateStatus(complaint.id, {
        status: 'IN_PROGRESS',
        remarks: 'Maintenance personnel started working on this complaint.',
      });
      setSuccessMsg(`Status for #${complaint.id} "${complaint.title}" updated to IN PROGRESS.`);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint status.');
    }
  };

  // Quick action: Add Progress Note
  const handleOpenProgress = (complaint) => {
    setSelectedComplaint(complaint);
    setProgressRemarks('');
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setProgressSubmitting(true);
      setError('');
      await maintenanceApi.addProgressNote(selectedComplaint.id, {
        remarks: progressRemarks.trim(),
      });
      setSuccessMsg(`Progress note recorded for #${selectedComplaint.id}.`);
      setShowProgressModal(false);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record progress note.');
    } finally {
      setProgressSubmitting(false);
    }
  };

  // Quick action: Resolve
  const handleOpenResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionRemarks('');
    setProofImageFile(null);
    setProofPreview(null);
    setShowResolveModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImageFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setResolveSubmitting(true);
      setError('');
      const formData = new FormData();
      formData.append('remarks', resolutionRemarks.trim());
      if (proofImageFile) {
        formData.append('proofImage', proofImageFile);
      }
      await maintenanceApi.resolve(selectedComplaint.id, formData);
      setSuccessMsg(`Complaint #${selectedComplaint.id} has been successfully resolved!`);
      setShowResolveModal(false);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint.');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
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
          <h1 className="page-title">Available Complaints Queue</h1>
          <p className="page-subtitle">
            Inspect campus maintenance requests, transition states, update progress notes, and close work orders.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchComplaints} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {successMsg && (
        <div className="alert alert-success mb-6 flex justify-between items-center">
          <div>{successMsg}</div>
          <button className="btn btn-sm btn-ghost" onClick={() => setSuccessMsg('')}>
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleFilterSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search complaints by title, description, or submitter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="form-control form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING (Need Work)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Underway)</option>
                  <option value="RESOLVED">RESOLVED (Finished)</option>
                </select>
              </div>

              <div>
                <select
                  className="form-control form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="HIGH">HIGH (Urgent)</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div>
                <select
                  className="form-control form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="form-control form-select"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 md:col-span-2 justify-end">
                <button type="submit" className="btn btn-primary">
                  <Filter size={16} />
                  <span>Filter Queue</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  <X size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">
            Maintenance Work Orders ({pagination.totalElements} records)
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Loading work orders..." />
          ) : complaints.length === 0 ? (
            <div className="empty-state py-12 text-center text-muted">
              <Wrench size={40} className="mx-auto mb-2 opacity-50" />
              <p>No complaints match your filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>ID</th>
                    <th>Complaint Title</th>
                    <th>Location &amp; Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reported Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                        {c.escalationCount > 0 && (
                          <div className="flex items-center gap-1 text-danger text-xs font-semibold mt-1">
                            <AlertOctagon size={12} />
                            <span>Escalated {c.escalationCount}x</span>
                          </div>
                        )}
                      </td>
                      <td className="text-sm">
                        <div className="font-medium text-dark">{c.locationName}</div>
                        <div className="text-muted text-xs">{c.categoryName}</div>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="text-sm text-muted">
                        {formatDate(c.createdAt)}
                      </td>
                      <td>
                        <div className="flex justify-end items-center gap-2">
                          {/* If PENDING: Start Work button */}
                          {c.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-info flex items-center gap-1"
                              onClick={() => handleStartWork(c)}
                              title="Begin work order"
                            >
                              <PlayCircle size={14} />
                              <span>Start Work</span>
                            </button>
                          )}

                          {/* If IN_PROGRESS: Add Note and Resolve buttons */}
                          {c.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                className="btn btn-sm btn-secondary flex items-center gap-1"
                                onClick={() => handleOpenProgress(c)}
                                title="Add progress note"
                              >
                                <MessageSquare size={14} />
                                <span>Add Note</span>
                              </button>
                              <button
                                className="btn btn-sm btn-success flex items-center gap-1"
                                onClick={() => handleOpenResolve(c)}
                                title="Complete and resolve complaint"
                              >
                                <CheckCircle2 size={14} />
                                <span>Resolve</span>
                              </button>
                            </>
                          )}

                          <Link
                            to={`/complaints/${c.id}`}
                            className="btn btn-sm btn-ghost"
                            title="Inspect full details and history"
                          >
                            <Eye size={15} />
                          </Link>
                        </div>
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

      {/* ================= ADD PROGRESS NOTE MODAL ================= */}
      {showProgressModal && selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">
                Add Progress Note: #{selectedComplaint.id}
              </h3>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowProgressModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleProgressSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <p className="text-sm text-muted">
                  <strong>Complaint:</strong> {selectedComplaint.title} ({selectedComplaint.locationName})
                </p>
                <div className="form-group">
                  <label className="form-label required">Progress Remarks</label>
                  <textarea
                    rows={4}
                    required
                    maxLength={1000}
                    className="form-control"
                    placeholder="e.g. Inspected circuit box. Replaced blown fuse; now monitoring voltage..."
                    value={progressRemarks}
                    onChange={(e) => setProgressRemarks(e.target.value)}
                  />
                  <span className="text-xs text-muted block mt-1">
                    This remark will be added to the public complaint activity audit log.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProgressModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={progressSubmitting || !progressRemarks.trim()}
                >
                  {progressSubmitting ? 'Saving Note...' : 'Save Progress Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RESOLVE COMPLAINT MODAL ================= */}
      {showResolveModal && selectedComplaint && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <CheckCircle2 size={18} className="text-success" />
                Resolve Complaint: #{selectedComplaint.id}
              </h3>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowResolveModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <p className="text-sm text-muted">
                  <strong>Complaint:</strong> {selectedComplaint.title} ({selectedComplaint.locationName})
                </p>

                <div className="form-group">
                  <label className="form-label required">Resolution Remarks</label>
                  <textarea
                    rows={4}
                    required
                    minLength={5}
                    maxLength={2000}
                    className="form-control"
                    placeholder="Describe how the issue was fixed, components replaced, tests performed..."
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Proof of Resolution Image (Optional)
                  </label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      id="proof-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer block text-center py-4">
                      {proofPreview ? (
                        <div>
                          <img
                            src={proofPreview}
                            alt="Proof preview"
                            style={{ maxHeight: '140px', borderRadius: '6px', margin: '0 auto 8px' }}
                          />
                          <span className="text-xs text-primary font-medium block">
                            Click to change photo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted">
                          <Camera size={28} className="text-muted" />
                          <span className="text-sm font-medium text-dark">
                            Click to upload completion photo
                          </span>
                          <span className="text-xs text-muted">
                            JPG, PNG, or WEBP up to 5MB
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResolveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={resolveSubmitting || resolutionRemarks.trim().length < 5}
                >
                  {resolveSubmitting ? 'Resolving...' : 'Confirm & Resolve Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MaintenanceComplaintsPage;

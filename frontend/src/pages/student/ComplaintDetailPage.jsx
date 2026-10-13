import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Edit,
  Wrench,
  Camera,
  MessageSquare,
} from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { maintenanceApi } from '../../api/maintenance';
import { masterDataApi } from '../../api/masterData';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { SecureImage, ImageModal } from '../../components/ImageModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Image Modal state
  const [activeImage, setActiveImage] = useState(null);

  // Edit Complaint Modal (Student/Staff when PENDING)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', categoryId: '', locationId: '', priority: 'LOW' });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  // Maintenance Actions state (Status Update / Progress Note / Resolve)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusRemark, setStatusRemark] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressRemark, setProgressRemark] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveRemark, setResolveRemark] = useState('');
  const [proofImageFile, setProofImageFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintApi.getDetails(id);
      setComplaint(data);
      setEditForm({
        title: data.title,
        description: data.description,
        categoryId: data.category.id,
        locationId: data.location.id,
        priority: data.priority,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async () => {
    try {
      const [cats, locs] = await Promise.all([
        masterDataApi.getCategories(false),
        masterDataApi.getLocations(false),
      ]);
      setCategories(cats);
      setLocations(locs);
      setIsEditing(true);
    } catch {
      setError('Failed to load categories/locations for editing.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    try {
      const updated = await complaintApi.update(id, editForm);
      setComplaint(updated);
      setIsEditing(false);
      setActionSuccess('Complaint updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setEditLoading(false);
    }
  };

  // Maintenance action: Start Work (PENDING -> IN_PROGRESS)
  const handleStartWork = async () => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await maintenanceApi.updateStatus(id, {
        status: 'IN_PROGRESS',
        remarks: statusRemark || 'Work initiated by maintenance technician.',
      });
      setComplaint(updated);
      setShowStatusModal(false);
      setStatusRemark('');
      setActionSuccess('Complaint moved to IN PROGRESS.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Maintenance action: Add Progress Note
  const handleAddProgressNote = async (e) => {
    e.preventDefault();
    if (!progressRemark.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const updated = await maintenanceApi.addProgressNote(id, { remarks: progressRemark.trim() });
      setComplaint(updated);
      setShowProgressModal(false);
      setProgressRemark('');
      setActionSuccess('Progress update added to timeline.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add progress note.');
    } finally {
      setActionLoading(false);
    }
  };

  // Maintenance action: Resolve Complaint
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveRemark.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('remarks', resolveRemark.trim());
      if (proofImageFile) {
        data.append('proofImage', proofImageFile);
      }
      const updated = await maintenanceApi.resolve(id, data);
      setComplaint(updated);
      setShowResolveModal(false);
      setResolveRemark('');
      setProofImageFile(null);
      setActionSuccess('Complaint marked as RESOLVED successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading complaint details..." />;
  if (!complaint) return <ErrorAlert message={error || 'Complaint not found.'} />;

  const isOwner = user && user.id === complaint.submittedBy?.id;
  const isMaintenanceOrAdmin = user && (user.role === 'MAINTENANCE' || user.role === 'ADMIN');
  const canEdit = isOwner && complaint.status === 'PENDING';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <button className="btn btn-secondary btn-sm" onClick={openEditModal}>
              <Edit size={14} /> Edit Complaint
            </button>
          )}

          {isMaintenanceOrAdmin && complaint.status === 'PENDING' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowStatusModal(true)}>
              <Wrench size={14} /> Start Repair Work
            </button>
          )}

          {isMaintenanceOrAdmin && complaint.status === 'IN_PROGRESS' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowProgressModal(true)}>
                <MessageSquare size={14} /> Add Progress Note
              </button>
              <button className="btn btn-success btn-sm" onClick={() => setShowResolveModal(true)}>
                <CheckCircle2 size={14} /> Mark as Resolved
              </button>
            </>
          )}
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      {actionSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {actionSuccess}
          </div>
          <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'currentColor' }}>&times;</button>
        </div>
      )}

      {/* Main Complaint Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--slate-500)' }}>
                Complaint #{complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge
                priority={complaint.priority}
                escalated={complaint.escalated}
                escalationCount={complaint.escalationCount}
              />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--slate-900)' }}>
              {complaint.title}
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--slate-500)', textAlign: 'right' }}>
            <div>Reported on <strong>{new Date(complaint.createdAt).toLocaleString()}</strong></div>
            {complaint.resolvedAt && (
              <div style={{ color: 'var(--success-text)', marginTop: '2px' }}>
                Resolved on <strong>{new Date(complaint.resolvedAt).toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div style={{ margin: '10px 0 24px', padding: '18px 20px', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xs)' }}>
          <div className="status-stepper">
            <div className="stepper-line">
              <div
                className="stepper-line-progress"
                style={{
                  width:
                    complaint.status === 'RESOLVED'
                      ? '100%'
                      : complaint.status === 'IN_PROGRESS'
                      ? '50%'
                      : '0%',
                }}
              />
            </div>

            {/* Step 1 */}
            <div className={`stepper-step ${complaint.status !== 'PENDING' ? 'completed' : 'active'}`}>
              <div className="stepper-circle">
                {complaint.status !== 'PENDING' ? <CheckCircle2 size={18} /> : '1'}
              </div>
              <div className="stepper-label">Submitted</div>
            </div>

            {/* Step 2 */}
            <div
              className={`stepper-step ${
                complaint.status === 'RESOLVED'
                  ? 'completed'
                  : complaint.status === 'IN_PROGRESS'
                  ? 'active'
                  : ''
              }`}
            >
              <div className="stepper-circle">
                {complaint.status === 'RESOLVED' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Wrench size={16} />
                )}
              </div>
              <div className="stepper-label">Repair in Progress</div>
            </div>

            {/* Step 3 */}
            <div className={`stepper-step ${complaint.status === 'RESOLVED' ? 'completed active' : ''}`}>
              <div className="stepper-circle">
                <CheckCircle2 size={18} />
              </div>
              <div className="stepper-label">Resolved &amp; Verified</div>
            </div>
          </div>
        </div>

        {/* Metadata Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <div>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} /> Category
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
              {complaint.category?.name}
            </div>
          </div>
          <div>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> Campus Location
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
              {complaint.location?.name}
            </div>
          </div>
          <div>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> Submitted By
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
              {complaint.submittedBy?.fullName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{complaint.submittedBy?.department}</div>
          </div>
        </div>

        {/* Description Body */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '8px' }}>
            Issue Description
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--slate-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {complaint.description}
          </p>
        </div>

        {/* Uploaded Complaint Photo */}
        {complaint.imagePath && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '8px' }}>
              Attached Photo Evidence
            </h3>
            <div style={{ display: 'inline-block', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <SecureImage
                path={complaint.imagePath}
                alt={complaint.title}
                style={{ width: '240px', height: '160px', objectFit: 'cover', display: 'block' }}
                onClick={() => setActiveImage(complaint.imagePath)}
              />
              <div
                onClick={() => setActiveImage(complaint.imagePath)}
                style={{ textAlign: 'center', padding: '6px', fontSize: '12px', color: 'var(--primary-600)', backgroundColor: 'var(--slate-50)', cursor: 'pointer', fontWeight: 600 }}
              >
                Click to Enlarge
              </div>
            </div>
          </div>
        )}

        {/* Escalation Information Banner (if escalated) */}
        {complaint.escalated && (
          <div className="alert" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#581c87', marginBottom: '24px' }}>
            <AlertTriangle size={18} style={{ color: '#7e22ce' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>
                Automatically Escalated ({complaint.escalationCount} time{complaint.escalationCount > 1 ? 's' : ''})
              </div>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                {complaint.escalationReason}
              </div>
              {complaint.lastEscalatedAt && (
                <div style={{ fontSize: '11px', color: '#7e22ce', marginTop: '4px' }}>
                  Escalated on: {new Date(complaint.lastEscalatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resolution Report Card (when RESOLVED) */}
      {complaint.resolution && (
        <div className="card" style={{ borderColor: 'var(--success-border)', backgroundColor: '#fcfdfd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--success-text)' }}>
            <CheckCircle2 size={22} />
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Maintenance Resolution Report</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: complaint.resolution.proofImagePath ? '2fr 1fr' : '1fr', gap: '20px' }}>
            <div>
              <div className="stat-label">Technician Remarks</div>
              <p style={{ fontSize: '14px', color: 'var(--slate-800)', marginTop: '6px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {complaint.resolution.remarks}
              </p>

              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '12px', color: 'var(--slate-500)' }}>
                <div>
                  Resolved by: <strong style={{ color: 'var(--slate-800)' }}>{complaint.resolution.resolvedByName}</strong>
                </div>
                <div>
                  Completion Date: <strong style={{ color: 'var(--slate-800)' }}>{new Date(complaint.resolution.resolvedAt).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {complaint.resolution.proofImagePath && (
              <div>
                <div className="stat-label" style={{ marginBottom: '6px' }}>Resolution Proof Photo</div>
                <div style={{ display: 'inline-block', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <SecureImage
                    path={complaint.resolution.proofImagePath}
                    alt="Resolution proof"
                    style={{ width: '200px', height: '140px', objectFit: 'cover', display: 'block' }}
                    onClick={() => setActiveImage(complaint.resolution.proofImagePath)}
                  />
                  <div
                    onClick={() => setActiveImage(complaint.resolution.proofImagePath)}
                    style={{ textAlign: 'center', padding: '4px', fontSize: '11px', color: 'var(--primary-600)', backgroundColor: 'var(--slate-50)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View Proof
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status History Timeline */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Complaint Lifecycle Timeline
        </h2>

        {complaint.statusHistory?.length === 0 ? (
          <div style={{ color: 'var(--slate-500)', fontSize: '13px' }}>No timeline updates available.</div>
        ) : (
          <div className="timeline">
            {complaint.statusHistory?.map((h) => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-marker">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge status={h.newStatus} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-800)' }}>
                        {h.changedByName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--slate-400)' }}>
                        ({h.changedByRole})
                      </span>
                    </div>
                    <span className="timeline-time">
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                  {h.remarks && (
                    <div style={{ fontSize: '13px', color: 'var(--slate-600)', marginTop: '6px' }}>
                      {h.remarks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-view Image Modal */}
      <ImageModal
        isOpen={!!activeImage}
        imagePath={activeImage}
        title="Photo Evidence"
        onClose={() => setActiveImage(null)}
      />

      {/* Edit Complaint Modal (Student/Staff) */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Complaint</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={editForm.categoryId}
                      onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select
                      className="form-select"
                      value={editForm.locationId}
                      onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description <span className="required">*</span></label>
                  <textarea
                    rows={4}
                    className="form-control"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance: Start Work Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Initiate Repair Work</h3>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginBottom: '16px' }}>
                Moving status from <strong>PENDING</strong> to <strong>IN PROGRESS</strong> notifies users that a technician has commenced work on this issue.
              </p>
              <div className="form-group">
                <label className="form-label">Work Remarks / Plan (Optional)</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="e.g. Electrician dispatched to Classroom 204 with replacement capacitor."
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStartWork} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Start Work (Set In Progress)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance: Progress Note Modal */}
      {showProgressModal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Work Progress Update</h3>
              <button onClick={() => setShowProgressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddProgressNote}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Progress Note <span className="required">*</span></label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="e.g. Inspected faulty MCB board. Ordered replacement from central stores; arrival expected by 3 PM."
                    value={progressRemark}
                    onChange={(e) => setProgressRemark(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProgressModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Posting...' : 'Post Progress Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance: Resolve Modal */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Mark Complaint as Resolved</h3>
              <button onClick={() => setShowResolveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resolution Details <span className="required">*</span></label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Describe what was repaired or replaced, tests performed, and final confirmation..."
                    value={resolveRemark}
                    onChange={(e) => setResolveRemark(e.target.value)}
                    required
                  />
                  <div className="form-hint">Detailed resolution explanation is required.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Proof Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="form-control"
                    onChange={(e) => setProofImageFile(e.target.files[0])}
                  />
                  <div className="form-hint">Photo of repaired equipment or completed work (max 5 MB).</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Complete & Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

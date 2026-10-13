import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  X,
} from 'lucide-react';
import { masterDataApi } from '../../api/masterData';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { ConfirmModal } from '../../components/ConfirmModal';

export const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', active: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await masterDataApi.getLocations(true);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setLocations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campus locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', active: true });
    setShowAddModal(true);
  };

  const handleOpenEdit = (loc) => {
    setSelectedLocation(loc);
    setFormData({ name: loc.name, description: loc.description || '', active: loc.active });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await masterDataApi.createLocation(formData);
      setSuccessMsg(`Location "${formData.name}" added successfully.`);
      setShowAddModal(false);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) return;
    try {
      setSubmitting(true);
      setError('');
      await masterDataApi.updateLocation(selectedLocation.id, formData);
      setSuccessMsg(`Location "${formData.name}" updated successfully.`);
      setShowEditModal(false);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await masterDataApi.deleteLocation(deleteTarget.id);
      setSuccessMsg(`Location "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete location. Consider deactivating it instead.');
      setDeleteTarget(null);
    }
  };

  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">Campus Locations</h1>
          <p className="page-subtitle">
            Configure buildings, blocks, floors, and academic/hostel zones across the campus.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchLocations} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Location</span>
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

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="relative">
            <input
              type="text"
              className="form-control"
              placeholder="Filter locations by building, floor, or zone name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">Campus Location Directory ({locations.length})</h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Loading locations..." />
          ) : filteredLocations.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <MapPin size={40} className="text-muted mx-auto mb-2" />
              <p className="text-muted">No locations match your search query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Location / Facility</th>
                    <th>Description &amp; Landmark</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id}>
                      <td className="font-mono text-muted text-sm">#{loc.id}</td>
                      <td className="font-semibold text-dark">{loc.name}</td>
                      <td className="text-sm text-muted">{loc.description || '-'}</td>
                      <td>
                        {loc.active ? (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-danger flex items-center gap-1">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex justify-center gap-1">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleOpenEdit(loc)}
                            title="Edit Location"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-danger"
                            onClick={() => setDeleteTarget(loc)}
                            title="Delete Location"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">Add Campus Location</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label required">Location Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Science Block - 1st Floor Lab 2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Landmark</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Optional notes to help technicians locate the spot..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span className="font-medium text-sm">Active (available in complaint form)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && selectedLocation && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">Edit Location: {selectedLocation.name}</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label required">Location Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Landmark</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span className="font-medium text-sm">Active</span>
                  </label>
                  <span className="text-xs text-muted block mt-1">
                    Inactive locations won't be shown in the new complaint dropdown.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Location"
          message={`Are you sure you want to delete "${deleteTarget.name}"? If existing complaints are registered at this location, the server will prevent deletion. In that case, deactivate it instead.`}
          confirmText="Delete Location"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
export default LocationsPage;

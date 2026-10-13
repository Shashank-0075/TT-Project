import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { masterDataApi } from '../../api/masterData';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { ConfirmModal } from '../../components/ConfirmModal';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', active: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await masterDataApi.getCategories(true);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ name: '', description: '', active: true });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '', active: cat.active });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await masterDataApi.createCategory(formData);
      setSuccessMsg(`Category "${formData.name}" added successfully.`);
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      setSubmitting(true);
      setError('');
      await masterDataApi.updateCategory(selectedCategory.id, formData);
      setSuccessMsg(`Category "${formData.name}" updated successfully.`);
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await masterDataApi.deleteCategory(deleteTarget.id);
      setSuccessMsg(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category. Consider deactivating it instead.');
      setDeleteTarget(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">Complaint Categories</h1>
          <p className="page-subtitle">
            Configure infrastructure classifications (e.g. Electrical, Plumbing, Network, Furniture).
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchCategories} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Category</span>
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
              placeholder="Filter categories by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">Configured Categories ({categories.length})</h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Loading categories..." />
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <Layers size={40} className="text-muted mx-auto mb-2" />
              <p className="text-muted">No categories match your search.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="font-mono text-muted text-sm">#{cat.id}</td>
                      <td className="font-semibold text-dark">{cat.name}</td>
                      <td className="text-sm text-muted">{cat.description || '-'}</td>
                      <td>
                        {cat.active ? (
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
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-danger"
                            onClick={() => setDeleteTarget(cat)}
                            title="Delete Category"
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
              <h3 className="modal-title">Add Complaint Category</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label required">Category Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Electrical, Plumbing, HVAC"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Brief description of the issues covered by this category..."
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
                    <span className="font-medium text-sm">Active (available for new complaints)</span>
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
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && selectedCategory && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">Edit Category: {selectedCategory.name}</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label required">Category Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
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
                    Inactive categories won't appear in the student complaint submission form.
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
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"? Note: If complaints are linked to this category, the server will prevent deletion. In that case, deactivate it instead.`}
          confirmText="Delete Category"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
export default CategoriesPage;

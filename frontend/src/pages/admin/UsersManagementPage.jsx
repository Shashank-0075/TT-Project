import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Shield,
  Wrench,
  GraduationCap,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'STUDENT_STAFF',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    department: '',
    role: 'STUDENT_STAFF',
    active: true,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        active: activeFilter !== '' ? activeFilter === 'true' : undefined,
      };
      const res = await adminApi.getUsers(params);
      const data = res?.content !== undefined ? res : (res?.data || {});
      setUsers(data.content || []);
      setPagination({
        page: data.page || 0,
        size: data.size || 10,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setActiveFilter('');
    setPage(0);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      department: user.department || '',
      role: user.role || 'STUDENT_STAFF',
      active: user.active ?? true,
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setError('');
      await adminApi.createUser(createForm);
      setSuccessMsg(`User ${createForm.fullName} created successfully.`);
      setShowCreateModal(false);
      setCreateForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        role: 'STUDENT_STAFF',
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Please check details.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setEditSubmitting(true);
      setError('');
      await adminApi.updateUser(selectedUser.id, editForm);
      setSuccessMsg(`User ${editForm.fullName} updated successfully.`);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge badge-primary flex items-center gap-1">
            <Shield size={12} /> Admin
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="badge badge-warning flex items-center gap-1">
            <Wrench size={12} /> Maintenance
          </span>
        );
      case 'STUDENT_STAFF':
      default:
        return (
          <span className="badge badge-secondary flex items-center gap-1">
            <GraduationCap size={12} /> Student / Staff
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">User Account Management</h1>
          <p className="page-subtitle">
            Manage student, faculty staff, administration, and maintenance personnel credentials.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <UserPlus size={16} />
            <span>Add New User</span>
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

      {/* Filter / Search Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="md:col-span-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search by full name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                className="form-control form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="STUDENT_STAFF">Student / Staff</option>
                <option value="ADMIN">Administrator</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                className="form-control form-select"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
              <button type="submit" className="btn btn-primary">
                <Search size={16} />
              </button>
              {(search || roleFilter || activeFilter) && (
                <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">
            Registered Users ({pagination.totalElements} accounts)
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Fetching user accounts..." />
          ) : users.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <Users size={40} className="text-muted mx-auto mb-2" />
              <p className="text-muted">No user accounts found matching your query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>ID</th>
                    <th>User Details</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-mono text-muted text-sm">#{u.id}</td>
                      <td>
                        <div className="font-semibold text-dark">{u.fullName}</div>
                        <div className="text-xs text-muted font-mono">{u.email}</div>
                      </td>
                      <td className="text-sm">{u.department || '-'}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td className="text-sm font-mono">{u.phone || '-'}</td>
                      <td>
                        {u.active ? (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="badge badge-danger flex items-center gap-1">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="text-sm text-muted">{formatDate(u.createdAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User Profile"
                        >
                          <Edit2 size={15} />
                        </button>
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

      {/* ================= CREATE USER MODAL ================= */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">Create New User Account</h3>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. jdoe@campusfix.edu"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Initial Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Min 8 chars with letter & number (e.g. Pass1234)"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label required">User Role</label>
                    <select
                      className="form-control form-select"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      <option value="STUDENT_STAFF">Student / Staff</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createSubmitting}
                >
                  {createSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL ================= */}
      {showEditModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal modal-md">
            <div className="modal-header">
              <h3 className="modal-title">Edit User: {selectedUser.fullName}</h3>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    className="form-control"
                    value={selectedUser.email}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label required">Role</label>
                    <select
                      className="form-control form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="STUDENT_STAFF">Student / Staff</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    />
                    <span className="font-medium text-sm">Account Active</span>
                  </label>
                  <span className="text-xs text-muted block mt-1">
                    Inactive accounts cannot log in to the application.
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersManagementPage;

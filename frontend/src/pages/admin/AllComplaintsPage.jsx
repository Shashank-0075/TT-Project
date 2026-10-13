import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertOctagon,
  Clock,
  Layers,
  MapPin,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { masterDataApi } from '../../api/masterData';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const AllComplaintsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  // Load master data once
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          masterDataApi.getCategories(true),
          masterDataApi.getLocations(true),
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
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

      const res = await adminApi.getAllComplaints(params);
      const data = res?.content !== undefined ? res : (res?.data || {});
      setComplaints(data.content || []);
      setPagination({
        page: data.page,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints list.');
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
    // Sync to URL
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (categoryId) params.categoryId = categoryId;
    if (locationId) params.locationId = locationId;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setLocationId('');
    setPage(0);
    setSearchParams({});
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
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">All Campus Complaints</h1>
          <p className="page-subtitle">
            Comprehensive directory of all reported infrastructure complaints across the institution.
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

      {/* Filter and Search Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="form-group mb-0 md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title, description, or submitter..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="form-group mb-0">
                <select
                  className="form-control form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              {/* Priority */}
              <div className="form-group mb-0">
                <select
                  className="form-control form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Category */}
              <div className="form-group mb-0">
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

              {/* Location */}
              <div className="form-group mb-0">
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

              {/* Action Buttons */}
              <div className="flex gap-2 md:col-span-2 justify-end">
                <button type="submit" className="btn btn-primary">
                  <Filter size={16} />
                  <span>Apply Filters</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetFilters}
                >
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
            Complaints List ({pagination.totalElements} records found)
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Fetching complaints..." />
          ) : complaints.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <FileText size={40} className="text-muted mx-auto mb-2" />
              <p className="text-muted">No complaints match your filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Complaint Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted By</th>
                    <th>Reported Date</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
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
                      <td>
                        <span className="badge badge-secondary">{c.categoryName}</span>
                      </td>
                      <td>
                        <span className="text-sm">{c.locationName}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="text-sm">
                        <div className="font-medium">{c.userName || 'Student/Staff'}</div>
                        <div className="text-muted text-xs">{c.userEmail}</div>
                      </td>
                      <td className="text-sm text-muted">
                        {formatDate(c.createdAt)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link
                          to={`/complaints/${c.id}`}
                          className="btn btn-sm btn-ghost"
                          title="View Details"
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
export default AllComplaintsPage;

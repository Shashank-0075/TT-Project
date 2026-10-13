import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, FileText, PlusCircle, ArrowUpDown } from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { masterDataApi } from '../../api/masterData';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    categoryId: '',
    locationId: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    masterDataApi.getCategories().then(setCategories).catch(() => {});
    masterDataApi.getLocations().then(setLocations).catch(() => {});
  }, []);

  useEffect(() => {
    fetchComplaints(pageInfo.page);
  }, [filters.status, filters.priority, filters.categoryId, filters.locationId, filters.sortBy, filters.sortDir]);

  const fetchComplaints = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: pageInfo.size,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        categoryId: filters.categoryId || undefined,
        locationId: filters.locationId || undefined,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      };
      const res = await complaintApi.getMyComplaints(params);
      setComplaints(res.content || []);
      setPageInfo({
        page: res.page,
        size: res.size,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
      });
    } catch (err) {
      setError('Failed to fetch complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      categoryId: '',
      locationId: '',
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
    fetchComplaints(0);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--slate-900)' }}>My Submitted Complaints</h1>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
            Track the live progress and resolution remarks of all complaints you reported
          </p>
        </div>
        <Link to="/student/submit" className="btn btn-primary">
          <PlusCircle size={16} /> Submit Complaint
        </Link>
      </div>

      <ErrorAlert message={error} />

      {/* Filter Toolbar */}
      <form onSubmit={handleSearchSubmit} className="filter-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            name="search"
            className="form-control"
            placeholder="Search by ID (#12), title, description..."
            value={filters.search}
            onChange={handleFilterChange}
            style={{ paddingLeft: '34px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
        </div>

        <select name="status" className="form-select filter-select" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select name="priority" className="form-select filter-select" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select name="categoryId" className="form-select filter-select" value={filters.categoryId} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select name="locationId" className="form-select filter-select" value={filters.locationId} onChange={handleFilterChange}>
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <button type="submit" className="btn btn-secondary btn-sm" title="Apply Search">
          <Search size={14} /> Search
        </button>

        <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters} title="Reset Filters">
          <RefreshCw size={14} /> Reset
        </button>
      </form>

      {/* Complaints Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading complaints..." />
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <div className="empty-state-title">No complaints found</div>
            <div className="empty-state-desc">
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'You have not submitted any complaints yet.'}
            </div>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Complaint Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>#{c.id}</td>
                      <td>
                        <Link to={`/student/complaint/${c.id}`} style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {c.title}
                        </Link>
                      </td>
                      <td>{c.categoryName}</td>
                      <td>{c.locationName}</td>
                      <td>
                        <PriorityBadge priority={c.priority} escalated={c.escalated} escalationCount={c.escalationCount} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/student/complaint/${c.id}`} className="btn btn-secondary btn-sm">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pageInfo.page}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              size={pageInfo.size}
              onPageChange={(newPage) => fetchComplaints(newPage)}
            />
          </>
        )}
      </div>
    </div>
  );
};

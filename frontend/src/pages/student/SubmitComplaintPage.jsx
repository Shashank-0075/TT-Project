import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Image as ImageIcon, X, AlertCircle, Sparkles, UploadCloud, ShieldAlert, Check } from 'lucide-react';
import { complaintApi } from '../../api/complaints';
import { masterDataApi } from '../../api/masterData';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const SubmitComplaintPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryParam = queryParams.get('category');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    priority: 'LOW',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, locs] = await Promise.all([
        masterDataApi.getCategories(false),
        masterDataApi.getLocations(false),
      ]);
      setCategories(cats);
      setLocations(locs);

      let chosenCategory = cats.length > 0 ? cats[0].id : '';
      if (initialCategoryParam) {
        const found = cats.find((c) => String(c.id) === String(initialCategoryParam));
        if (found) chosenCategory = found.id;
      }

      setFormData((prev) => ({
        ...prev,
        categoryId: chosenCategory,
        locationId: locs.length > 0 ? locs[0].id : '',
      }));
    } catch (err) {
      setError('Failed to load categories and locations. Ensure backend is running.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePrioritySelect = (p) => {
    setFormData((prev) => ({ ...prev, priority: p }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image is too large. Maximum file size is 5 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, WEBP).');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.title || formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('categoryId', formData.categoryId);
      data.append('locationId', formData.locationId);
      data.append('priority', formData.priority);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const created = await complaintApi.create(data);
      navigate(`/complaints/${created.id}`);
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <LoadingSpinner text="Loading complaint form..." />;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="card" style={{ borderTop: '4px solid var(--primary-600)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="card-header">
          <div>
            <h1 className="card-title" style={{ fontSize: '20px' }}>Register Campus Maintenance Complaint</h1>
            <div className="card-subtitle">
              Provide specific issue details and optional photo evidence to expedite maintenance resolution.
            </div>
          </div>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {/* Complaint Title */}
          <div className="form-group">
            <label className="form-label">Complaint Title <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Broken ceiling fan / projector not powering on"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              required
            />
            {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
            <div className="form-hint">Brief, descriptive summary of the problem (5–150 characters).</div>
          </div>

          {/* Category & Location Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <select
                name="categoryId"
                className="form-control"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Location <span className="required">*</span></label>
              <select
                name="locationId"
                className="form-control"
                value={formData.locationId}
                onChange={handleChange}
                required
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modern Interactive Priority Selection Cards */}
          <div className="form-group">
            <label className="form-label">Priority Level <span className="required">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {/* LOW */}
              <div
                onClick={() => handlePrioritySelect('LOW')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: formData.priority === 'LOW' ? '2px solid var(--slate-600)' : '1px solid var(--slate-300)',
                  backgroundColor: formData.priority === 'LOW' ? 'var(--slate-100)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge badge-priority-low">LOW</span>
                  {formData.priority === 'LOW' && <Check size={16} color="var(--slate-700)" />}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '4px' }}>
                  Minor inconvenience, aesthetic or non-urgent repairs.
                </div>
              </div>

              {/* MEDIUM */}
              <div
                onClick={() => handlePrioritySelect('MEDIUM')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: formData.priority === 'MEDIUM' ? '2px solid var(--warning-dot)' : '1px solid var(--slate-300)',
                  backgroundColor: formData.priority === 'MEDIUM' ? 'var(--warning-bg)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge badge-priority-medium">MEDIUM</span>
                  {formData.priority === 'MEDIUM' && <Check size={16} color="var(--warning-dot)" />}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '4px' }}>
                  Affects daily classroom instruction, lab, or hostel routine.
                </div>
              </div>

              {/* HIGH */}
              <div
                onClick={() => handlePrioritySelect('HIGH')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: formData.priority === 'HIGH' ? '2px solid var(--danger-dot)' : '1px solid var(--slate-300)',
                  backgroundColor: formData.priority === 'HIGH' ? 'var(--danger-bg)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge badge-priority-high">HIGH</span>
                  {formData.priority === 'HIGH' && <Check size={16} color="var(--danger-dot)" />}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '4px' }}>
                  Urgent hazard, water flooding, power outage, or safety risk.
                </div>
              </div>
            </div>
            <div className="form-hint" style={{ marginTop: '8px' }}>
              Note: Unresolved tickets automatically escalate across SLA cycles (Low &rarr; Medium &rarr; High) if neglected.
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description <span className="required">*</span></label>
            <textarea
              name="description"
              rows={5}
              className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
              placeholder="Describe the exact location (e.g. 2nd floor, Lab 3, 3rd row right), problem symptoms, and frequency..."
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              required
            />
            {fieldErrors.description && <div className="invalid-feedback">{fieldErrors.description}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="form-hint">Provide clear landmarks to help field technicians locate the issue quickly.</span>
              <span style={{ fontSize: '12px', color: 'var(--slate-400)', fontWeight: 500 }}>{formData.description.length} / 2000</span>
            </div>
          </div>

          {/* Photo Attachment Zone */}
          <div className="form-group">
            <label className="form-label">Attach Photo Evidence (Optional)</label>
            {!imagePreview ? (
              <div className="upload-dropzone">
                <input
                  type="file"
                  id="complaint-image-input"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="complaint-image-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={36} color="var(--primary-600)" />
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--primary-600)' }}>
                    Click or drag photo here to upload
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--slate-500)' }}>
                    PNG, JPG, or WEBP up to 5 MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="upload-preview-container">
                <img src={imagePreview} alt="Preview" className="upload-preview-img" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--slate-900)' }}>{imageFile?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                    {(imageFile?.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to upload
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger-dot)' }}
                  title="Remove image"
                >
                  <X size={15} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '32px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '160px' }}
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send size={16} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

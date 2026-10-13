import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert } from '../components/ErrorAlert';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleSelect = (roleName) => {
    setFormData((prev) => ({ ...prev, role: roleName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        department: formData.department || null,
        role: formData.role,
      });
      navigate('/login?registered=true');
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      }
      setError(err.response?.data?.message || 'Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px', borderTop: '4px solid var(--primary-600)', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-logo" style={{ margin: '0 auto 14px', width: '48px', height: '48px', fontSize: '20px' }}>
            CF
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
            Create Your CampusFix Account
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Report, monitor, and resolve campus maintenance requests
          </p>
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {/* Interactive Role Selector Cards */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">I am registering as: <span className="required">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                onClick={() => handleRoleSelect('STUDENT')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: formData.role === 'STUDENT' ? '2px solid var(--primary-600)' : '1px solid var(--slate-300)',
                  backgroundColor: formData.role === 'STUDENT' ? 'var(--primary-50)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.role === 'STUDENT' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: formData.role === 'STUDENT' ? 'var(--primary-600)' : 'var(--slate-100)',
                    color: formData.role === 'STUDENT' ? '#ffffff' : 'var(--slate-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--slate-900)' }}>Student</div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Hostel &amp; Classroom</div>
                </div>
              </div>

              <div
                onClick={() => handleRoleSelect('STAFF')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: formData.role === 'STAFF' ? '2px solid var(--primary-600)' : '1px solid var(--slate-300)',
                  backgroundColor: formData.role === 'STAFF' ? 'var(--primary-50)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.role === 'STAFF' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: formData.role === 'STAFF' ? 'var(--primary-600)' : 'var(--slate-100)',
                    color: formData.role === 'STAFF' ? '#ffffff' : 'var(--slate-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--slate-900)' }}>Faculty / Staff</div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Department &amp; Labs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. rahul@campusfix.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <input
                type="text"
                name="department"
                className="form-control"
                placeholder="e.g. CSE / IT"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <p className="form-hint" style={{ marginBottom: '20px' }}>
            Password must be 8+ characters with at least one letter and one number.
          </p>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register {formData.role === 'STUDENT' ? 'Student' : 'Faculty'} Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--slate-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

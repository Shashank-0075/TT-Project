import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, KeyRound, Mail, AlertCircle, Shield, Wrench, GraduationCap, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorAlert } from '../components/ErrorAlert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const expired = query.get('expired');
  const registered = query.get('registered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      // Direct user to appropriate role dashboard
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'MAINTENANCE') {
        navigate('/maintenance/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '48px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px', borderTop: '4px solid var(--primary-600)', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-logo" style={{ margin: '0 auto 14px', width: '48px', height: '48px', fontSize: '20px' }}>
            CF
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
            Sign In to CampusFix
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Smart College Complaint &amp; Maintenance Portal
          </p>
        </div>

        {expired && (
          <div className="alert alert-info">
            Your session has expired. Please sign in again.
          </div>
        )}

        {registered && (
          <div className="alert alert-success">
            Registration successful! Please sign in with your new account.
          </div>
        )}

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. student1@campusfix.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--slate-500)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
            Register as Student or Staff
          </Link>
        </div>

        {/* 1-Click Viva Demo Accounts Section */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--primary-600)" /> 1-Click Demo Login
            </span>
            <span style={{ fontSize: '11px', color: 'var(--slate-400)' }}>Faculty Evaluation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Admin */}
            <button
              type="button"
              onClick={() => fillCredentials('admin@campusfix.edu', 'Admin@123')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                border: '1px solid #e9d5ff',
                background: '#faf5ff',
                color: '#6b21a8',
              }}
              title="admin@campusfix.edu / Admin@123"
            >
              <Shield size={15} />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>Admin</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Full Control</div>
              </div>
            </button>

            {/* Maintenance */}
            <button
              type="button"
              onClick={() => fillCredentials('maintenance1@campusfix.edu', 'Maint@123')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                border: '1px solid var(--warning-border)',
                background: 'var(--warning-bg)',
                color: 'var(--warning-text)',
              }}
              title="maintenance1@campusfix.edu / Maint@123"
            >
              <Wrench size={15} />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>Maintenance</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Field Staff</div>
              </div>
            </button>

            {/* Student */}
            <button
              type="button"
              onClick={() => fillCredentials('student1@campusfix.edu', 'Student@123')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                border: '1px solid var(--primary-200)',
                background: 'var(--primary-50)',
                color: 'var(--primary-700)',
              }}
              title="student1@campusfix.edu / Student@123"
            >
              <GraduationCap size={15} />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>Student</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Student Portal</div>
              </div>
            </button>

            {/* Staff */}
            <button
              type="button"
              onClick={() => fillCredentials('staff1@campusfix.edu', 'Student@123')}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                border: '1px solid var(--info-border)',
                background: 'var(--info-bg)',
                color: 'var(--info-text)',
              }}
              title="staff1@campusfix.edu / Student@123"
            >
              <Briefcase size={15} />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>Faculty / Staff</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Staff Portal</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

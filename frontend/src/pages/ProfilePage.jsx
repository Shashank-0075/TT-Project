import React, { useState } from 'react';
import { User, Lock, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { ErrorAlert } from '../components/ErrorAlert';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const updated = await authApi.updateProfile(profileData);
      updateUser(updated);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--slate-900)' }}>{user?.fullName}</h2>
            <div style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>{user?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span className="badge badge-priority-low" style={{ textTransform: 'none' }}>
                <Shield size={12} /> {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div style={{ marginBottom: '32px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> Personal Details
          </h3>

          <ErrorAlert message={profileError} onClose={() => setProfileError('')} />
          {profileSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={16} /> {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} /> Change Password
          </h3>

          <ErrorAlert message={pwError} onClose={() => setPwError('')} />
          {pwSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={16} /> {pwSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password <span className="required">*</span></label>
              <input
                type="password"
                className="form-control"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">New Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 8 chars"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary" disabled={pwLoading}>
              {pwLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

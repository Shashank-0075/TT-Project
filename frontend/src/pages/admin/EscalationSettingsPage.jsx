import React, { useEffect, useState } from 'react';
import {
  Settings,
  Clock,
  Play,
  Save,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Info,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export const EscalationSettingsPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [triggerResult, setTriggerResult] = useState('');

  // Form values
  const [formData, setFormData] = useState({
    lowToMediumDays: 3,
    mediumToHighDays: 4,
    enabled: true,
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getEscalationConfig();
      const data = res?.lowToMediumDays !== undefined ? res : (res?.data || {});
      setConfig(data);
      setFormData({
        lowToMediumDays: data.lowToMediumDays || 3,
        mediumToHighDays: data.mediumToHighDays || 4,
        enabled: data.enabled ?? true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load escalation configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');
      const res = await adminApi.updateEscalationConfig(formData);
      const data = res?.lowToMediumDays !== undefined ? res : (res?.data || {});
      setConfig(data);
      setSuccessMsg('Escalation configuration saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update escalation settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRunImmediate = async () => {
    try {
      setTriggering(true);
      setTriggerResult('');
      const res = await adminApi.triggerEscalationCheck();
      setTriggerResult(res.message || 'Escalation check completed.');
      await fetchConfig();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute immediate escalation check.');
    } finally {
      setTriggering(false);
    }
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

  if (loading && !config) {
    return <LoadingSpinner text="Loading escalation policy..." fullHeight />;
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">Automatic Priority Escalation Policy</h1>
          <p className="page-subtitle">
            Configure dynamic threshold periods for elevating overdue unresolved campus complaints.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={fetchConfig} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRunImmediate}
            disabled={triggering}
          >
            <Play size={16} />
            <span>{triggering ? 'Scanning...' : 'Trigger Scan Now'}</span>
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

      {triggerResult && (
        <div className="alert alert-info mb-6 flex justify-between items-center">
          <div>
            <strong>Manual Trigger Result:</strong> {triggerResult}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => setTriggerResult('')}>
            &times;
          </button>
        </div>
      )}

      {/* Escalation Lifecycle Visualizer */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            Automatic Priority Escalation Workflow (Option A)
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-light border">
              <span className="badge badge-success mb-2">Stage 1: Initial</span>
              <h4 className="font-semibold text-lg text-dark mb-1">LOW Priority</h4>
              <p className="text-muted text-xs">
                A newly reported complaint with default or user-selected low priority begins tracking against the SLA clock.
              </p>
              <div className="mt-3 flex justify-center text-primary font-mono text-xs font-semibold">
                After {formData.lowToMediumDays} days unresolved &darr;
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-light border">
              <span className="badge badge-warning mb-2">Stage 2: Elevated</span>
              <h4 className="font-semibold text-lg text-dark mb-1">MEDIUM Priority</h4>
              <p className="text-muted text-xs">
                Automatically bumped to Medium. Maintenance personnel see higher visibility in work order queues.
              </p>
              <div className="mt-3 flex justify-center text-primary font-mono text-xs font-semibold">
                After +{formData.mediumToHighDays} further days &darr;
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-light border" style={{ borderColor: 'var(--danger-color)' }}>
              <span className="badge badge-danger mb-2">Stage 3: Critical</span>
              <h4 className="font-semibold text-lg text-danger mb-1">HIGH Priority</h4>
              <p className="text-muted text-xs">
                Elevated to top priority with an escalation count recorded. Triggered on the Admin dashboard alert banner.
              </p>
              <div className="mt-3 flex justify-center text-success font-mono text-xs font-semibold">
                Resolved issues are NEVER escalated.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                Configure Escalation Thresholds
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveConfig} className="flex flex-col gap-5">
                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <span className="font-semibold text-dark">
                      Enable Automated Background Priority Escalation
                    </span>
                  </label>
                  <span className="text-xs text-muted block mt-1">
                    When active, the Spring Boot scheduled task checks complaints daily and adjusts priority automatically.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label required">
                    Days before LOW escalates to MEDIUM
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      required
                      className="form-control"
                      style={{ maxWidth: '140px' }}
                      value={formData.lowToMediumDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lowToMediumDays: parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                    <span className="text-muted text-sm font-medium">days unresolved</span>
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    If an unresolved complaint remains in LOW priority for this many days, it automatically advances to MEDIUM.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label required">
                    Days before MEDIUM escalates to HIGH
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      required
                      className="form-control"
                      style={{ maxWidth: '140px' }}
                      value={formData.mediumToHighDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mediumToHighDays: parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                    <span className="text-muted text-sm font-medium">days unresolved</span>
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    Additional days in MEDIUM before advancing to HIGH priority.
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Audit Meta Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              Policy Status &amp; Audit
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted uppercase font-bold tracking-wider">Engine Status</label>
                <div className="mt-1">
                  {config?.enabled ? (
                    <span className="badge badge-success flex items-center gap-1 w-fit">
                      <CheckCircle size={12} /> Active &amp; Monitoring
                    </span>
                  ) : (
                    <span className="badge badge-danger flex items-center gap-1 w-fit">
                      <AlertOctagon size={12} /> Suspended
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted uppercase font-bold tracking-wider">Schedule Interval</label>
                <p className="font-semibold text-dark mt-1 text-sm">
                  Runs daily at midnight (00:00:00) server time
                </p>
                <p className="text-xs text-muted">
                  Configured via Spring <code>@Scheduled</code> cron trigger.
                </p>
              </div>

              <div>
                <label className="text-xs text-muted uppercase font-bold tracking-wider">Last Modified By</label>
                <p className="font-semibold text-dark mt-1 text-sm">
                  {config?.updatedByName || 'System Default'}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted uppercase font-bold tracking-wider">Last Updated At</label>
                <p className="font-semibold text-dark mt-1 text-sm font-mono">
                  {formatDate(config?.updatedAt)}
                </p>
              </div>

              <div className="p-3 bg-light rounded text-xs text-muted">
                <strong>Viva Note:</strong> The escalation logic is completely configurable without recompiling code.
                Admins can change thresholds dynamically in MySQL database.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EscalationSettingsPage;

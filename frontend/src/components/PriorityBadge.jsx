import React from 'react';
import { AlertCircle } from 'lucide-react';

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', className: 'badge-priority-low' },
  MEDIUM: { label: 'Medium', className: 'badge-priority-medium' },
  HIGH: { label: 'High', className: 'badge-priority-high' },
};

export const PriorityBadge = ({ priority, escalated = false, escalationCount = 0 }) => {
  const config = PRIORITY_CONFIG[priority] || { label: priority, className: 'badge-priority-low' };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
      {escalated && (
        <span
          className="badge badge-escalated"
          title={`Automatically escalated ${escalationCount} time(s)`}
        >
          <AlertCircle size={10} />
          Escalated {escalationCount > 1 ? `(${escalationCount}x)` : ''}
        </span>
      )}
    </div>
  );
};

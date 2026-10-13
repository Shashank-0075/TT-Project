import React from 'react';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', className: 'badge-pending' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in_progress' },
  RESOLVED: { label: 'Resolved', className: 'badge-resolved' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-pending' };
  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
};
